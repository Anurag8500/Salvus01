import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Organisation from '@/models/Organisation'
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

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    await dbConnect()
    const org = await Organisation.findOne({ createdBy: user.userId })
    if (!org) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(org, { status: 200 })
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
    let org = await Organisation.findOne({ createdBy: user.userId })
    if (org) {
      org.name = body.name
      org.type = body.type
      org.officialEmail = body.officialEmail
      org.contactPersonName = body.contactPersonName
      org.contactPhone = body.contactPhone
      org.address = body.address
      org.website = body.website
      await org.save()
    } else {
      org = await Organisation.create({
        createdBy: user.userId,
        name: body.name,
        type: body.type,
        officialEmail: body.officialEmail,
        contactPersonName: body.contactPersonName,
        contactPhone: body.contactPhone,
        address: body.address,
        website: body.website,
      })
    }
    return NextResponse.json(org, { status: 200 })
  } catch (error: any) {
    const message = error.message || 'Internal Server Error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
