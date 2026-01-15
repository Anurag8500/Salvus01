import mongoose from 'mongoose'

const DocumentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  data: { type: Buffer, required: true },
})

const CampaignRequestSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organizationName: { type: String, required: true },
  organizationType: { type: String, required: true },
  contactPerson: { type: String, required: true },
  officialEmail: { type: String, required: true },
  phone: { type: String, required: true },
  website: { type: String },
  regNumber: { type: String },
  headOfficeLocation: { type: String, required: true },
  reason: { type: String, required: true },
  documents: { type: [DocumentSchema], default: [] },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.CampaignRequest || mongoose.model('CampaignRequest', CampaignRequestSchema)
