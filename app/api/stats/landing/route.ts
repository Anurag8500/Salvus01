import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Donation from '@/models/Donation'
import PaymentRelease from '@/models/PaymentRelease'
import Campaign from '@/models/Campaign'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await dbConnect()

    const [donationAgg, payoutAgg, activeCampaignsCount, distinctBeneficiaries] = await Promise.all([
      Donation.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$amountNumber' }
          }
        }
      ]),
      PaymentRelease.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$amountNumber' }
          }
        }
      ]),
      Campaign.countDocuments({ status: 'Active' }),
      PaymentRelease.distinct('beneficiaryMongoId')
    ])

    const totalFundsCollected =
      donationAgg.length > 0 && typeof donationAgg[0].total === 'number'
        ? donationAgg[0].total
        : 0

    const totalSpent =
      payoutAgg.length > 0 && typeof payoutAgg[0].total === 'number' ? payoutAgg[0].total : 0

    const peopleHelped = Array.isArray(distinctBeneficiaries) ? distinctBeneficiaries.length : 0

    return NextResponse.json(
      {
        totalFundsCollected,
        totalSpent,
        activeCampaigns: activeCampaignsCount,
        peopleHelped
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Landing Stats GET Error:', error)
    return NextResponse.json(
      {
        totalFundsCollected: 0,
        totalSpent: 0,
        activeCampaigns: 0,
        peopleHelped: 0
      },
      { status: 500 }
    )
  }
}

