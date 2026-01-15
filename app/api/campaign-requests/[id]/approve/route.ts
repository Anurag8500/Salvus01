import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import CampaignRequest from '@/models/CampaignRequest'
import jwt from 'jsonwebtoken'
import { sendAdminInviteEmail } from '@/lib/email'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const reqDoc = await CampaignRequest.findById(params.id)
    if (!reqDoc) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    reqDoc.status = 'Approved'
    await reqDoc.save()

    const payload = {
      email: reqDoc.officialEmail,
      role: 'Admin',
      type: 'admin_invite',
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' })
    await sendAdminInviteEmail(reqDoc.officialEmail, token)

    return NextResponse.json({ message: 'Approved and invite sent' }, { status: 200 })
  } catch (error: any) {
    const message = error.message || 'Internal Server Error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
