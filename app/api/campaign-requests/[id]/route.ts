import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import CampaignRequest from '@/models/CampaignRequest'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const r = await CampaignRequest.findById(params.id).lean()
    if (!r) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    const safe = {
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
    }
    return NextResponse.json(safe, { status: 200 })
  } catch (error: any) {
    const message = error.message || 'Internal Server Error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
