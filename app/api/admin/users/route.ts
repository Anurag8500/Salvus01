import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // In a real app, you should verify admin privileges here
    // For now, we'll just return all users as requested for the admin view
    
    await dbConnect()

    const users = await User.find({})
      .select('-password') // Exclude password
      .sort({ createdAt: -1 })

    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
