import mongoose from 'mongoose'

const InventoryItemSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
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
  unit: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    comment: 'LEGACY: USDC price (DO NOT use for UI)',
  },
  priceInr: {
    type: Number,
    required: true,
  },
  priceUsdc: {
    type: Number,
    required: true,
  },
  fxRateUsed: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.InventoryItem || mongoose.model('InventoryItem', InventoryItemSchema)
