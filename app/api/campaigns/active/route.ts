import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Campaign from '@/models/Campaign'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await dbConnect()

    const campaigns = await Campaign.find({ status: 'Active' })
      .sort({ createdAt: -1 })
      .select('name location stateRegion description fundsRaised totalFundsAllocated escrowAddress')
      .lean()

    const mapped = (campaigns || []).map((c: any) => ({
      id: String(c._id),
      name: c.name || '',
      location: c.stateRegion || c.location || '',
      description: c.description || '',
      fundsRaised: typeof c.fundsRaised === 'number' ? c.fundsRaised : 0,
      fundingGoal:
        typeof c.totalFundsAllocated === 'number' ? c.totalFundsAllocated : 0,
      escrowAddress: c.escrowAddress || ''
    }))

    return NextResponse.json(
      {
        campaigns: mapped
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Active Campaigns GET Error:', error)
    return NextResponse.json({ campaigns: [] }, { status: 500 })
  }
}

