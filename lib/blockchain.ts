import { ethers } from 'ethers';
import { SalvusEscrowCampaignABI } from "@/lib/abis/SalvusEscrowCampaign";

const BACKEND_PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

if (!BACKEND_PRIVATE_KEY) {
    throw new Error("Missing BACKEND_PRIVATE_KEY in environment variables");
}

if (!RPC_URL) {
    throw new Error("Missing RPC_URL in environment variables");
}

export const getProvider = () => {
    return new ethers.JsonRpcProvider(RPC_URL);
};

export const getBackendSigner = () => {
    const provider = getProvider();
    return new ethers.Wallet(BACKEND_PRIVATE_KEY, provider);
};


export const getCampaignContract = async (address: string) => {
    // 1. Verify Escrow Exists
    const provider = getProvider();
    const code = await provider.getCode(address);
    if (code === "0x") {
        throw new Error("ESCROW_NOT_DEPLOYED: " + address);
    }

    // 2. Return Contract Instance
    const signer = getBackendSigner();
    const contract = new ethers.Contract(address, SalvusEscrowCampaignABI, signer);

    // 3. Verify Backend Signer
    const onChainSigner = await contract.backendSigner();
    if (onChainSigner.toLowerCase() !== signer.address.toLowerCase()) {
        throw new Error(`BACKEND_SIGNER_MISMATCH: Expected ${signer.address}, got ${onChainSigner}`);
    }

    return contract;
};

export const approveVendorOnChain = async (escrowAddress: string, vendorAddress: string) => {
    const contract = await getCampaignContract(escrowAddress);
    
    // Check if already approved to avoid revert
    const isApproved = await contract.approvedVendors(vendorAddress);
    if (isApproved) {
        console.log(`Vendor ${vendorAddress} already approved on-chain.`);
        return;
    }

    console.log(`Approving vendor ${vendorAddress} on ${escrowAddress}...`);
    const tx = await contract.approveVendor(vendorAddress);
    await tx.wait();
    console.log(`Vendor ${vendorAddress} approved.`);
};

export const approveBeneficiaryOnChain = async (escrowAddress: string, beneficiaryId: string) => {
    const contract = await getCampaignContract(escrowAddress);
    const beneficiaryHash = ethers.keccak256(ethers.toUtf8Bytes(beneficiaryId));

    // Check if already approved
    const isApproved = await contract.approvedBeneficiaries(beneficiaryHash);
    if (isApproved) {
        console.log(`Beneficiary ${beneficiaryId} (${beneficiaryHash}) already approved on-chain.`);
        return;
    }

    console.log(`Approving beneficiary ${beneficiaryId} on ${escrowAddress}...`);
    const tx = await contract.approveBeneficiary(beneficiaryHash);
    await tx.wait();
    console.log(`Beneficiary ${beneficiaryId} approved.`);
};

export const releasePaymentOnChain = async (
    escrowAddress: string,
    requestId: string,
    beneficiaryId: string,
    vendorAddress: string,
    categoryName: string,
    amount: number, // USDC amount (human readable, will be parsed to 6 decimals)
    proofReference: string
) => {
    const contract = await getCampaignContract(escrowAddress);

    const requestHash = ethers.keccak256(ethers.toUtf8Bytes(requestId));
    const beneficiaryHash = ethers.keccak256(ethers.toUtf8Bytes(beneficiaryId));
    // Ensure casing matches contract init logic from Part 1
    const categoryHash = ethers.keccak256(ethers.toUtf8Bytes(categoryName)); 

    const amountUnits = ethers.parseUnits(amount.toString(), 6);
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes(proofReference));

    // Check if already processed
    const isProcessed = await contract.requestProcessed(requestHash);
    if (isProcessed) {
        console.log(`Request ${requestId} already processed on-chain.`);
        return;
    }

    console.log(`Releasing payment for request ${requestId}...`);
    const tx = await contract.releasePayment(
        requestHash,
        beneficiaryHash,
        vendorAddress,
        categoryHash,
        amountUnits,
        proofHash
    );

    if (!tx || !tx.hash) {
        throw new Error('Blockchain txHash missing after payment execution');
    }

    await tx.wait();
    console.log(`Payment released. Tx: ${tx.hash}`);

    return tx.hash as string;
};
