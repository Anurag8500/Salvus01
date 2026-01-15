import { NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import CampaignRequest from '@/models/CampaignRequest'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)

export async function POST(req: Request) {
  try {
    const { credential, access_token } = await req.json()

    let email = ''
    let name = ''
    let googleId = ''
    let picture = ''

    if (credential) {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      })

      const payload = ticket.getPayload()

      if (!payload) {
        return NextResponse.json(
          { message: 'Invalid Google token' },
          { status: 400 }
        )
      }

      email = payload.email || ''
      name = payload.name || ''
      googleId = payload.sub || ''
      picture = payload.picture || ''
    } else if (access_token) {
      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      if (!userinfoRes.ok) {
        return NextResponse.json(
          { message: 'Failed to fetch Google user info' },
          { status: 400 }
        )
      }
      const userinfo = await userinfoRes.json()
      email = userinfo.email || ''
      name = userinfo.name || ''
      googleId = userinfo.sub || ''
      picture = userinfo.picture || ''
    } else {
      return NextResponse.json(
        { message: 'Google credential or access_token is required' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { message: 'Email not found in Google token' },
        { status: 400 }
      )
    }

    await dbConnect()

    let user = await User.findOne({ email })

    if (user) {
      let updated = false
      if (!user.googleId) {
        user.googleId = googleId
        updated = true
      }
      if (!user.profilePicture && picture) {
        user.profilePicture = picture
        updated = true
      }
      user.authProvider = 'google'
      if (updated) {
        await user.save()
      }
    } else {
      const approvedInvite = await CampaignRequest.findOne({ officialEmail: email, status: 'Approved' }).lean()
      const role: 'Admin' | 'Donor' | 'Beneficiary' = approvedInvite ? 'Admin' : 'Donor'
      user = await User.create({
        name,
        email,
        googleId,
        profilePicture: picture,
        authProvider: 'google',
        role,
        isVerified: true,
        requiresPasswordSetup: true,
      })
    }

    if (!user.password || user.requiresPasswordSetup) {
      const pwdToken = jwt.sign(
        { userId: user._id, type: 'pwd_setup' },
        process.env.JWT_SECRET!,
        { expiresIn: '30m' }
      )
      const response = NextResponse.json(
        { needsPasswordSetup: true },
        { status: 200 }
      )
      response.cookies.set('pwd_setup_token', pwdToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 60,
        path: '/',
      })
      return response
    } else {
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      )
      const response = NextResponse.json(
        { message: 'Login successful', user: { name: user.name, email: user.email, role: user.role } },
        { status: 200 }
      )
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      })
      return response
    }

  } catch (error) {
    console.error('Google Auth Error:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
