import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Beneficiary from '@/models/Beneficiary'
import User from '@/models/User'
import Campaign from '@/models/Campaign'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import mongoose from 'mongoose'
import crypto from 'crypto'
import { sendActivationEmail, sendSuspensionEmail, sendAccessRestoredEmail } from '@/lib/email'
import { approveBeneficiaryOnChain } from '@/lib/blockchain'

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

    let beneficiary = null

    if (mongoose.Types.ObjectId.isValid(id)) {
      beneficiary = await Beneficiary.findOne({ _id: id, createdBy: user.userId }).populate('campaignId', 'name')
    }
    if (!beneficiary) {
      beneficiary = await Beneficiary.findOne({ beneficiaryId: id, createdBy: user.userId }).populate('campaignId', 'name')
    }

    if (!beneficiary) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(beneficiary, { status: 200 })
  } catch (error: any) {
    console.error('Beneficiaries [id] GET Error:', error)
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

    let beneficiary = null
    const query = mongoose.Types.ObjectId.isValid(id) 
      ? { _id: id, createdBy: user.userId }
      : { beneficiaryId: id, createdBy: user.userId }

    // Capture previous status for transition-based emails
    const previous = await Beneficiary.findOne(query)

    beneficiary = await Beneficiary.findOneAndUpdate(
      query,
      { $set: body },
      { new: true }
    )

    if (!beneficiary) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    // Part 2: On-Chain Approval
    if (body.status === 'Approved' && previous?.status !== 'Approved') {
        try {
            const campaign = await Campaign.findById(beneficiary.campaignId);
            if (!campaign || !campaign.escrowAddress) {
                throw new Error("Campaign or Escrow Address not found");
            }
            
            // beneficiaryId string is used for hashing
            if (!beneficiary.beneficiaryId) {
                throw new Error("Beneficiary ID missing");
            }

            await approveBeneficiaryOnChain(campaign.escrowAddress, beneficiary.beneficiaryId);
        } catch (chainError: any) {
            console.error("On-chain approval failed:", chainError);
            // Rollback
            await Beneficiary.updateOne({ _id: beneficiary._id }, { $set: { status: previous?.status || 'Pending' } });
            return NextResponse.json({ message: "On-chain approval failed: " + chainError.message }, { status: 500 });
        }
    }

    // Email triggers based on status changes
    if (beneficiary.userId) {
      const userAccount = await User.findById(beneficiary.userId)
      if (userAccount) {
        // Suspended → send informational suspension email
        if (body.status === 'Suspended') {
          sendSuspensionEmail(userAccount.email).catch(err =>
            console.error('Failed to send suspension email:', err)
          )
        }
        // Approved → either send activation (if needs setup) OR access restored (if coming from suspended)
        if (body.status === 'Approved') {
          if (userAccount.requiresPasswordSetup && !userAccount.verificationToken) {
            const activationToken = crypto.randomBytes(32).toString('hex')
            userAccount.verificationToken = activationToken
            await userAccount.save()
            sendActivationEmail(userAccount.email, activationToken).catch(err =>
              console.error('Failed to send activation email:', err)
            )
          } else if (previous && previous.status === 'Suspended') {
            sendAccessRestoredEmail(userAccount.email).catch(err =>
              console.error('Failed to send access restored email:', err)
            )
          }
        }
      }
    }

    return NextResponse.json(beneficiary, { status: 200 })
  } catch (error: any) {
    console.error('Beneficiaries [id] PATCH Error:', error)
    const message = error.message || 'Internal Server Error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
