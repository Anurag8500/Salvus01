import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { calculateDonorImpact } from '@/lib/impact/calculateDonorImpact';

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
  const result = await calculateDonorImpact(userId);
  return NextResponse.json(result);
}
