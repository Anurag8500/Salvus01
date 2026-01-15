// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SalvusEscrowCampaign {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    address public immutable backendSigner;
    uint256 public immutable totalCampaignCap;
    uint256 public immutable perBeneficiaryTotalCap;
    
    // Part 2: State Variables
    mapping(address => bool) public approvedVendors;
    mapping(bytes32 => bool) public approvedCategories;
    mapping(bytes32 => bool) public approvedBeneficiaries;
    
    mapping(bytes32 => bool) public requestProcessed;
    
    mapping(bytes32 => uint256) public beneficiaryTotalSpent;
    mapping(bytes32 => mapping(bytes32 => uint256)) public beneficiaryCategorySpent;

    // Kept from Part 1
    bytes32[] public categories;
    mapping(bytes32 => uint256) public categoryCaps;
    uint256 public totalDonated;

    event Donation(address indexed donor, uint256 amount, uint256 timestamp);
    event PaymentReleased(
        bytes32 indexed requestHash,
        bytes32 indexed beneficiaryHash,
        address vendor,
        bytes32 category,
        uint256 amount,
        bytes32 proofHash
    );
    event VendorApproved(address vendor);
    event BeneficiaryApproved(bytes32 beneficiaryHash);

    constructor(
        address _usdcAddress,
        address _backendSigner,
        uint256 _totalCampaignCap,
        uint256 _perBeneficiaryTotalCap,
        bytes32[] memory _categories,
        uint256[] memory _perBeneficiaryPerCategoryCap
    ) {
        require(_usdcAddress != address(0), "Zero address: USDC");
        require(_backendSigner != address(0), "Zero address: Backend Signer");
        require(_totalCampaignCap > 0, "Zero cap: Total Campaign");
        require(_perBeneficiaryTotalCap > 0, "Zero cap: Per Beneficiary");
        require(_categories.length > 0, "Empty categories");
        require(_categories.length == _perBeneficiaryPerCategoryCap.length, "Length mismatch");
        require(_perBeneficiaryTotalCap <= _totalCampaignCap, "Beneficiary cap > Total cap");

        usdc = IERC20(_usdcAddress);
        backendSigner = _backendSigner;
        totalCampaignCap = _totalCampaignCap;
        perBeneficiaryTotalCap = _perBeneficiaryTotalCap;

        for (uint256 i = 0; i < _categories.length; i++) {
            require(_perBeneficiaryPerCategoryCap[i] > 0, "Zero cap: Category");
            require(!approvedCategories[_categories[i]], "Duplicate category");
            
            categoryCaps[_categories[i]] = _perBeneficiaryPerCategoryCap[i];
            approvedCategories[_categories[i]] = true;
            categories.push(_categories[i]);
        }
    }

    modifier onlyBackend() {
        require(msg.sender == backendSigner, "Unauthorized");
        _;
    }

    function approveVendor(address vendor) external onlyBackend {
        require(vendor != address(0), "Zero address");
        require(!approvedVendors[vendor], "Already approved");
        approvedVendors[vendor] = true;
        emit VendorApproved(vendor);
    }

    function approveBeneficiary(bytes32 beneficiaryHash) external onlyBackend {
        require(beneficiaryHash != bytes32(0), "Zero hash");
        require(!approvedBeneficiaries[beneficiaryHash], "Already approved");
        approvedBeneficiaries[beneficiaryHash] = true;
        emit BeneficiaryApproved(beneficiaryHash);
    }

    function releasePayment(
        bytes32 requestHash,
        bytes32 beneficiaryHash,
        address vendor,
        bytes32 category,
        uint256 amount,
        bytes32 proofHash
    ) external onlyBackend {
        require(!requestProcessed[requestHash], "Request processed");
        require(approvedBeneficiaries[beneficiaryHash], "Beneficiary not approved");
        require(approvedVendors[vendor], "Vendor not approved");
        require(approvedCategories[category], "Category not approved");
        require(beneficiaryTotalSpent[beneficiaryHash] + amount <= perBeneficiaryTotalCap, "Beneficiary total cap exceeded");
        require(beneficiaryCategorySpent[beneficiaryHash][category] + amount <= categoryCaps[category], "Category cap exceeded");
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient funds");

        requestProcessed[requestHash] = true;
        beneficiaryTotalSpent[beneficiaryHash] += amount;
        beneficiaryCategorySpent[beneficiaryHash][category] += amount;
        
        usdc.safeTransfer(vendor, amount);

        emit PaymentReleased(
            requestHash,
            beneficiaryHash,
            vendor,
            category,
            amount,
            proofHash
        );
    }


    function donate(uint256 amount) external {
        require(amount > 0, "Zero donation amount");
        require(totalDonated + amount <= totalCampaignCap, "Campaign cap exceeded");

        // Update state before external call (Checks-Effects-Interactions)
        totalDonated += amount;

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        emit Donation(msg.sender, amount, block.timestamp);
    }

    // Reject all direct payments
    receive() external payable { revert(); }
    fallback() external payable { revert(); }
}
