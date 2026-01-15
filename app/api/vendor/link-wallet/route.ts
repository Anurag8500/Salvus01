import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Vendor from '@/models/Vendor';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded: any = jwt.verify(token.value, process.env.JWT_SECRET || 'fallback_secret');
    if (!decoded?.userId) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    const { walletAddress } = await req.json();
    if (!walletAddress) return NextResponse.json({ message: 'Wallet address required' }, { status: 400 });

    await dbConnect();
    
    // Find vendor created by this user or matching email
    const vendor = await Vendor.findOneAndUpdate(
      { 
        $or: [
          { createdBy: decoded.userId },
          { email: decoded.email }
        ]
      },
      { walletAddress: walletAddress.toLowerCase() },
      { new: true }
    );

    return vendor 
      ? NextResponse.json({ message: 'Wallet linked', walletAddress: vendor.walletAddress }, { status: 200 })
      : NextResponse.json({ message: 'Vendor profile not found' }, { status: 404 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
