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

  if (!usdcAddress) {
    throw new Error("USDC address not found in config.");
  }

  const usdc = await hre.ethers.getContractAt("MockUSDC", usdcAddress);

  const recipients = [
    "0x52Cb8669981B10784e37594Da5c0Ce86eC698539", // Donor 1
    "", // Donor 2
    "", // Donor 3
  ];

  const amount = hre.ethers.parseUnits("10000", 6); // 10k USDC each

  console.log("Minting USDC on Polygon Amoy...");

  for (const addr of recipients) {
    const tx = await usdc.mint(addr, amount);
    await tx.wait();
    console.log(`Minted 10,000 USDC to ${addr}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
