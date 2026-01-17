import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Campaign from '@/models/Campaign'
import PaymentRelease from '@/models/PaymentRelease'
import Vendor from '@/models/Vendor'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json({ message: 'campaignId is required' }, { status: 400 })
    }

    await dbConnect()

    const campaign = await Campaign.findById(campaignId).select('escrowAddress name')
    if (!campaign || !campaign.escrowAddress) {
      return NextResponse.json({ items: [] }, { status: 200 })
    }

    const rawEscrowAddress = campaign.escrowAddress as string
    const escrowAddress = rawEscrowAddress.toLowerCase()

    const matchCampaignAddresses: string[] = []
    if (escrowAddress) {
      matchCampaignAddresses.push(escrowAddress)
    }
    if (rawEscrowAddress && rawEscrowAddress !== escrowAddress) {
      matchCampaignAddresses.push(rawEscrowAddress)
    }

    const rawPayments = await PaymentRelease.find({
      campaignAddress: { $in: matchCampaignAddresses }
    })
      .sort({ timestamp: -1 })
      .select('amountNumber category vendorAddress timestamp txHash')
      .lean()

    if (rawPayments.length === 0) {
      return NextResponse.json({ items: [] }, { status: 200 })
    }

    const vendorAddresses = Array.from(
      new Set(
        rawPayments
          .map((p: any) => (p.vendorAddress || '').toLowerCase())
          .filter((addr) => !!addr)
      )
    )

    const vendors = await Vendor.find({
      walletAddress: { $in: vendorAddresses },
      campaignId: campaignId
    })
      .select('walletAddress name')
      .lean()

    const vendorNameByAddress = new Map<string, string>()
    for (const v of vendors) {
      if (v.walletAddress) {
        vendorNameByAddress.set((v.walletAddress as string).toLowerCase(), v.name as string)
      }
    }

    const items = rawPayments.map((p: any) => {
      const addrRaw = p.vendorAddress || ''
      const addr = addrRaw.toLowerCase()
      let store = ''
      if (addr) {
        const resolved = vendorNameByAddress.get(addr)
        if (resolved) {
          store = resolved
        } else {
          const short =
            addrRaw.length > 10
              ? `${addrRaw.slice(0, 6)}...${addrRaw.slice(-4)}`
              : addrRaw
          store = short
        }
      }

      return {
        id: String(p._id),
        amount: p.amountNumber,
        currency: 'USDC',
        category: p.category || 'Unknown',
        store,
        timestamp: p.timestamp,
        status: 'Paid',
        txHash: p.txHash || ''
      }
    })

    return NextResponse.json({ items }, { status: 200 })
  } catch (error) {
    console.error('Transparency Ledger GET Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
