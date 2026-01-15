import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Donation from '@/models/Donation';
import Campaign from '@/models/Campaign';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

async function getUserIdFromJWT() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token.value, process.env.JWT_SECRET!);
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET() {
  await dbConnect();
  const userId = await getUserIdFromJWT();
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  // Query all donations for this user
  const donations = await Donation.find({ userId }).sort({ timestamp: -1 });
  if (!donations.length) {
    return NextResponse.json({
      totalDonated: 0,
      campaignsSupported: 0,
      lastDonation: null,
      donationHistory: [],
    });
  }
  const totalDonated = donations.reduce((sum, d) => sum + (d.amountNumber || 0), 0);
  const campaignsSupported = new Set(donations.map(d => d.campaignAddress)).size;
  const lastDonation = donations[0]?.timestamp;
  // Get campaign names for donation history
  const campaignMap = Object.fromEntries((await Campaign.find({ escrowAddress: { $in: donations.map(d => d.campaignAddress) } })).map(c => [c.escrowAddress, c.name]));
  const donationHistory = donations.map(d => ({
    campaign: campaignMap[d.campaignAddress] || d.campaignAddress,
    amount: d.amountNumber,
    date: d.timestamp,
    txHash: d.txHash,
  }));
  return NextResponse.json({
    totalDonated,
    campaignsSupported,
    lastDonation,
    donationHistory,
  });
}
