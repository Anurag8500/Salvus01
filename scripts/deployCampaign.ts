import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const configPath = path.join(process.cwd(), "contract-config.json");
  if (!fs.existsSync(configPath)) {
    throw new Error("contract-config.json not found. Run deployUSDC.ts first.");
  }
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const usdcAddress = config.usdcAddress;

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying campaign with account:", deployer.address);

  // Determine backend signer
  let backendSignerAddress = deployer.address;
  if (process.env.BACKEND_PRIVATE_KEY) {
      try {
        const wallet = new hre.ethers.Wallet(process.env.BACKEND_PRIVATE_KEY);
        backendSignerAddress = wallet.address;
        console.log("Using BACKEND_PRIVATE_KEY for backend signer:", backendSignerAddress);
      } catch (e) {
          console.warn("Invalid BACKEND_PRIVATE_KEY, falling back to deployer address");
      }
  } else {
      console.log("No BACKEND_PRIVATE_KEY found, using deployer address as backend signer");
  }

  // Campaign Parameters
  const totalCampaignCap = hre.ethers.parseUnits("100000", 6); // 100k USDC
  const perBeneficiaryTotalCap = hre.ethers.parseUnits("1000", 6); // 1k USDC
  
  const categories = [
    hre.ethers.keccak256(hre.ethers.toUtf8Bytes("Food")),
    hre.ethers.keccak256(hre.ethers.toUtf8Bytes("Medical")),
    hre.ethers.keccak256(hre.ethers.toUtf8Bytes("Shelter"))
  ];
  
  const perBeneficiaryPerCategoryCap = [
    hre.ethers.parseUnits("500", 6),
    hre.ethers.parseUnits("500", 6),
    hre.ethers.parseUnits("500", 6)
  ];

  const SalvusEscrowCampaign = await hre.ethers.getContractFactory("SalvusEscrowCampaign");
  const campaign = await SalvusEscrowCampaign.deploy(
    usdcAddress,
    backendSignerAddress,
    totalCampaignCap,
    perBeneficiaryTotalCap,
    categories,
    perBeneficiaryPerCategoryCap
  );

  await campaign.waitForDeployment();
  const campaignAddress = await campaign.getAddress();

  console.log(`SalvusEscrowCampaign deployed to ${campaignAddress}`);
  
  // Save to config for frontend/tests
  config.lastCampaignAddress = campaignAddress;
  config.backendSigner = backendSignerAddress;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
