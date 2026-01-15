import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { password, token } = body

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ message: 'Invalid password (min 6 chars)' }, { status: 400 })
    }

    await dbConnect()

    if (token) {
      const user = await User.findOne({ verificationToken: token })
      if (!user) {
        return NextResponse.json({ message: 'Invalid or expired activation link' }, { status: 400 })
      }
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      user.password = hashedPassword
      user.requiresPasswordSetup = false
      user.isVerified = true
      user.verificationToken = undefined
      await user.save()
      return NextResponse.json({ message: 'Password set successfully', role: user.role }, { status: 200 })
    } else {
      const cookieStore = cookies()
      const tokenCookie = cookieStore.get('pwd_setup_token')
      if (!tokenCookie) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }
      let payload: any
      try {
        payload = jwt.verify(tokenCookie.value, process.env.JWT_SECRET!)
      } catch {
        return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 })
      }
      if (!payload || payload.type !== 'pwd_setup' || !payload.userId) {
        return NextResponse.json({ message: 'Invalid token payload' }, { status: 401 })
      }
      const user = await User.findById(payload.userId)
      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 })
      }
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      user.password = hashedPassword
      user.requiresPasswordSetup = false
      await user.save()
      const authToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      )
      const response = NextResponse.json({ message: 'Password set successfully', role: user.role }, { status: 200 })
      response.cookies.set('token', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      })
      response.cookies.set('pwd_setup_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      })
      return response
    }
  } catch (error) {
    console.error('Set password error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
