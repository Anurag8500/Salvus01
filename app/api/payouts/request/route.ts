import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Transaction from '@/models/Transaction'
import Beneficiary from '@/models/Beneficiary'
import Vendor from '@/models/Vendor'
import Campaign from '@/models/Campaign'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

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

export async function POST(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { vendorId, category, amount } = body

    if (!vendorId || !category || !amount) {
        return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }

    await dbConnect()

    // 1. Get Beneficiary
    // Assuming user.userId is the link to Beneficiary
    // Or if user is the Beneficiary directly.
    // The Beneficiary model has `userId`.
    const beneficiary = await Beneficiary.findOne({ userId: user.userId })
    if (!beneficiary) {
        return NextResponse.json({ message: 'Beneficiary profile not found' }, { status: 404 })
    }

    // 2. Validate Vendor
    const vendor = await Vendor.findById(vendorId)
    if (!vendor) {
        return NextResponse.json({ message: 'Vendor not found' }, { status: 404 })
    }
    if (String(vendor.status).toLowerCase() !== 'approved') {
        return NextResponse.json({ message: 'Vendor not approved' }, { status: 400 })
    }

    // 3. Validate Campaign
    if (String(beneficiary.campaignId) !== String(vendor.campaignId)) {
        return NextResponse.json({ message: 'Campaign mismatch' }, { status: 400 })
    }
    
    // 4. Create Transaction (Pending)
    const transaction = await Transaction.create({
        campaignId: beneficiary.campaignId,
        beneficiaryId: beneficiary._id,
        vendorId: vendor._id,
        amount: Number(amount),
        category: category,
        status: 'Pending',
        timestamp: new Date()
    })

    return NextResponse.json(transaction, { status: 201 })

  } catch (error: any) {
    console.error('Payout Request Error:', error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
