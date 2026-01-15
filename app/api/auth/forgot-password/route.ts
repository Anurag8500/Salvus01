import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findOne({ email })

    // Always respond with success to avoid user enumeration
    if (!user) {
      return NextResponse.json({ message: 'If the email exists, a reset link has been sent.' }, { status: 200 })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    user.resetPasswordToken = token
    user.resetPasswordExpires = expires
    await user.save()

    await sendPasswordResetEmail(user.email, token)

    return NextResponse.json({ message: 'Password reset link sent to your email.' }, { status: 200 })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

