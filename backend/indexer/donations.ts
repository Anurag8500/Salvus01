import { ethers } from "ethers";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

/* -------------------------------------------------------------------------- */
/*                                MONGOOSE MODELS                             */
/* -------------------------------------------------------------------------- */

import Donation from "../../models/Donation";

const CampaignSchema = new mongoose.Schema(
  {
    escrowAddress: { type: String },
    fundsRaised: { type: Number, default: 0 },
    status: { type: String }
  },
  { strict: false }
);

const Campaign =
  mongoose.models.Campaign || mongoose.model("Campaign", CampaignSchema);

/* -------------------------------------------------------------------------- */
/*                               DB CONNECTION                                */
/* -------------------------------------------------------------------------- */

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/salvus";

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected");
}

/* -------------------------------------------------------------------------- */
/*                               CONTRACT CONFIG                              */
/* -------------------------------------------------------------------------- */

const CAMPAIGN_ABI = [
  "event Donation(address indexed donor, uint256 amount, uint256 timestamp)"
];

/* -------------------------------------------------------------------------- */
/*                                   INDEXER                                  */
/* -------------------------------------------------------------------------- */

const lastScannedBlock: Record<string, number> = {};

async function main() {
  await connectDB();

  if (!process.env.WS_RPC_URL_AMOY) {
    throw new Error("Missing WS_RPC_URL_AMOY in environment variables");
  }

  const provider = new ethers.WebSocketProvider(process.env.WS_RPC_URL_AMOY);

  console.log("Donation Indexer started (Amoy, live-only)");

  const watchedEscrows = new Set<string>();

  setInterval(async () => {
    try {
      const campaigns = await Campaign.find({
        escrowAddress: { $exists: true, $ne: "" },
        status: "Active"
      });

      for (const camp of campaigns) {
        const escrow = camp.escrowAddress;
        if (!escrow || watchedEscrows.has(escrow)) continue;

        console.log(`Watching campaign (donations): ${camp.name || "Unnamed"} (${escrow})`);

        // 👉 START FROM LATEST BLOCK (NO BACKFILL)
        const latestBlock = await provider.getBlockNumber();
        lastScannedBlock[escrow] = latestBlock;

        startBlockWatcher(escrow, provider);
        watchedEscrows.add(escrow);
      }
    } catch (err) {
      console.error("Error polling campaigns:", err);
    }
  }, 5000);
}

/* -------------------------------------------------------------------------- */
/*                          BLOCK-BASED EVENT WATCHER                         */
/* -------------------------------------------------------------------------- */

function startBlockWatcher(
  escrow: string,
  provider: ethers.WebSocketProvider
) {
  const contract = new ethers.Contract(escrow, CAMPAIGN_ABI, provider);

  provider.on("block", async (currentBlock) => {
    try {
      const lastBlock = lastScannedBlock[escrow];
      if (currentBlock <= lastBlock) return;

      const events = await contract.queryFilter(
        "Donation",
        lastBlock + 1,
        currentBlock
      );

      for (const event of events) {
        if (!("args" in event)) continue;

        const { donor, amount, timestamp } = event.args;
        const txHash = event.transactionHash;
        const blockNumber = event.blockNumber;
        const amountVal = ethers.formatUnits(amount, 6);

        const exists = await Donation.findOne({ txHash });
        if (exists) continue;

        // Find user by wallet address (case-insensitive)
        const user = await (await import("../../models/User")).default.findOne({ walletAddress: donor.toLowerCase() });
        if (!user) {
          console.warn(`No user found for wallet ${donor}, skipping donation index.`);
          continue;
        }
        await Donation.create({
          userId: user._id,
          campaignAddress: escrow,
          donor,
          amount: amount.toString(),
          amountNumber: Number(amountVal),
          timestamp: new Date(Number(timestamp) * 1000),
          txHash,
          blockNumber
        });

        await Campaign.updateOne(
          { escrowAddress: escrow },
          { $inc: { fundsRaised: Number(amountVal) } }
        );

        console.log("Donation indexed:", txHash);
      }

      lastScannedBlock[escrow] = currentBlock;
    } catch (err) {
      console.error("Donation block scan error:", err);
    }
  });
}

/* -------------------------------------------------------------------------- */
/*                                   START                                    */
/* -------------------------------------------------------------------------- */

main().catch((err) => {
  console.error("Donation indexer fatal error:", err);
  process.exit(1);
});
