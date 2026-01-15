import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Campaign from '@/models/Campaign'
import Beneficiary from '@/models/Beneficiary'
import Vendor from '@/models/Vendor'
import Transaction from '@/models/Transaction'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const { id } = params
    
    const campaign = await Campaign.findById(id)
    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found' }, { status: 404 })
    }

    // Aggregations
    const beneficiaryCount = await Beneficiary.countDocuments({ campaignId: id })
    const vendorCount = await Vendor.countDocuments({ campaignId: id })
    
    // Fetch Lists (Limit to 50 for now)
    const beneficiariesList = await Beneficiary.find({ campaignId: id }).sort({ createdAt: -1 }).limit(50)
    const vendorsList = await Vendor.find({ campaignId: id }).sort({ createdAt: -1 }).limit(50)

    // Calculate spent funds
    const spentAggregation = await Transaction.aggregate([
      { $match: { campaignId: campaign._id, status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const fundsSpent = spentAggregation[0]?.total || 0

    return NextResponse.json({
      ...campaign.toObject(),
      stats: {
        beneficiaries: beneficiaryCount,
        vendors: vendorCount,
        fundsSpent
      },
      beneficiaries: beneficiariesList,
      vendors: vendorsList
    }, { status: 200 })

  } catch (error) {
    console.error('Campaign Detail GET Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect()
        const { id } = params
        const body = await req.json()

        if (body.beneficiaryCap !== undefined) {
            const perCap = Number(body.beneficiaryCap)
            if (!Number.isFinite(perCap) || perCap <= 0) {
                return NextResponse.json({ message: 'perBeneficiaryCap must be a number greater than 0' }, { status: 400 })
            }
        }

        if (body.categoryMaxLimits && typeof body.categoryMaxLimits === 'object') {
            const perCap = Number(body.beneficiaryCap)
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
                if (Number.isFinite(perCap) && val > perCap) {
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

        const campaign = await Campaign.findByIdAndUpdate(id, body, { new: true, runValidators: true })

        if (!campaign) {
            return NextResponse.json({ message: 'Campaign not found' }, { status: 404 })
        }

        return NextResponse.json(campaign, { status: 200 })
    } catch (error) {
        console.error('Campaign Detail PUT Error:', error)
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}
