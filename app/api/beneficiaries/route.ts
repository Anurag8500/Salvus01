import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Beneficiary from '@/models/Beneficiary'
import Campaign from '@/models/Campaign'
import Organisation from '@/models/Organisation'
import Vendor from '@/models/Vendor'
import PaymentRelease from '@/models/PaymentRelease'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import User from '@/models/User'
import { FX_USDC_TO_INR } from '@/lib/fx-config'

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

    const beneficiary = await Beneficiary.findOne({ userId: user.userId }).populate('campaignId', 'name location stateRegion district status categories categoryMaxLimits beneficiaryCap createdBy escrowAddress')
    if (!beneficiary) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    const campaign = await Campaign.findById(beneficiary.campaignId)
    let organisationName = ''
    if (campaign?.createdBy) {
      const org = await Organisation.findOne({ createdBy: campaign.createdBy })
      organisationName = org?.name || ''
    }

    const vendors = await Vendor.find({ campaignId: beneficiary.campaignId, status: 'Approved' }).select('name authorizedCategories walletAddress campaignId')

    const categoryLimitsMap: Record<string, number> = {}
    const categories: string[] = Array.isArray(campaign?.categories) ? (campaign!.categories as string[]) : []
    if (campaign?.categoryMaxLimits) {
      ;(campaign.categoryMaxLimits as Map<string, number>).forEach((val, key) => {
        categoryLimitsMap[key] = val
      })
    }

    const totalLimit = Math.round(
      (campaign?.beneficiaryCap || 0) * FX_USDC_TO_INR
    )

    const spentByCategory: Record<string, number> = {}
    let totalSpent = 0

    const escrowAddress = campaign?.escrowAddress as string | undefined
    let recentReleases: any[] = []

    if (escrowAddress && beneficiary.beneficiaryId) {
      const releases = await PaymentRelease.find({
        campaignAddress: escrowAddress,
        beneficiaryId: beneficiary.beneficiaryId
      }).sort({ timestamp: -1 })

      releases.forEach(r => {
        const amt = Math.round((r.amountNumber || 0) * FX_USDC_TO_INR)
        totalSpent += amt
        const cat = r.category || ''
        if (cat) {
          spentByCategory[cat] = (spentByCategory[cat] || 0) + amt
        }
      })

      recentReleases = releases.slice(0, 10)
    }

    if (typeof totalLimit === 'number' && totalLimit >= 0 && totalSpent > totalLimit) {
      totalSpent = totalLimit
    }

    const balances = Object.keys(categoryLimitsMap).map(cat => {
      const limit = Math.round((categoryLimitsMap[cat] || 0) * FX_USDC_TO_INR)
      const spent = spentByCategory[cat] || 0
      const remaining = Math.max(0, limit - spent)
      return { label: cat, remaining, limit }
    })

    let approvalDate: Date | null = null
    if (beneficiary.status === 'Approved') {
      const approvedLog = (beneficiary.activityLog || []).filter((l: any) => l.action === 'Approved').sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      approvalDate = approvedLog?.timestamp || beneficiary.createdAt
    }

    const stores = vendors.map(v => ({
      id: v._id,
      name: v.name,
      authorizedCategories: v.authorizedCategories || []
    }))

    const vendorByAddress: Record<string, string> = {}
    const releaseVendorAddresses = Array.from(new Set(recentReleases.map(r => (r.vendorAddress || '').toLowerCase()).filter(Boolean)))

    if (releaseVendorAddresses.length > 0) {
      const vendorDocs = await Vendor.find({
        walletAddress: { $in: releaseVendorAddresses },
        campaignId: beneficiary.campaignId
      }).select('name walletAddress')

      vendorDocs.forEach(v => {
        if (v.walletAddress) {
          vendorByAddress[(v.walletAddress as string).toLowerCase()] = v.name
        }
      })
    }

    const history = recentReleases.map(r => {
      const date = new Date(r.timestamp)
      const day = date.getDate().toString().padStart(2, '0')
      const month = date.toLocaleString('en-US', { month: 'short' })
      const year = date.getFullYear()
      const addr = (r.vendorAddress || '').toLowerCase()
      return {
        store: vendorByAddress[addr] || 'Store',
        category: r.category || 'Unknown',
        amount: Math.round((r.amountNumber || 0) * FX_USDC_TO_INR),
        date: `${day} ${month} ${year}`,
        status: 'Paid'
      }
    })

    return NextResponse.json({
      beneficiary: {
        id: beneficiary._id,
        beneficiaryId: beneficiary.beneficiaryId,
        status: beneficiary.status,
        fullName: beneficiary.fullName
      },
      campaign: {
        id: campaign?._id,
        name: campaign?.name,
        location: campaign?.stateRegion || campaign?.location || '',
        status: campaign?.status || 'Active'
      },
      approver: organisationName,
      approvalDate,
      categories,
      stores,
      totalLimit,
      totalSpent,
      balances,
      history
    }, { status: 200 })
  } catch (error) {
    console.error('Beneficiaries GET Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await dbConnect()

    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email: body.email })
    if (existingUser) {
      return NextResponse.json({ message: 'Email already registered in system' }, { status: 400 })
    }

    // Generate random BEN ID
    const beneficiaryId = `BEN-${Math.floor(1000 + Math.random() * 9000)}`

    // Create User account for Beneficiary
    // Password is blank, user must verify and set up password later
    const newUser = await User.create({
      name: body.fullName,
      email: body.email,
      password: "",
      role: 'Beneficiary',
      isVerified: false,
      requiresPasswordSetup: true
    })

    const beneficiary = await Beneficiary.create({
      ...body,
      userId: newUser._id, // Link to User account
      beneficiaryId,
      createdBy: user.userId,
      activityLog: [{
        action: 'Created',
        details: `Beneficiary onboarded by ${user.email}`,
        timestamp: new Date()
      }]
    })

    return NextResponse.json(beneficiary, { status: 201 })
  } catch (error) {
    console.error('Beneficiaries POST Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
