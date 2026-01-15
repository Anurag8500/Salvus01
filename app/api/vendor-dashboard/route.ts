import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/mongodb'
import Vendor from '@/models/Vendor'
import Transaction from '@/models/Transaction'
import Campaign from '@/models/Campaign'
import InventoryItem from '@/models/InventoryItem'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

async function getUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  if (!token) return null
  try {
    const decoded: any = jwt.verify(token.value, process.env.JWT_SECRET || 'fallback_secret')
    return decoded
  } catch {
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

    // Ensure Campaign model is registered before populate
    // referencing the import is usually enough, but we can force a check
    if (!Campaign) {
      console.warn('Campaign model not loaded');
    }

    let vendor;
    try {
      // Try with populate first
      vendor = await Vendor.findOne({ email: user.email }).populate('campaignId', 'name stateRegion location');
    } catch (err: any) {
      console.error('Vendor fetch with populate failed:', err.message);
      // Fallback: fetch without populate if schema error occurs
      if (err.message.includes('Schema hasn\'t been registered') || err.message.includes('MissingSchema')) {
        console.log('Retrying vendor fetch without populate...');
        vendor = await Vendor.findOne({ email: user.email });
      } else {
        throw err;
      }
    }

    console.log('Vendor Dashboard: Vendor found:', vendor ? vendor._id : 'null');

    if (!vendor) {
      return NextResponse.json({ message: 'Vendor profile not found' }, { status: 404 })
    }

    let txns: any[] = [];
    try {
      txns = await Transaction.find({ vendorId: vendor._id })
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('campaignId', 'name')
    } catch (err) {
      console.error('Vendor Dashboard: Transaction fetch failed', err)
    }

    const paymentsReceived = txns
      .filter(t => t.status === 'Completed' || t.status === 'Paid')
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    let itemsCount = 0;
    try {
      itemsCount = await InventoryItem.countDocuments({ vendorId: vendor._id })
    } catch (err) {
      console.error('Vendor Dashboard: Inventory count failed', err)
    }

    // Safely handle populated campaign
    const campaignData = vendor.campaignId as any;
    const vendorState = campaignData?.stateRegion || campaignData?.location || '';

    const response = {
      vendor: {
        id: vendor.storeId || String(vendor._id),
        storeName: vendor.name || '',
        contactPerson: vendor.contactPerson || '',
        vendorType: vendor.category || '',
        state: vendorState,
        district: vendor.district || '',
        area: vendor.area || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        allowedCategories: Array.isArray(vendor.authorizedCategories) ? vendor.authorizedCategories : [],
        // New fields
        status: vendor.status || 'Pending',
        verified: vendor.verified || false,
        walletAddress: vendor.walletAddress || '',
        joinDate: vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '',
        riskLevel: vendor.riskLevel || 'Low',
        businessProofType: vendor.businessProofType || '',
      },
      stats: {
        itemsListed: itemsCount,
        totalOrders: txns.length,
        paymentsReceived,
      },
      transactions: txns.map(t => ({
        id: String(t._id),
        campaign: (t.campaignId as any)?.name || 'Unknown',
        amount: t.amount || 0,
        date: t.timestamp ? new Date(t.timestamp).toLocaleString() : '',
        status: t.status,
        category: t.category,
      })),
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error: any) {
    console.error('Vendor Dashboard API Error:', error);
    const message = error.message || 'Internal Server Error'
    return NextResponse.json({ message, stack: error.stack }, { status: 500 })
  }
}
