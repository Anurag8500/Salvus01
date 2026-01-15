import mongoose from 'mongoose'

const BeneficiarySchema = new mongoose.Schema({
  beneficiaryId: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
  },
  ageType: {
    type: String,
    enum: ['exact', 'range'],
    default: 'exact',
  },
  age: {
    type: Number,
  },
  ageRange: {
    type: String,
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  district: {
    type: String,
  },
  locality: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  idType: {
    type: String,
  },
  idNumber: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Suspended'],
    default: 'Pending',
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  vulnerabilities: {
    type: [String],
    default: [],
  },
  riskFlags: {
    type: [String],
    default: [],
  },
  internalNotes: {
    type: String,
    default: '',
  },
  activityLog: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Beneficiary || mongoose.model('Beneficiary', BeneficiarySchema)
