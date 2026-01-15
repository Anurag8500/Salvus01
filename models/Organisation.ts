import mongoose from 'mongoose'

const OrganisationSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['NGO', 'Govt', 'Trust'],
    required: true,
  },
  officialEmail: {
    type: String,
    required: true,
  },
  contactPersonName: {
    type: String,
    required: true,
  },
  contactPhone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  website: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Organisation || mongoose.model('Organisation', OrganisationSchema)
