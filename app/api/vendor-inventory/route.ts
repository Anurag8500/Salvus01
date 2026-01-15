import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import InventoryItem from '@/models/InventoryItem'
import Vendor from '@/models/Vendor'
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
    const vendor = await Vendor.findOne({ email: user.email })
    if (!vendor) {
      return NextResponse.json({ items: [] }, { status: 200 })
    }
    const items = await InventoryItem.find({ vendorId: vendor._id }).sort({ createdAt: -1 })
    const safe = items.map(i => ({
      id: String(i._id),
      name: i.name,
      category: i.category,
      unit: i.unit,
      price: i.price,
      description: i.description,
    }))
    return NextResponse.json({ items: safe }, { status: 200 })
  } catch (error: any) {
    const message = error.message || 'Internal Server Error'
    return NextResponse.json({ message }, { status: 500 })
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
    const vendor = await Vendor.findOne({ email: user.email })
    if (!vendor) {
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 })
    }
    const created = await InventoryItem.create({
      vendorId: vendor._id,
      name: body.name,
      category: body.category,
      unit: body.unit,
      price: body.price,
      description: body.description || '',
    })
    return NextResponse.json({
      id: String(created._id),
      name: created.name,
      category: created.category,
      unit: created.unit,
      price: created.price,
      description: created.description,
    }, { status: 201 })
  } catch (error: any) {
    const message = error.message || 'Internal Server Error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
