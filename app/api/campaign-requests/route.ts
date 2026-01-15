import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import CampaignRequest from '@/models/CampaignRequest'

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
    await dbConnect()
    const requests = await CampaignRequest.find({})
      .sort({ createdAt: -1 })
      .lean()
    const safe = requests.map(r => ({
      id: r._id,
      organizationName: r.organizationName,
      organizationType: r.organizationType,
      contactPerson: r.contactPerson,
      officialEmail: r.officialEmail,
      phone: r.phone,
      website: r.website,
      regNumber: r.regNumber,
      headOfficeLocation: r.headOfficeLocation,
      reason: r.reason,
      status: r.status,
      createdAt: r.createdAt,
      documents: (r.documents || []).map((d: any) => ({
        filename: d.filename,
        mimeType: d.mimeType,
        size: d.size,
      })),
    }))
    return NextResponse.json(safe, { status: 200 })
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

    const form = await req.formData()
    const formData = form as any;

    const organizationName = String(formData.get('organizationName') || '')
    const organizationType = String(formData.get('organizationType') || '')
    const contactPerson = String(formData.get('contactPerson') || '')
    const officialEmail = String(formData.get('officialEmail') || '')
    const phone = String(formData.get('phone') || '')
    const website = String(formData.get('website') || '')
    const regNumber = String(formData.get('regNumber') || '')
    const headOfficeLocation = String(formData.get('headOfficeLocation') || '')
    const reason = String(formData.get('reason') || '')

    if (!organizationName || !organizationType || !contactPerson || !officialEmail || !phone || !headOfficeLocation || !reason) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const docs = form.getAll('documents')
    const documents: Array<{ filename: string; mimeType: string; size: number; data: Buffer }> = []
    for (const d of docs) {
      if (d instanceof File) {
        const buf = Buffer.from(await d.arrayBuffer())
        documents.push({
          filename: d.name,
          mimeType: d.type || 'application/octet-stream',
          size: d.size,
          data: buf,
        })
      }
    }

    await dbConnect()
    const created = await CampaignRequest.create({
      createdBy: user.userId,
      organizationName,
      organizationType,
      contactPerson,
      officialEmail,
      phone,
      website,
      regNumber,
      headOfficeLocation,
      reason,
      documents,
      status: 'Pending',
    })

    return NextResponse.json({ id: created._id }, { status: 201 })
  } catch (error: any) {
    const message = error.message || 'Internal Server Error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
