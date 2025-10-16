# Web3 Attendance System - Deployment Guide

## Prerequisites

1. **MetaMask Browser Extension**
   - Install from [metamask.io](https://metamask.io)

2. **Ganache (Local Blockchain)**
   - Install Ganache from [trufflesuite.com/ganache](https://trufflesuite.com/ganache)
   - Or use Ganache CLI: `npm install -g ganache`

3. **Remix IDE (for contract deployment)**
   - Visit [remix.ethereum.org](https://remix.ethereum.org)

## Setup Steps

### 1. Start Ganache

**Using Ganache GUI:**
- Open Ganache application
- Click "Quickstart Ethereum"
- Note the RPC Server (usually `http://127.0.0.1:7545`)

**Using Ganache CLI:**
```bash
ganache --port 8545
```

### 2. Configure MetaMask

1. Open MetaMask
2. Click on network dropdown (top)
3. Select "Add Network" → "Add a network manually"
4. Enter details:
   - Network Name: `Ganache Local`
   - RPC URL: `http://127.0.0.1:7545` (or 8545 if using CLI)
   - Chain ID: `1337`
   - Currency Symbol: `ETH`
5. Save

6. Import a Ganache account:
   - Copy a private key from Ganache
   - MetaMask → Import Account → Paste private key

### 3. Deploy Smart Contract

1. Go to [Remix IDE](https://remix.ethereum.org)

2. Create new file: `Attendance.sol`

3. Copy the contract from `contracts/Attendance.sol`

4. Compile:
   - Click "Solidity Compiler" tab
   - Select compiler version `0.8.0` or higher
   - Click "Compile Attendance.sol"

5. Deploy:
   - Click "Deploy & Run Transactions" tab
   - Environment: Select "Injected Provider - MetaMask"
   - MetaMask will prompt - ensure Ganache network is selected
   - Click "Deploy"
   - Confirm transaction in MetaMask

6. Copy the deployed contract address (shown under "Deployed Contracts")

### 4. Run the Application

1. Start the dev server (already running)

2. Open the application in your browser

3. Click "Connect MetaMask" and approve the connection

4. Paste the deployed contract address in the "Setup Contract" section

5. Start marking attendance!

## Usage

- **Mark Attendance**: Enter a location and click "Mark Attendance"
- **View History**: All your attendance records are displayed below
- **Blockchain Verification**: Each attendance is recorded as a transaction on the blockchain

## Features

- Wallet connection with MetaMask
- Smart contract interaction
- Attendance marking with location and timestamp
- Historical records view
- All data stored immutably on blockchain

## Troubleshooting

**MetaMask not connecting:**
- Ensure you're on the Ganache network in MetaMask
- Refresh the page and try again

**Contract not working:**
- Verify the contract address is correct
- Check that Ganache is running
- Ensure your account has ETH for gas fees

**Transaction failing:**
- Make sure you have enough ETH in your account
- Check gas settings in MetaMask
