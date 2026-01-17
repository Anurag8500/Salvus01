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
    status: { type: String },
    deploymentTx: { type: String }
  },
  { strict: false }
);

const Campaign =
  mongoose.models.Campaign || mongoose.model("Campaign", CampaignSchema);

const IndexerStateSchema = new mongoose.Schema(
  {
    escrowAddress: { type: String, required: true },
    indexerType: { type: String, required: true },
    lastScannedBlock: { type: Number, required: true }
  },
  { strict: false }
);

IndexerStateSchema.index({ escrowAddress: 1, indexerType: 1 }, { unique: true });

const IndexerState =
  mongoose.models.IndexerState ||
  mongoose.model("IndexerState", IndexerStateSchema);

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
const isScanning: Record<string, boolean> = {};
const watcherStarted: Record<string, boolean> = {};
const MAX_BLOCKS = 2000;

async function main() {
  await connectDB();

  if (!process.env.WS_RPC_URL) {
    throw new Error("Missing WS_RPC_URL in environment variables");
  }

  const provider = new ethers.WebSocketProvider(process.env.WS_RPC_URL);

  console.log("Donation Indexer started (localhost, live-only)");

  setInterval(async () => {
    try {
      const campaigns = await Campaign.find({
        escrowAddress: { $exists: true, $ne: "" },
        status: "Active"
      });

      for (const camp of campaigns) {
        const escrow = camp.escrowAddress;
        if (!escrow || watcherStarted[escrow]) continue;

        console.log(
          `Watching campaign (donations): ${camp.name || "Unnamed"} (${escrow})`
        );
        // Persistent indexing state ensures we can resume after restarts without losing events.
        const indexerType = "donations";
        let state = await IndexerState.findOne({ escrowAddress: escrow, indexerType });
        if (!state) {
          let startBlock = 0;
          if ((camp as any).deploymentTx) {
            const receipt = await provider.getTransactionReceipt(
              (camp as any).deploymentTx as string
            );
            if (receipt && receipt.blockNumber != null) {
              startBlock = Math.max(0, Number(receipt.blockNumber) - 1);
            } else {
              const currentBlock = await provider.getBlockNumber();
              startBlock = currentBlock;
            }
          } else {
            const currentBlock = await provider.getBlockNumber();
            startBlock = currentBlock;
          }
          state = await IndexerState.create({
            escrowAddress: escrow,
            indexerType,
            lastScannedBlock: startBlock
          });
        }

        lastScannedBlock[escrow] = state.lastScannedBlock;

        startBlockWatcher(escrow, provider);
        watcherStarted[escrow] = true;
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

  // NOTE: Polling-based block scanning is used instead of provider.on("block")
  // because WebSocket subscriptions can silently drop in long-running processes.
  setInterval(async () => {
    if (isScanning[escrow]) return;
    isScanning[escrow] = true;

    try {
      const lastBlock = lastScannedBlock[escrow] ?? 0;
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = lastBlock + 1;
      const toBlock = currentBlock;
      if (toBlock < fromBlock) return;

      const effectiveToBlock = Math.min(toBlock, fromBlock + MAX_BLOCKS);

      const events = await contract.queryFilter(
        "Donation",
        fromBlock,
        effectiveToBlock
      );

      for (const event of events) {
        if (!("args" in event)) continue;

        const { donor, amount, timestamp } = event.args;
        const txHash = event.transactionHash;
        const blockNumber = event.blockNumber;
        const amountVal = ethers.formatUnits(amount, 6);

        const exists = await Donation.findOne({ txHash });
        if (exists) continue;

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
        // NOTE: fundsRaised is a denormalized cache.
        // The Donation collection remains the source of truth.

        console.log("Donation indexed:", txHash);
      }

      lastScannedBlock[escrow] = effectiveToBlock;
      await IndexerState.findOneAndUpdate(
        { escrowAddress: escrow, indexerType: "donations" },
        { lastScannedBlock: effectiveToBlock },
        { upsert: true }
      );
    } catch (err) {
      console.error("Donation block scan error:", err);
    } finally {
      isScanning[escrow] = false;
    }
  }, 3000);
}

/* -------------------------------------------------------------------------- */
/*                                   START                                    */
/* -------------------------------------------------------------------------- */

main().catch((err) => {
  console.error("Donation indexer fatal error:", err);
  process.exit(1);
});
