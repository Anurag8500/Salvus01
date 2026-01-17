import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Campaign from '@/models/Campaign'
import Beneficiary from '@/models/Beneficiary'
import Vendor from '@/models/Vendor'
import Donation from '@/models/Donation'
import PaymentRelease from '@/models/PaymentRelease'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const { id } = params
    
    const campaign = await Campaign.findById(id)
    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found' }, { status: 404 })
    }

    const beneficiaryCount = await Beneficiary.countDocuments({ campaignId: id })
    const vendorCount = await Vendor.countDocuments({ campaignId: id })

    const beneficiariesList = await Beneficiary.find({ campaignId: id }).sort({ createdAt: -1 }).limit(50)
    const vendorsList = await Vendor.find({ campaignId: id }).sort({ createdAt: -1 }).limit(50)

    const escrowAddress = campaign.escrowAddress

    let totalDonations = 0
    let totalPayouts = 0

    if (escrowAddress) {
      const donationAgg = await Donation.aggregate([
        { $match: { campaignAddress: escrowAddress } },
        { $group: { _id: null, total: { $sum: '$amountNumber' } } }
      ])
      totalDonations = donationAgg[0]?.total || 0

      const payoutAgg = await PaymentRelease.aggregate([
        { $match: { campaignAddress: escrowAddress } },
        { $group: { _id: null, total: { $sum: '$amountNumber' } } }
      ])
      totalPayouts = payoutAgg[0]?.total || 0
    }

    const fundsRaised = totalDonations
    const fundsRemaining = totalDonations - totalPayouts
    const campaignCap = campaign.totalFundsAllocated || 0

    return NextResponse.json(
      {
        ...campaign.toObject(),
        stats: {
          beneficiaries: beneficiaryCount,
          vendors: vendorCount,
          fundsRaised,
          fundsRemaining,
          campaignCap
        },
        beneficiaries: beneficiariesList,
        vendors: vendorsList
      },
      { status: 200 }
    )

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
