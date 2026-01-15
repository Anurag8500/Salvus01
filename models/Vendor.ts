import mongoose from 'mongoose'

const VendorSchema = new mongoose.Schema({
  storeId: {
    type: String,
    required: true,
    unique: true,
  },
  district: {
    type: String,
  },
  area: {
    type: String,
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  contactPerson: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  complianceDocs: {
    type: [String], // URLs or file paths
  },
  authorizedCategories: {
    type: [String],
    default: [],
  },
  businessProofType: {
    type: String,
  },
  businessProofNumber: {
    type: String,
  },
  totalPaid: {
    type: Number,
    default: 0,
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  riskFlags: {
    type: [String],
    default: [],
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Flagged', 'Approved', 'Suspended'],
    default: 'Pending'
  },
  walletAddress: {
    type: String,
    lowercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema)
