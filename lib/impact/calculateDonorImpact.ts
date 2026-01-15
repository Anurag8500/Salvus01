import mongoose from 'mongoose';
import Donation from '@/models/Donation';
import PaymentRelease from '@/models/PaymentRelease';

/**
 * Calculates funds utilized and impact breakdown for a donor by userId.
 * Attribution is proportional, snapshot-safe, and conservative.
 */
export async function calculateDonorImpact(userId: mongoose.Types.ObjectId | string) {
  // Get all donations for user
  const donations = await Donation.find({ userId });
  if (!donations.length) {
    return {
      fundsUtilized: 0,
      impact: { purchases: 0, vendors: 0, categories: [] }
    };
  }
  // Group user donations by campaign
  const userDonationsByCampaign: Record<string, { total: number, donations: any[] }> = {};
  for (const d of donations) {
    if (!userDonationsByCampaign[d.campaignAddress]) {
      userDonationsByCampaign[d.campaignAddress] = { total: 0, donations: [] };
    }
    userDonationsByCampaign[d.campaignAddress].total += d.amountNumber || 0;
    userDonationsByCampaign[d.campaignAddress].donations.push(d);
  }
  // Find all attributable payment releases for these campaigns
  const campaigns = Object.keys(userDonationsByCampaign);
  const releases = await PaymentRelease.find({
    campaignAddress: { $in: campaigns },
    attributable: true
  });
  let fundsUtilized = 0;
  const vendors = new Set<string>();
  const categories = new Set<string>();
  let purchases = 0;
  for (const release of releases) {
    // Find user donation sum up to release timestamp (inclusive)
    const userDonationAtRelease = userDonationsByCampaign[release.campaignAddress].donations
      .filter((d) => d.timestamp <= release.timestamp)
      .reduce((sum, d) => sum + (d.amountNumber || 0), 0);
    if (!userDonationAtRelease || userDonationAtRelease <= 0) continue;
    const { totalCampaignDonationsAtRelease, amountNumber, vendorAddress, category } = release;
    if (!totalCampaignDonationsAtRelease || totalCampaignDonationsAtRelease <= 0) continue;
    // Proportional attribution
    let attributedAmount = (userDonationAtRelease / totalCampaignDonationsAtRelease) * amountNumber;
    // Safety: Cap to user's donation at release
    attributedAmount = Math.min(attributedAmount, userDonationAtRelease);
    if (attributedAmount <= 0) continue;
    fundsUtilized += attributedAmount;
    purchases++;
    if (vendorAddress) vendors.add(vendorAddress);
    if (category) categories.add(category);
  }
  return {
    fundsUtilized: Math.floor(fundsUtilized),
    impact: {
      purchases: Math.floor(purchases),
      vendors: vendors.size,
      categories: Array.from(categories)
    }
  };
}
