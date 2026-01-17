import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Campaign from '@/models/Campaign'
import Beneficiary from '@/models/Beneficiary'
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

    const campaign = await Campaign.findById(campaignId)
      .select('name createdAt categories categoryMaxLimits')
      .lean()

    if (!campaign) {
      return NextResponse.json({ items: [] }, { status: 200 })
    }

    const logs: {
      action: string
      role: 'Admin' | 'System'
      time: Date
      detail: string
    }[] = []

    logs.push({
      action: 'Campaign Created',
      role: 'Admin',
      time: campaign.createdAt as Date,
      detail: 'Campaign structure and wallets initialized.'
    })

    if (Array.isArray(campaign.categories) && campaign.categories.length > 0) {
      const cats = (campaign.categories as string[]).join(', ')
      logs.push({
        action: 'Categories Locked',
        role: 'System',
        time: campaign.createdAt as Date,
        detail: `Spending limited to: ${cats}.`
      })
    }

    const beneficiaries = await Beneficiary.find({ campaignId })
      .select('createdAt')
      .sort({ createdAt: 1 })
      .limit(50)
      .lean()

    if (beneficiaries.length > 0) {
      const firstBatchTime = beneficiaries[0].createdAt as Date
      logs.push({
        action: 'Beneficiaries Onboarded',
        role: 'Admin',
        time: firstBatchTime,
        detail: `Initial batch of ${beneficiaries.length} beneficiaries created.`
      })
    }

    const vendors = await Vendor.find({ campaignId })
      .select('name status createdAt')
      .sort({ createdAt: 1 })
      .lean()

    const approvedVendors = vendors.filter(
      (v) => v.status === 'Verified' || v.status === 'Approved'
    )

    if (approvedVendors.length > 0) {
      const firstApproved = approvedVendors[0]
      logs.push({
        action: 'Store Authorized',
        role: 'Admin',
        time: firstApproved.createdAt as Date,
        detail: `${firstApproved.name} verified and added.`
      })
    }

    logs.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    )

    const limitedLogs = logs.slice(0, 10)

    const items = limitedLogs.map((log) => ({
      action: log.action,
      role: log.role,
      time: log.time,
      detail: log.detail
    }))

    return NextResponse.json({ items }, { status: 200 })
  } catch (error) {
    console.error('Transparency Admin Log GET Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
