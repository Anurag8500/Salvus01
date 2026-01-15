import { ethers } from "ethers";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

/* -------------------------------------------------------------------------- */
/*                                MONGOOSE MODELS                             */
/* -------------------------------------------------------------------------- */

import PaymentRelease from "../../models/PaymentRelease";

const CampaignSchema = new mongoose.Schema(
  {
    escrowAddress: { type: String },
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
  "event PaymentReleased(bytes32 indexed requestHash, bytes32 indexed beneficiaryHash, address vendor, bytes32 category, uint256 amount, bytes32 proofHash)"
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

  console.log("Payout Indexer started (Amoy, live-only)");

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

        console.log(`Watching campaign (payouts): ${camp.name || "Unnamed"} (${escrow})`);

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
        "PaymentReleased",
        lastBlock + 1,
        currentBlock
      );

      for (const event of events) {
        if (!("args" in event)) continue;

        const {
          requestHash,
          beneficiaryHash,
          vendor,
          category,
          amount,
          proofHash
        } = event.args;

        const txHash = event.transactionHash;
        const blockNumber = event.blockNumber;
        const amountVal = ethers.formatUnits(amount, 6);

        const exists = await PaymentRelease.findOne({ txHash });
        if (exists) continue;

        const block = await provider.getBlock(blockNumber);
        const timestamp = block
          ? new Date(Number(block.timestamp) * 1000)
          : new Date();

        // Compute totalCampaignDonationsAtRelease (snapshot)
        const Donation = (await import("../../models/Donation")).default;
        const donations = await Donation.find({ campaignAddress: escrow, timestamp: { $lte: timestamp } });
        const totalCampaignDonationsAtRelease = donations.reduce((sum: number, d: any) => sum + (d.amountNumber || 0), 0);
        let attributable = true;
        if (!totalCampaignDonationsAtRelease || isNaN(totalCampaignDonationsAtRelease) || totalCampaignDonationsAtRelease <= 0) {
          console.warn(`Release with zero donations — skipping attribution for ${txHash}`);
          attributable = false;
        }
        let decodedCategory = '';
        try {
          decodedCategory = category ? ethers.decodeBytes32String(category) : '';
        } catch {
          decodedCategory = '';
        }
        await PaymentRelease.create({
          campaignAddress: escrow,
          requestId: requestHash,
          vendorAddress: vendor,
          beneficiaryId: beneficiaryHash,
          category: decodedCategory,
          amountNumber: Number(amountVal),
          timestamp,
          txHash,
          totalCampaignDonationsAtRelease,
          attributable
        });
        console.log("PaymentRelease indexed:", txHash);
      }

      lastScannedBlock[escrow] = currentBlock;
    } catch (err) {
      console.error("Payout block scan error:", err);
    }
  });
}

/* -------------------------------------------------------------------------- */
/*                                   START                                    */
/* -------------------------------------------------------------------------- */

main().catch((err) => {
  console.error("Payout indexer fatal error:", err);
  process.exit(1);
});
  