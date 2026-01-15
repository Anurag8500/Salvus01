import { ethers } from "ethers";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

/* -------------------------------------------------------------------------- */
/*                                MONGOOSE MODELS                             */
/* -------------------------------------------------------------------------- */

const VendorSchema = new mongoose.Schema({
  walletAddress: { type: String },
  status: { type: String },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }
}, { strict: false });

const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);

const BeneficiarySchema = new mongoose.Schema({
  beneficiaryId: { type: String },
  status: { type: String },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }
}, { strict: false });

const Beneficiary = mongoose.models.Beneficiary || mongoose.model("Beneficiary", BeneficiarySchema);

const CampaignSchema = new mongoose.Schema({
  escrowAddress: { type: String },
  status: { type: String },
  deploymentTx: { type: String }
}, { strict: false });

const Campaign = mongoose.models.Campaign || mongoose.model("Campaign", CampaignSchema);

/* -------------------------------------------------------------------------- */
/*                               DB CONNECTION                                */
/* -------------------------------------------------------------------------- */

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/salvus";

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected");
}

/* -------------------------------------------------------------------------- */
/*                               CONTRACT CONFIG                              */
/* -------------------------------------------------------------------------- */

const BACKEND_PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL_AMOY;

if (!BACKEND_PRIVATE_KEY || !RPC_URL) {
    throw new Error("Missing BACKEND_PRIVATE_KEY or RPC_URL_AMOY env vars");
}


/* -------------------------------------------------------------------------- */
/*                               RESTORE LOGIC                                */
/* -------------------------------------------------------------------------- */

async function main() {
    await connectDB();
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    if (!BACKEND_PRIVATE_KEY) {
        throw new Error("BACKEND_PRIVATE_KEY is missing");
    }
    const signer = new ethers.Wallet(BACKEND_PRIVATE_KEY as string, provider);

    console.log("Restoring state to Localhost Chain...");

    // 1. Check all campaigns
    const campaigns = await Campaign.find({ status: 'Active', escrowAddress: { $exists: true } });
    
    for (const camp of campaigns) {
        console.log(`Checking campaign ${camp._id} at ${camp.escrowAddress}...`);
        
        const code = await provider.getCode(camp.escrowAddress);
        if (code === "0x") {
            console.error(`❌ Campaign ${camp._id} contract is DEAD (0x code).`);
            console.error(`⚠️  You must REDEPLOY this campaign via the Admin Dashboard or script.`);
            // In a real scenario, we might auto-redeploy here if we had all the constructor args saved.
            // But strict rules say "Redeploy campaigns" is a step.
            // If the user manually redeploys, the DB updates.
            // This script assumes the campaign exists or we need to flag it.
            continue;
        }

        const { SalvusEscrowCampaignABI } = require("../lib/abis/SalvusEscrowCampaign");
        const contract = new ethers.Contract(camp.escrowAddress, SalvusEscrowCampaignABI, signer);

        // 2. Restore Vendors
        const vendors = await Vendor.find({ campaignId: camp._id, status: 'Approved' });
        for (const vendor of vendors) {
            if (!vendor.walletAddress) continue;
            
            const isApproved = await contract.approvedVendors(vendor.walletAddress);
            if (!isApproved) {
                console.log(`Re-approving Vendor ${vendor.walletAddress}...`);
                try {
                    const tx = await contract.approveVendor(vendor.walletAddress);
                    await tx.wait();
                    console.log(`✅ Approved Vendor ${vendor.walletAddress}`);
                } catch (e: any) {
                    console.error(`Failed to approve vendor: ${e.message}`);
                }
            } else {
                console.log(`Vendor ${vendor.walletAddress} already approved.`);
            }
        }

        // 3. Restore Beneficiaries
        const beneficiaries = await Beneficiary.find({ campaignId: camp._id, status: 'Approved' });
        for (const ben of beneficiaries) {
            if (!ben.beneficiaryId) continue;
            
            const benHash = ethers.keccak256(ethers.toUtf8Bytes(ben.beneficiaryId));
            const isApproved = await contract.approvedBeneficiaries(benHash);
            
            if (!isApproved) {
                console.log(`Re-approving Beneficiary ${ben.beneficiaryId}...`);
                try {
                    const tx = await contract.approveBeneficiary(benHash);
                    await tx.wait();
                    console.log(`✅ Approved Beneficiary ${ben.beneficiaryId}`);
                } catch (e: any) {
                    console.error(`Failed to approve beneficiary: ${e.message}`);
                }
            } else {
                console.log(`Beneficiary ${ben.beneficiaryId} already approved.`);
            }
        }
    }
    
    console.log("State restoration complete.");
    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
