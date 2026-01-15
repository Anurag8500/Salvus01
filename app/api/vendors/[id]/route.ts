import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Vendor from '@/models/Vendor'
import User from '@/models/User'
import Campaign from '@/models/Campaign'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import mongoose from 'mongoose'
import crypto from 'crypto'
import { sendVendorActivationEmail, sendVendorAccessRestoredEmail } from '@/lib/email'
import { approveVendorOnChain } from '@/lib/blockchain'

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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const { id } = params

    let vendor = null

    if (mongoose.Types.ObjectId.isValid(id)) {
      vendor = await Vendor.findOne({ _id: id, createdBy: user.userId }).populate('campaignId', 'name')
    }
    if (!vendor) {
      vendor = await Vendor.findOne({ storeId: id, createdBy: user.userId }).populate('campaignId', 'name')
    }

    if (!vendor) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(vendor, { status: 200 })
  } catch (error: any) {
    console.error('Vendors [id] GET Error:', error)
    const message = error.message || 'Internal Server Error'
    return NextResponse.json({ message }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await dbConnect()
    const { id } = params

    let vendor = null
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id, createdBy: user.userId }
      : { storeId: id, createdBy: user.userId }

    const previous = await Vendor.findOne(query).lean()
    if (!previous) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    // Part 2: Strict On-Chain Approval Logic
    const newStatus = body.status ? String(body.status).toLowerCase() : ''
    const prevStatus = String(previous.status || '').toLowerCase()

    if (newStatus === 'approved' && prevStatus !== 'approved') {
        // 1. Validate Wallet Address (CRITICAL)
        if (!previous.walletAddress) {
            return NextResponse.json({ message: 'Cannot approve vendor: Wallet Address is missing.' }, { status: 400 })
        }

        try {
            // 2. Get Campaign & Escrow
            const campaign = await Campaign.findById(previous.campaignId);
            if (!campaign || !campaign.escrowAddress) {
                 return NextResponse.json({ message: 'Campaign or Escrow Address not found.' }, { status: 400 })
            }

            // 3. Execute On-Chain Approval (Validates Escrow & Signer internally)
            console.log(`[Vendor Approval] Approving ${previous.walletAddress} on chain...`);
            await approveVendorOnChain(campaign.escrowAddress, previous.walletAddress);
            console.log(`[Vendor Approval] Success.`);

        } catch (chainError: any) {
            console.error("On-chain approval failed:", chainError);
            return NextResponse.json({ message: "On-chain approval failed: " + chainError.message }, { status: 500 });
        }
    }

    // 4. Update MongoDB (Only reached if chain action succeeded or wasn't required)
    vendor = await Vendor.findOneAndUpdate(
      query,
      { $set: body },
      { new: true }
    )

    // If vendor approved/verified, ensure a user exists and send activation email
    const transitionedToActive = (newStatus === 'approved' || newStatus === 'verified') && prevStatus !== newStatus
    if (transitionedToActive && vendor.email) {
      let userAccount = await User.findOne({ email: vendor.email })
      if (!userAccount) {
        userAccount = await User.create({
          name: vendor.name,
          email: vendor.email,
          password: "",
          role: 'Vendor',
          isVerified: false,
          requiresPasswordSetup: true
        })
      } else {
        // Ensure role is Vendor for existing account if appropriate
        if (userAccount.role !== 'Vendor') {
          userAccount.role = 'Vendor'
        }
        if (userAccount.password && userAccount.password.length > 0) {
          userAccount.requiresPasswordSetup = false
        } else {
          userAccount.requiresPasswordSetup = true
        }
        await userAccount.save()
      }

      if (userAccount.requiresPasswordSetup && !userAccount.verificationToken) {
        const activationToken = crypto.randomBytes(32).toString('hex')
        userAccount.verificationToken = activationToken
        await userAccount.save()
        sendVendorActivationEmail(userAccount.email, activationToken).catch(err =>
          console.error('Failed to send vendor activation email:', err)
        )
      }
    }

    if (prevStatus === 'suspended' && (newStatus === 'approved' || newStatus === 'verified') && vendor.email) {
      try {
        await sendVendorAccessRestoredEmail(vendor.email)
      } catch (err) {
        console.error('Failed to send vendor access restored email:', err)
      }
    }

    return NextResponse.json(vendor, { status: 200 })
  } catch (error: any) {
    console.error('Vendors [id] PATCH Error:', error)
    const message = error.message || 'Internal Server Error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
