import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded: any = jwt.verify(
      token.value,
      process.env.JWT_SECRET || 'fallback_secret'
    )

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const { walletAddress } = await req.json()

    if (!walletAddress) {
      return NextResponse.json(
        { message: 'Wallet address is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { walletAddress: walletAddress.toLowerCase() },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'Wallet linked successfully', walletAddress: user.walletAddress },
      { status: 200 }
    )
  } catch (error) {
    console.error('Link wallet error:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
