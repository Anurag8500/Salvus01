import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Transaction from '@/models/Transaction'
import Beneficiary from '@/models/Beneficiary'
import Vendor from '@/models/Vendor'
import Campaign from '@/models/Campaign'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { releasePaymentOnChain } from '@/lib/blockchain'

async function getUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  if (!token) return null
  try {
    const decoded: any = jwt.verify(token.value, process.env.JWT_SECRET!)
    return decoded
  } catch {
    return null
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUser()
    if (!user) {
        // Only Admin or Authorized Backend can release
        // For now, assuming user.role === 'Admin' or similar check
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Verify Admin role if necessary
    // if (user.role !== 'Admin') ...

    await dbConnect()
    const { id } = params // Transaction ID

    const transaction = await Transaction.findById(id)
    if (!transaction) {
        return NextResponse.json({ message: 'Transaction not found' }, { status: 404 })
    }

    if (transaction.status !== 'Pending') {
        return NextResponse.json({ message: 'Transaction not in Pending status' }, { status: 400 })
    }

    // Fetch related entities
    const campaign = await Campaign.findById(transaction.campaignId)
    const beneficiary = await Beneficiary.findById(transaction.beneficiaryId)
    const vendor = await Vendor.findById(transaction.vendorId)

    if (!campaign || !beneficiary || !vendor) {
        return NextResponse.json({ message: 'Related entities not found' }, { status: 404 })
    }

    if (!campaign.escrowAddress) {
        return NextResponse.json({ message: 'Escrow not deployed' }, { status: 400 })
    }
    if (!vendor.walletAddress) {
        return NextResponse.json({ message: 'Vendor wallet missing' }, { status: 400 })
    }
    if (!beneficiary.beneficiaryId) {
        return NextResponse.json({ message: 'Beneficiary ID missing' }, { status: 400 })
    }

    // On-Chain Release
    try {
        const txHash = await releasePaymentOnChain(
            campaign.escrowAddress,
            transaction._id.toString(), // requestId
            beneficiary.beneficiaryId,
            vendor.walletAddress,
            transaction.category,
            transaction.amount,
            transaction._id.toString() // proofReference
        );

        // Update Transaction
        transaction.status = 'Completed'; // or 'Paid'
        transaction.txHash = txHash;
        await transaction.save();

        return NextResponse.json({ message: 'Payment released', txHash }, { status: 200 })

    } catch (chainError: any) {
        console.error("Chain Release Error:", chainError);
        transaction.status = 'Failed';
        transaction.error = chainError.message;
        await transaction.save();
        return NextResponse.json({ message: 'Chain Release Failed: ' + chainError.message }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Payout Release Error:', error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
