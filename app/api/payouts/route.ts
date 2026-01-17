import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Beneficiary from '@/models/Beneficiary'
import Vendor from '@/models/Vendor'
import Campaign from '@/models/Campaign'
import Transaction from '@/models/Transaction'
import InventoryItem from '@/models/InventoryItem'
import { releasePaymentOnChain } from '@/lib/blockchain'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { FX_USDC_TO_INR } from '@/lib/fx-config'
import { roundToUsdc } from '@/lib/token-utils'

async function getUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  if (!token) return null

  try {
    return jwt.verify(token.value, process.env.JWT_SECRET!) as any
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { storeId, cart, category } = await req.json()
    if (!storeId || !cart || !category) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    /* ------------------------------------------------------------------ */
    /* 1. Beneficiary                                                      */
    /* ------------------------------------------------------------------ */
    const beneficiary = await Beneficiary.findOne({ userId: user.userId })
    if (!beneficiary || beneficiary.status !== 'Approved') {
      return NextResponse.json({ message: 'Beneficiary not approved' }, { status: 403 })
    }

    /* ------------------------------------------------------------------ */
    /* 2. Vendor                                                           */
    /* ------------------------------------------------------------------ */
    const vendor = await Vendor.findById(storeId)
    if (!vendor || vendor.status !== 'Approved' || !vendor.walletAddress) {
      return NextResponse.json({ message: 'Vendor not eligible' }, { status: 403 })
    }

    /* ------------------------------------------------------------------ */
    /* 3. Campaign                                                         */
    /* ------------------------------------------------------------------ */
    const campaign = await Campaign.findById(beneficiary.campaignId)
    if (!campaign?.escrowAddress) {
      return NextResponse.json({ message: 'Invalid campaign' }, { status: 400 })
    }

    /* ------------------------------------------------------------------ */
    /* 4. Validate cart & calculate amount                                  */
    /* ------------------------------------------------------------------ */
    let totalAmount = 0
    const items = await InventoryItem.find({
      _id: { $in: Object.keys(cart) }
    })

    for (const item of items) {
      if (item.vendorId.toString() !== storeId) {
        return NextResponse.json({ message: 'Item does not belong to store' }, { status: 400 })
      }

      const qty = cart[item._id.toString()] || 0
      if (qty > 0) {
        const priceUsdc = (item as any).priceUsdc as number
        const lineTotal = roundToUsdc(priceUsdc * qty)
        totalAmount += lineTotal
      }
    }

    totalAmount = roundToUsdc(totalAmount)

    if (Number.isNaN(totalAmount) || totalAmount <= 0) {
      return NextResponse.json({ message: 'Invalid USDC amount' }, { status: 400 })
    }

    /* ------------------------------------------------------------------ */
    /* 5. Create Pending Transaction (NO txHash)                            */
    /* ------------------------------------------------------------------ */
    const transaction = await Transaction.create({
      campaignId: campaign._id,
      beneficiaryId: beneficiary._id,
      vendorId: vendor._id,
      amount: totalAmount,
      amountInr: Number((totalAmount * FX_USDC_TO_INR).toFixed(2)),
      fxRateUsed: FX_USDC_TO_INR,
      category,
      status: 'Pending',
    })

    /* ------------------------------------------------------------------ */
    /* 6. Execute On-Chain Payout                                           */
    /* ------------------------------------------------------------------ */
    try {
      const txHash = await releasePaymentOnChain(
        campaign.escrowAddress,
        transaction._id.toString(),          // requestId
        beneficiary.beneficiaryId,           // beneficiary ID string
        vendor.walletAddress,
        category,
        totalAmount,
        `Purchase: ${Object.keys(cart).length} items`
      )

      transaction.txHash = txHash
      transaction.status = 'Completed'
      await transaction.save()

      // Optional immediate vendor stats update
      await Vendor.findByIdAndUpdate(
        vendor._id,
        { $inc: { totalPaid: totalAmount } }
      )

      return NextResponse.json({
        success: true,
        txHash,
        transaction,
      })

    } catch (chainError: any) {
      console.error('Blockchain payment failed:', chainError)

      await Transaction.findByIdAndDelete(transaction._id)

      return NextResponse.json(
        { message: chainError.reason || chainError.message || 'Blockchain failure' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Payout API Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
