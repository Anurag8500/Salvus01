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
  "event PaymentReleased(bytes32 indexed requestHash, bytes32 indexed beneficiaryHash, address vendor, bytes32 category, uint256 amount, bytes32 proofHash)"
];

/* -------------------------------------------------------------------------- */
/*                                   INDEXER                                  */
/* -------------------------------------------------------------------------- */

const lastScannedBlock: Record<string, number> = {};
const isScanning: Record<string, boolean> = {};
const watcherStarted: Record<string, boolean> = {};
const MAX_BLOCKS = 2000;
const campaignCategoryCache: Record<string, string[]> = {};
const campaignIdCache: Record<string, string> = {};
const beneficiaryHashCache: Record<
  string,
  Record<string, { beneficiaryId: string; beneficiaryMongoId: mongoose.Types.ObjectId }>
> = {};

async function main() {
  await connectDB();

  if (!process.env.WS_RPC_URL) {
    throw new Error("Missing WS_RPC_URL in environment variables");
  }

  const provider = new ethers.WebSocketProvider(process.env.WS_RPC_URL);
  console.log("Payout Indexer started (localhost, live-only)");

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
          `Watching campaign (payouts): ${camp.name || "Unnamed"} (${escrow})`
        );
        // Persistent indexing state ensures we can resume after restarts without losing events.
        const indexerType = "payouts";
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
        "PaymentReleased",
        fromBlock,
        effectiveToBlock
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

        const Donation = (await import("../../models/Donation")).default;
        const donations = await Donation.find({ campaignAddress: escrow, timestamp: { $lte: timestamp } });
        const totalCampaignDonationsAtRelease = donations.reduce((sum: number, d: any) => sum + (d.amountNumber || 0), 0);
        let attributable = true;
        if (!totalCampaignDonationsAtRelease || isNaN(totalCampaignDonationsAtRelease) || totalCampaignDonationsAtRelease <= 0) {
          console.warn(`Release with zero donations — skipping attribution for ${txHash}`);
          attributable = false;
        }

        let campaignId = campaignIdCache[escrow];
        let categories = campaignCategoryCache[escrow];
        if (!campaignId || !categories) {
          const campaignDoc = await Campaign.findOne({ escrowAddress: escrow });
          if (!campaignDoc) {
            throw new Error(`Campaign not found for escrow ${escrow}`);
          }
          campaignId = String(campaignDoc._id);
          campaignIdCache[escrow] = campaignId;
          if (Array.isArray((campaignDoc as any).categories)) {
            categories = (campaignDoc as any).categories as string[];
          } else {
            categories = [];
          }
          campaignCategoryCache[escrow] = categories;
        }

        let decodedCategory = '';
        const categoryHashStr = category ? String(category).toLowerCase() : '';
        if (categoryHashStr) {
          for (const cat of categories) {
            const key = String(cat);
            const hashed = ethers.keccak256(ethers.toUtf8Bytes(key));
            if (hashed.toLowerCase() === categoryHashStr) {
              decodedCategory = key;
              break;
            }
          }
          if (!decodedCategory) {
            throw new Error(
              `Unknown category hash ${categoryHashStr} for escrow ${escrow} (campaign ${campaignId})`
            );
          }
        }

        const beneficiaryHashStr = beneficiaryHash
          ? String(beneficiaryHash).toLowerCase()
          : '';
        if (!beneficiaryHashStr) {
          throw new Error(`Empty beneficiaryHash in PaymentReleased for tx ${txHash}`);
        }

        let campaignBeneficiaries = beneficiaryHashCache[campaignId];
        if (!campaignBeneficiaries) {
          const BeneficiaryModel = (await import("../../models/Beneficiary")).default;
          const beneficiaries = await BeneficiaryModel.find({
            campaignId: new mongoose.Types.ObjectId(campaignId)
          }).select("beneficiaryId");
          const map: Record<
            string,
            { beneficiaryId: string; beneficiaryMongoId: mongoose.Types.ObjectId }
          > = {};
          for (const b of beneficiaries) {
            const benId = (b as any).beneficiaryId as string;
            if (!benId) continue;
            const h = ethers.keccak256(ethers.toUtf8Bytes(benId));
            map[h.toLowerCase()] = {
              beneficiaryId: benId,
              beneficiaryMongoId: b._id as mongoose.Types.ObjectId
            };
          }
          campaignBeneficiaries = map;
          beneficiaryHashCache[campaignId] = campaignBeneficiaries;
        }

        const beneficiaryMapping = campaignBeneficiaries[beneficiaryHashStr];
        if (!beneficiaryMapping) {
          throw new Error(
            `Unknown beneficiary for hash ${beneficiaryHashStr} in campaign ${campaignId}`
          );
        }

        await PaymentRelease.create({
          campaignAddress: escrow,
          requestId: requestHash,
          vendorAddress: vendor,
          beneficiaryId: beneficiaryMapping.beneficiaryId,
          beneficiaryMongoId: beneficiaryMapping.beneficiaryMongoId,
          category: decodedCategory,
          amountNumber: Number(amountVal),
          timestamp,
          txHash,
          totalCampaignDonationsAtRelease,
          attributable
        });
        console.log("PaymentRelease indexed:", txHash);
      }

      lastScannedBlock[escrow] = effectiveToBlock;
      await IndexerState.findOneAndUpdate(
        { escrowAddress: escrow, indexerType: "payouts" },
        { lastScannedBlock: effectiveToBlock },
        { upsert: true }
      );
    } catch (err) {
      console.error("Payout block scan error:", err);
    } finally {
      isScanning[escrow] = false;
    }
  }, 3000);
}

/* -------------------------------------------------------------------------- */
/*                                   START                                    */
/* -------------------------------------------------------------------------- */

main().catch((err) => {
  console.error("Payout indexer fatal error:", err);
  process.exit(1);
});
  
