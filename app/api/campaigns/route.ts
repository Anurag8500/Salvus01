import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Campaign from '@/models/Campaign'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { ethers } from 'ethers'
import { SalvusEscrowCampaignABI } from "@/lib/abis/SalvusEscrowCampaign";
import { SalvusEscrowCampaignArtifact } from '@/lib/contracts/SalvusEscrowCampaign'

// Helper to get user from token
async function getUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')

  if (!token) return null

  try {
    const decoded: any = jwt.verify(token.value, process.env.JWT_SECRET!)
    return decoded
  } catch (error) {
    return null
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect()
    
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    let campaigns = []
    if (user.role === 'Admin') {
      campaigns = await Campaign.find({ createdBy: user.userId }).sort({ createdAt: -1 })
    } else {
      campaigns = await Campaign.find({ status: 'Active' }).sort({ createdAt: -1 })
    }

    return NextResponse.json(campaigns, { status: 200 })
  } catch (error) {
    console.error('Campaigns GET Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await dbConnect()

    const perCap = Number(body.beneficiaryCap)
    if (!Number.isFinite(perCap) || perCap <= 0) {
      return NextResponse.json({ message: 'perBeneficiaryCap must be a number greater than 0' }, { status: 400 })
    }

    if (body.categoryMaxLimits && typeof body.categoryMaxLimits === 'object') {
      const normalized: Record<string, number> = {}
      for (const [rawKey, rawVal] of Object.entries(body.categoryMaxLimits)) {
        const key = String(rawKey).toLowerCase().trim()
        const val = Number(rawVal as any)
        if (!key) {
          return NextResponse.json({ message: 'Category names must be non-empty after trimming' }, { status: 400 })
        }
        if (!Number.isFinite(val) || val < 0) {
          return NextResponse.json({ message: `Category "${rawKey}" MAX must be a number ≥ 0` }, { status: 400 })
        }
        if (val > perCap) {
          return NextResponse.json({ message: `Category "${rawKey}" MAX cannot exceed perBeneficiaryCap` }, { status: 400 })
        }
        normalized[key] = val
      }
      body.categoryMaxLimits = normalized
      if (!body.categories || !Array.isArray(body.categories)) {
        body.categories = Object.keys(normalized)
      } else {
        body.categories = body.categories.map((c: any) => String(c).toLowerCase().trim())
      }
    }

    // Create Campaign
    let escrowAddress = "";
    let deploymentTx = "";
    const chainId = 80002;

    try {
      console.log("Starting contract deployment...");
      const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;
      if (!usdcAddress) {
        throw new Error("NEXT_PUBLIC_USDC_ADDRESS is missing");
      }

      // Amoy Deployment
      if (!process.env.RPC_URL_AMOY || !process.env.PRIVATE_KEY) {
        throw new Error("Missing RPC_URL_AMOY or PRIVATE_KEY");
      }

      const provider = new ethers.JsonRpcProvider(process.env.RPC_URL_AMOY);
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

      const factory = new ethers.ContractFactory(
        SalvusEscrowCampaignArtifact.abi,
        SalvusEscrowCampaignArtifact.bytecode,
        wallet
      );

      // Prepare arguments
      const totalCampaignCap = ethers.parseUnits(body.totalFundsAllocated.toString(), 6);
      const perBeneficiaryTotalCap = ethers.parseUnits(body.beneficiaryCap.toString(), 6);
      
      const categoryBytes32 = body.categories.map((c: string) => ethers.keccak256(ethers.toUtf8Bytes(c)));
      // Ensure categoryMaxLimits aligns with categories order
      const categoryCaps = body.categories.map((c: string) => {
         const val = body.categoryMaxLimits[c];
         return ethers.parseUnits(val.toString(), 6);
      });

      console.log("Deploying contract with args:", {
        usdcAddress,
        backendSigner: wallet.address,
        totalCampaignCap: totalCampaignCap.toString(),
        perBeneficiaryTotalCap: perBeneficiaryTotalCap.toString(),
        categoryBytes32,
        categoryCaps: categoryCaps.map((c: any) => c.toString())
      });

      const contract = await factory.deploy(
        usdcAddress,
        wallet.address, // backendSigner
        totalCampaignCap,
        perBeneficiaryTotalCap,
        categoryBytes32,
        categoryCaps
      );

      await contract.waitForDeployment();
      escrowAddress = await contract.getAddress();
      deploymentTx = contract.deploymentTransaction()?.hash || "";
      console.log("Deployed at:", escrowAddress);

    } catch (deployError: any) {
      console.error("Smart Contract Deployment Failed:", deployError);
      return NextResponse.json({ message: "Smart Contract Deployment Failed: " + deployError.message }, { status: 500 });
    }

    const campaign = await Campaign.create({
      ...body,
      createdBy: user.userId,
      escrowAddress,
      deploymentTx,
      chainId
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error: any) {
    console.error('Campaigns POST Error:', error)
    const message = error.message || 'Internal Server Error'
    return NextResponse.json({ message }, { status: error.name === 'ValidationError' ? 400 : 500 })
  }
}
