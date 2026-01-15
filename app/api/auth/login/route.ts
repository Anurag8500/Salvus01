import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Beneficiary from '@/models/Beneficiary'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Please provide all fields' },
        { status: 400 }
      )
    }

    await dbConnect()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 400 }
      )
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 400 }
      )
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { message: 'Please verify your email to login' },
        { status: 401 }
      )
    }

    // Enforce beneficiary status gating
    if (user.role === 'Beneficiary') {
      const beneficiary = await Beneficiary.findOne({ userId: user._id })
      if (beneficiary) {
        if (beneficiary.status === 'Pending') {
          return NextResponse.json(
            { message: 'Your account is pending approval. Please wait for admin approval.' },
            { status: 403 }
          )
        }
        if (beneficiary.status === 'Suspended') {
          return NextResponse.json(
            { message: 'Your beneficiary access is temporarily on hold due to an administrative review.' },
            { status: 403 }
          )
        }
      }
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    )

    const response = NextResponse.json(
      { message: 'Login successful', user: { name: user.name, email: user.email, role: user.role } },
      { status: 200 }
    )

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 1 day
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const cookieStore = cookies()
    const tokenCookie = cookieStore.get('token')
    if (!tokenCookie) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    let payload: any
    try {
      payload = jwt.verify(tokenCookie.value, process.env.JWT_SECRET || 'fallback_secret')
    } catch {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    await dbConnect()
    const user = await User.findById(payload.userId).select('name email role')
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Login GET error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
