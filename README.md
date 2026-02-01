# SALVUS — Transparent Disaster Relief Platform

Salvus is a comprehensive, hybrid Web2/Web3 disaster relief platform designed to ensure transparency, accountability, and efficiency in aid distribution. It connects donors, beneficiaries, and vendors through a secure ecosystem where funds are managed via smart contract escrows and released only when verified conditions are met.

## 🌟 Key Features

### 👥 For Donors
- **Transparent Giving**: Track exactly where your donations go.
- **Impact Metrics**: Real-time updates on how your funds are helping (e.g., meals provided, medical kits distributed).
- **Campaign Discovery**: Browse and support various active relief campaigns.
- **Blockchain Verification**: All donations and fund releases are recorded on-chain for immutable proof.

### 🏠 For Beneficiaries
- **Digital Wallet**: Receive aid credits directly to a secure digital account.
- **Vendor Network**: Spend credits at approved local vendors for essential goods (Food, Medical, Shelter).
- **Dignified Aid**: Choose what you need, when you need it, without queuing for handouts.

### 🏪 For Vendors
- **Digital Sales**: Accept aid credits as payment for goods.
- **Automated Payouts**: Receive USDC/Fiat payouts automatically upon verifying transactions.
- **Inventory Management**: Manage stock available for relief purchase.

### 🛡️ For Administrators / HQ
- **Campaign Management**: Launch and oversee relief campaigns.
- **Verification**: Approve beneficiaries and vendors to ensure network integrity.
- **Oversight**: Real-time dashboards monitoring total funds, payout requests, and system health.

## 🏗 Architecture

Salvus uses a **Hybrid Architecture** to balance user experience with blockchain security:

1.  **Frontend**: Next.js 14 (App Router) provides a responsive, modern interface.
2.  **Backend**:
    -   **Database**: MongoDB stores user profiles, off-chain metadata, and indexed blockchain events for fast retrieval.
    -   **API**: Next.js API routes handle authentication, business logic, and database interactions.
3.  **Blockchain (The Trust Layer)**:
    -   **Smart Contracts**: `SalvusEscrowCampaign.sol` manages funds. It enforces rules (e.g., specific category caps per beneficiary) and releases payments only when a valid "Request" + "Proof" is presented.
    -   **USDC**: Stablecoin used for value transfer to avoid volatility.
4.  **Indexers**: Background scripts (`backend/indexer/`) listen to blockchain events and sync them to the MongoDB database to keep the UI in sync with the chain.

## 🛠 Tech Stack

-   **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion, Lucide React
-   **Blockchain**: Hardhat, Solidity, Ethers.js, Wagmi, RainbowKit
-   **Backend**: Node.js, MongoDB (Mongoose), NextAuth/JWT
-   **Testing**: Hardhat Toolbox, Chai
-   **Deployment**: Railway (Web), standard EVM networks (Blockchain)

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18+)
-   npm or yarn
-   MongoDB (Local or Atlas)
-   MetaMask or similar Web3 wallet

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Salvus3.0
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` (or `.env.local`) file in the root directory and add the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/salvus # Or your MongoDB Atlas URI

# Authentication
JWT_SECRET=your_super_secret_jwt_key
# GOOGLE_CLIENT_ID=... (Optional: for Google Auth)
# GOOGLE_CLIENT_SECRET=... (Optional: for Google Auth)

# Email Service (for verification/notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Blockchain / WalletConnect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
# Create one at https://cloud.walletconnect.com
# NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545 (Optional: Defaults to local hardhat)
# BACKEND_PRIVATE_KEY=... (Optional: For automated backend signing in production)
```

### 4. Blockchain Setup (Local Development)

Start the local Hardhat node:

```bash
npx hardhat node
```

In a new terminal, deploy the mock USDC and Campaign contracts:

```bash
# First, deploy Mock USDC
npx hardhat run scripts/deployUSDC.ts --network localhost

# Then, deploy the Campaign contract
npx hardhat run scripts/deployCampaign.ts --network localhost
```

_Note: This will generate a `contract-config.json` file which the frontend uses to know the contract addresses._

### 5. Run the Application

Start the Next.js development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

### 6. Run Indexers (Optional but Recommended)

To ensure the dashboards reflect on-chain data (donations, payouts), run the indexers:

```bash
npm run indexer
```

## 📜 Scripts

-   `npm run dev`: Starts the Next.js development server.
-   `npm run build`: Builds the application for production.
-   `npm run indexer`: Runs both donation and payout indexers.
-   `npm run indexer:donations`: Runs only the donation indexer.
-   `npm run indexer:payouts`: Runs only the payout indexer.
-   `npx hardhat test`: Runs smart contract tests.

## 🔐 Smart Contracts

The core logic resides in `contracts/SalvusEscrowCampaign.sol`.

-   **Donations**: Users donate USDC. Funds are held in the contract, not a personal wallet.
-   **Approvals**: The backend (acting as an oracle/admin) approves valid Vendors and Beneficiaries on-chain.
-   **Payouts**: Funds are released to a Vendor ONLY when:
    1.  The Beneficiary is approved.
    2.  The Vendor is approved.
    3.  The expense category (Food, Medical, etc.) is valid.
    4.  The Beneficiary hasn't exceeded their cap for that category.

## 📄 License

This project is licensed under the MIT License.
