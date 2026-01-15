import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import CampaignRequest from '@/models/CampaignRequest'

export async function GET(_req: Request, { params }: { params: { id: string, index: string } }) {
  try {
    await dbConnect()
    const r = await CampaignRequest.findById(params.id)
    if (!r) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    const idx = parseInt(params.index, 10)
    const doc = r.documents?.[idx] as any
    if (!doc) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 })
    }
    const filename = doc.filename || 'document'
    const mimeType = doc.mimeType || 'application/octet-stream'
    const data: Buffer = doc.data
    const bytes = new Uint8Array(data)
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(bytes.length),
      },
    })
  } catch (error: any) {
    const message = error.message || 'Internal Server Error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
