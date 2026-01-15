export const SalvusEscrowCampaignABI = [
  "function approveVendor(address)",
  "function approveBeneficiary(bytes32)",
  "function donate(uint256)",
  "function releasePayment(bytes32,bytes32,address,bytes32,uint256,bytes32)",
  "function approvedVendors(address) view returns (bool)",
  "function approvedBeneficiaries(bytes32) view returns (bool)",
  "function requestProcessed(bytes32) view returns (bool)",
  "function backendSigner() view returns (address)",
  "event Donation(address indexed,uint256,uint256)",
  "event PaymentReleased(bytes32,bytes32,address,bytes32,uint256,bytes32)"
];
