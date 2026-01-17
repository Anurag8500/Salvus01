import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Campaign from '@/models/Campaign'
import Beneficiary from '@/models/Beneficiary'
import Vendor from '@/models/Vendor'
import Donation from '@/models/Donation'
import PaymentRelease from '@/models/PaymentRelease'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

// Helper to get user from token
async function getUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')

  if (!token) return null

  try {
    const decoded: any = jwt.verify(token.value, process.env.JWT_SECRET!)
    return decoded
  } catch (error) {
    return null
  }
}

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const userId = user.userId

    // 1. Campaign Stats
    const totalCampaigns = await Campaign.countDocuments({ createdBy: userId })
    const activeCampaigns = await Campaign.countDocuments({ status: 'Active', createdBy: userId })
    const pausedCampaigns = await Campaign.countDocuments({ status: 'Paused', createdBy: userId })
    const closedCampaigns = await Campaign.countDocuments({ status: 'Closed', createdBy: userId })

    // 2. Beneficiary Stats
    const totalBeneficiaries = await Beneficiary.countDocuments({ createdBy: userId })
    const approvedBeneficiaries = await Beneficiary.countDocuments({ status: 'Approved', createdBy: userId })
    const pendingBeneficiaries = await Beneficiary.countDocuments({ status: 'Pending', createdBy: userId })
    const suspendedBeneficiaries = await Beneficiary.countDocuments({ status: 'Suspended', createdBy: userId })

    // 3. Vendor Stats
    const totalVendors = await Vendor.countDocuments({ createdBy: userId })
    const verifiedVendors = await Vendor.countDocuments({ status: 'Verified', createdBy: userId })
    const pendingVendors = await Vendor.countDocuments({ status: 'Pending', createdBy: userId })
    const flaggedVendors = await Vendor.countDocuments({ status: 'Flagged', createdBy: userId })

    // 4. Alerts
    const highRiskBeneficiaries = await Beneficiary.countDocuments({ riskLevel: 'High', createdBy: userId })
    const highRiskVendors = await Vendor.countDocuments({ riskLevel: 'High', createdBy: userId })
    const totalAlerts = highRiskBeneficiaries + highRiskVendors

    // 5. Recent Activity (campaigns list)
    const recentCampaigns = await Campaign.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(5)
    
    // 6. Campaigns with detailed stats (for the table)
    const campaignsList = await Campaign.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'beneficiaries',
          localField: '_id',
          foreignField: 'campaignId',
          as: 'beneficiariesList'
        }
      },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: 'campaignId',
          as: 'vendorsList'
        }
      },
      {
        $project: {
          name: 1,
          location: 1,
          status: 1,
          createdAt: 1,
          beneficiaries: { $size: '$beneficiariesList' },
          vendors: { $size: '$vendorsList' },
          issues: {
             $add: [
               { $size: { $filter: { input: '$beneficiariesList', as: 'b', cond: { $eq: ['$$b.riskLevel', 'High'] } } } },
               { $size: { $filter: { input: '$vendorsList', as: 'v', cond: { $eq: ['$$v.riskLevel', 'High'] } } } }
             ]
          }
        }
      },
      { $sort: { createdAt: -1 } }
    ])

    // Get user's campaigns and escrow addresses for activity filtering
    const userCampaigns = await Campaign.find({ createdBy: userId }).select('_id escrowAddress name')
    const userCampaignIds = userCampaigns.map((c) => c._id)
    const campaignAddresses = userCampaigns
      .map((c) => c.escrowAddress)
      .filter((addr): addr is string => !!addr)

    // 7. Recent payments from indexed PaymentRelease (indexer-derived on-chain payouts)
    // NOTE: PaymentRelease is the source of truth for vendor payouts.
    let recentPayments: any[] = []
    if (campaignAddresses.length > 0) {
      const rawPayments = await PaymentRelease.find({
        campaignAddress: { $in: campaignAddresses }
      })
        .sort({ timestamp: -1 })
        .limit(5)
        .select('amountNumber category vendorAddress campaignAddress timestamp')
        .lean()

      const vendorAddresses = Array.from(
        new Set(
          rawPayments
            .map((p) => (p.vendorAddress || '').toLowerCase())
            .filter((addr) => !!addr)
        )
      )

      const vendors = await Vendor.find({
        walletAddress: { $in: vendorAddresses }
      })
        .select('walletAddress name')
        .lean()

      const vendorNameByAddress = new Map<string, string>()
      for (const v of vendors) {
        if (v.walletAddress) {
          vendorNameByAddress.set(v.walletAddress.toLowerCase(), v.name)
        }
      }

      const campaignNameByAddress = new Map<string, string>()
      for (const c of userCampaigns) {
        if (c.escrowAddress) {
          campaignNameByAddress.set(c.escrowAddress.toLowerCase(), c.name)
        }
      }

      recentPayments = rawPayments.map((p) => {
        const vendorName =
          p.vendorAddress && typeof p.vendorAddress === 'string'
            ? vendorNameByAddress.get(p.vendorAddress.toLowerCase())
            : undefined
        const campaignName =
          p.campaignAddress && typeof p.campaignAddress === 'string'
            ? campaignNameByAddress.get(p.campaignAddress.toLowerCase())
            : undefined

        const { vendorAddress, ...rest } = p as any

        return {
          ...rest,
          vendorName,
          campaignName
        }
      })
    }

    const recentBeneficiaries = await Beneficiary.find({ createdBy: userId, status: 'Approved' })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('campaignId', 'name')

    const recentVendors = await Vendor.find({
      createdBy: userId,
      status: { $in: ['Verified', 'Approved'] }
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('campaignId', 'name')
    
    // 9. Unified Activity Feed (backend-only aggregation)
    type ActivityItem = {
      type: string
      description: string
      timestamp: Date
      relatedId: string
    }

    const activityItems: ActivityItem[] = []

    // Donations -> donation made
    if (campaignAddresses.length > 0) {
      const recentDonations = await Donation.find({
        campaignAddress: { $in: campaignAddresses }
      })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean()

      for (const d of recentDonations) {
        activityItems.push({
          type: 'donation',
          // NOTE: Donation is the source of truth for funds raised from donors.
          description: `Donation of ${d.amountNumber} USDC`,
          timestamp: d.timestamp,
          relatedId: d.campaignAddress
        })
      }
    }

    // PaymentRelease -> vendor payout
    if (campaignAddresses.length > 0) {
      const recentPayouts = await PaymentRelease.find({
        campaignAddress: { $in: campaignAddresses }
      })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean()

      for (const p of recentPayouts) {
        activityItems.push({
          type: 'payout',
          description: `Payout of ${p.amountNumber} USDC to ${p.vendorAddress}`,
          timestamp: p.timestamp,
          relatedId: p.txHash
        })
      }
    }

    // Beneficiary -> beneficiary added
    for (const b of recentBeneficiaries) {
      activityItems.push({
        type: 'beneficiary_added',
        description: `Beneficiary ${b.fullName} added`,
        timestamp: b.createdAt,
        relatedId: b.beneficiaryId || String(b._id)
      })
    }

    // Vendor -> vendor approved/verified
    for (const v of recentVendors) {
      if (v.status === 'Verified' || v.status === 'Approved') {
        activityItems.push({
          type: 'vendor_approved',
          description: `Vendor ${v.name} approved`,
          timestamp: v.createdAt,
          relatedId: v.storeId || String(v._id)
        })
      }
    }

    const activityFeed = activityItems.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // 10. Action Items (Derived from pending items)
    const actionItems: any[] = []
    const pendingBens = await Beneficiary.find({ status: 'Pending', createdBy: userId }).limit(3).populate('campaignId', 'name')
    pendingBens.forEach(b => {
      actionItems.push({
        id: b._id,
        priority: 'high',
        message: `${b.fullName} pending approval`,
        campaignName: b.campaignId?.name || 'Unknown Campaign',
        campaignId: b.campaignId?._id,
        timestamp: 'Just now'
      })
    })
    
    // Aggregated Response
    const stats = [
      {
        label: 'Active Campaigns',
        value: activeCampaigns,
        total: totalCampaigns,
        breakdown: [
          { label: 'Active', value: activeCampaigns, color: 'text-green-400' },
          { label: 'Paused', value: pausedCampaigns, color: 'text-yellow-400' },
          { label: 'Closed', value: closedCampaigns, color: 'text-gray-400' }
        ]
      },
      {
        label: 'Beneficiaries',
        value: totalBeneficiaries,
        breakdown: [
          { label: 'Pending', value: pendingBeneficiaries, color: 'text-red-400' },
          { label: 'Approved', value: approvedBeneficiaries, color: 'text-green-400' },
          { label: 'Suspended', value: suspendedBeneficiaries, color: 'text-gray-400' }
        ]
      },
      {
        label: 'Vendors / Stores',
        value: totalVendors,
        breakdown: [
          { label: 'Verified', value: verifiedVendors, color: 'text-green-400' },
          { label: 'Pending', value: pendingVendors, color: 'text-orange-400' },
          { label: 'Flagged', value: flaggedVendors, color: 'text-red-400' }
        ]
      },
      {
        label: 'Alerts / Flags',
        value: totalAlerts,
        breakdown: [
          { label: 'High Risk', value: totalAlerts, color: 'text-red-500' },
          { label: 'Suspicious', value: 0, color: 'text-orange-400' }, // Placeholder
          { label: 'Unusual', value: 0, color: 'text-yellow-400' } // Placeholder
        ]
      }
    ]

    return NextResponse.json({ 
      stats, 
      campaigns: campaignsList,
      recentPayments,
      recentActivity: {
        payments: recentPayments,
        beneficiaries: recentBeneficiaries,
        vendors: recentVendors
      },
      activityFeed,
      actionItems
    }, { status: 200 })
  } catch (error) {
    console.error('Dashboard Stats Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
