import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import InventoryItem from '@/models/InventoryItem'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

async function getUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  if (!token) return null
  try {
    const decoded: any = jwt.verify(token.value, process.env.JWT_SECRET!)
    return decoded
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const vendorId = searchParams.get('vendorId')

    if (!vendorId) {
        return NextResponse.json({ message: 'Vendor ID required' }, { status: 400 })
    }

    await dbConnect()

    const items = await InventoryItem.find({ vendorId }).sort({ createdAt: -1 })
    
    return NextResponse.json(items, { status: 200 })
  } catch (error) {
    console.error('Inventory GET Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
