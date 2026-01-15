import mongoose, { Schema } from 'mongoose';

const PaymentReleaseSchema = new Schema({
  campaignAddress: { type: String, required: true, index: true },
  requestId: { type: String, required: true },
  vendorAddress: { type: String, required: true },
  beneficiaryId: { type: String }, // hashed if needed
  category: { type: String },
  amountNumber: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  txHash: { type: String, required: true, unique: true },
  totalCampaignDonationsAtRelease: { type: Number, required: true }, // snapshot at release
  totalUserDonationsAtRelease: { type: Number }, // optional optimization
  attributable: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.PaymentRelease || mongoose.model('PaymentRelease', PaymentReleaseSchema);
