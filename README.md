# EduCheck - University Degrees SBT Platform

A blockchain-based platform for managing university degrees as Soulbound Tokens (SBTs) with backend indexing and React frontend.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

## Manual Setup Instructions
### Terminal 1: Start Hardhat Node

```bash
cd smartcontract
npx hardhat node
```

This will start a local blockchain node at `http://127.0.0.1:8545/`

**Keep this terminal running.**

### Terminal 2: Deploy Smart Contract

Wait for the Hardhat node to be fully running, then in a new terminal:

```bash
cd smartcontract
npx hardhat ignition deploy --network localhost ignition/modules/UniversityDegreesSBT.ts
```

This will deploy the UniversityDegreesSBT contract to your local network.

### Terminal 3: Start Backend Server

```bash
cd backend
npm run dev
```

This will start the backend server with nodemon for hot-reloading.

**Keep this terminal running.**

### Terminal 4: Start Frontend Development Server

```bash
cd frontend
npm run dev
```

This will start the Vite development server. The frontend will typically be available at `http://localhost:5173/`


## MetaMask Setup

1. Install MetaMask browser extension
2. Import one of the test accounts from Hardhat node terminal (it provides 20 accounts with 10000 ETH each)
3. Add localhost network to MetaMask:
   - Network Name: `Name of your network`
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH



