import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import InventoryItem from '@/models/InventoryItem'
import Vendor from '@/models/Vendor'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import mongoose from 'mongoose'

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

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    await dbConnect()
    const vendor = await Vendor.findOne({ email: user.email })
    if (!vendor) {
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 })
    }
    const query = { _id: new mongoose.Types.ObjectId(params.id), vendorId: vendor._id }
    const deleted = await InventoryItem.findOneAndDelete(query)
    if (!deleted) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    const message = error.message || 'Internal Server Error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
