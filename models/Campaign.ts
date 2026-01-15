import mongoose from 'mongoose'

const CampaignSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a campaign name'],
  },
  slug: {
    type: String,
    unique: true,
  },
  location: {
    type: String,
    required: true,
  },
  stateRegion: {
    type: String,
    required: true,
  },
  district: {
    type: String,
  },
  managedBy: {
    type: String,
    default: 'Salvus Relief',
  },
  disasterType: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Paused', 'Closed'],
    default: 'Active',
  },
  totalFundsAllocated: {
    type: Number,
    default: 0,
  },
  beneficiaryCap: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  fundsRaised: {
    type: Number,
    default: 0,
  },
  categories: {
    type: [String],
    validate: [(v: string[]) => Array.isArray(v) && v.length > 0, 'Allowed categories are required'],
    default: undefined,
  },
  categoryMaxLimits: {
    type: Map,
    of: Number,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  urgency: {
    type: String,
    enum: ['High', 'Medium', 'Low', 'Critical'],
    default: 'High',
  },
  escrowAddress: {
    type: String,
  },
  deploymentTx: {
    type: String,
  },
  chainId: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

CampaignSchema.pre('validate', function (this: any) {
  if (this.categoryMaxLimits && this.categoryMaxLimits instanceof Map) {
    const normalized = new Map<string, number>()
    this.categoryMaxLimits.forEach((val: number, key: string) => {
      const k = String(key).toLowerCase().trim()
      normalized.set(k, val)
    })
    this.categoryMaxLimits = normalized
  }
})

CampaignSchema.pre('save', function() {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

CampaignSchema.path('beneficiaryCap').validate(function (this: any, v: number) {
  return typeof v === 'number' && v > 0
}, 'Per-beneficiary cap must be greater than 0')

CampaignSchema.path('beneficiaryCap').validate(function (this: any, v: number) {
  return typeof v === 'number' && v < this.totalFundsAllocated
}, 'Per-beneficiary cap must be less than total campaign budget')

CampaignSchema.path('categoryMaxLimits').validate(function (this: any, v: Map<string, number>) {
  if (!v) return true
  let ok = true
  v.forEach((val, key) => {
    if (typeof val !== 'number' || val < 0) ok = false
    if (typeof this.beneficiaryCap === 'number' && val > this.beneficiaryCap) ok = false
    const k = String(key).toLowerCase().trim()
    if (k.length === 0) ok = false
  })
  return ok
}, 'Invalid category limits: ensure numbers ≥ 0, keys normalized, and each ≤ per-beneficiary cap')

export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema)
