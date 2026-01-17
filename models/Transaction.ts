import mongoose from 'mongoose'

const TransactionSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
  },
  beneficiaryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beneficiary',
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  amountInr: {
    type: Number,
    required: false,
  },
  fxRateUsed: {
    type: Number,
    required: false,
  },
  category: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Paid'],
    default: 'Completed',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  txHash: {
    type: String,
    unique: true,
    sparse: true,
  },
})

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema)
