import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Campaign from '@/models/Campaign'
import PaymentRelease from '@/models/PaymentRelease'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json({ message: 'campaignId is required' }, { status: 400 })
    }

    await dbConnect()

    const campaign = await Campaign.findById(campaignId).lean()
    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found' }, { status: 404 })
    }

    const rawEscrowAddress =
      typeof campaign.escrowAddress === 'string' ? campaign.escrowAddress : ''
    const escrowAddress = rawEscrowAddress.toLowerCase()

    const matchCampaignAddresses: string[] = []
    if (escrowAddress) {
      matchCampaignAddresses.push(escrowAddress)
    }
    if (rawEscrowAddress && rawEscrowAddress !== escrowAddress) {
      matchCampaignAddresses.push(rawEscrowAddress)
    }

    let totalSpent = 0
    let totalTxns = 0

    if (matchCampaignAddresses.length > 0) {
      const agg = await PaymentRelease.aggregate([
        { $match: { campaignAddress: { $in: matchCampaignAddresses } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amountNumber' },
            count: { $sum: 1 }
          }
        }
      ])

      if (agg.length > 0) {
        totalSpent = agg[0].total || 0
        totalTxns = agg[0].count || 0
      }
    }

    const categories = Array.isArray(campaign.categories) ? (campaign.categories as string[]) : []

    let explorerBaseUrl = ''
    if (campaign.chainId === 80002) {
      explorerBaseUrl = 'https://amoy.polygonscan.com/tx/'
    }

    return NextResponse.json(
      {
        id: String(campaign._id),
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        location: campaign.stateRegion || campaign.location || '',
        totalTxns,
        totalSpent,
        categories,
        escrowAddress: campaign.escrowAddress || '',
        chainId: campaign.chainId || null,
        explorerBaseUrl
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Transparency Campaign Summary GET Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
