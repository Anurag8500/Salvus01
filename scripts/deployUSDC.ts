import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();

  await usdc.waitForDeployment();

  const address = await usdc.getAddress();
  console.log(`MockUSDC deployed to ${address}`);

  // Save address to a local file for other scripts/frontend to read
  const configPath = path.join(process.cwd(), "contract-config.json");
  let config: any = {};
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
  config.usdcAddress = address;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log("Updated contract-config.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
