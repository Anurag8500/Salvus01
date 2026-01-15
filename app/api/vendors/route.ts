import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Vendor from '@/models/Vendor'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { ethers } from 'ethers'

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

export async function POST(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await dbConnect()

    // Validate Wallet Address
    if (body.walletAddress) {
        if (!ethers.isAddress(body.walletAddress)) {
            return NextResponse.json({ message: 'Invalid Wallet Address' }, { status: 400 })
        }
    }

    // Generate random STORE ID
    const storeId = `STR-${Math.floor(1000 + Math.random() * 9000)}`

    const vendor = await Vendor.create({
      ...body,
      storeId,
      createdBy: user.userId,
      status: 'Pending',
      walletAddress: body.walletAddress || undefined
    })

    return NextResponse.json(vendor, { status: 201 })
  } catch (error: any) {
    console.error('Vendors POST Error:', error)
    const message = error.message || 'Internal Server Error'
    return NextResponse.json({ message }, { status: error.name === 'ValidationError' ? 400 : 500 })
  }
}
