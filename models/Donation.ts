import mongoose, { Schema, Types } from 'mongoose';

const DonationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true }, // permanent identity
  donor: { type: String, required: true }, // wallet address (historical)
  campaignAddress: { type: String, required: true, index: true },
  amount: { type: String, required: true },
  amountNumber: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  txHash: { type: String, required: true, unique: true },
  blockNumber: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

DonationSchema.index({ campaignAddress: 1, timestamp: 1 });

export default mongoose.models.Donation || mongoose.model('Donation', DonationSchema);
