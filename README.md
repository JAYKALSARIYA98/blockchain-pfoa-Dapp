# Web3 Attendance System

A simple, production-ready dApp for recording and viewing attendance on-chain. Students mark attendance with their wallet; admins (contract owners) can view all records in an admin panel.

## Features

- Wallet connection with MetaMask (EVM-compatible)
- Contract setup via deployed address
- Mark attendance with a location/tag
- Student attendance history (per wallet)
- Admin panel (owner-only):
  - View all records from all students
  - Live updates on new attendance via events
  - Search/filter by location, student address, or date
  - Stats: total records, unique students, today’s records
- Clean UI with Tailwind CSS
- Robust error handling and loading states

## How It Works

- The smart contract stores attendance records in an on-chain array and maps each student address to their record IDs.
- The frontend uses ethers.js to connect to MetaMask, interact with the contract, and read/write data.
- Students mark attendance by calling `markAttendance(location)`.
- Student history is fetched using `getStudentRecordIds(student)` then reading `records[id]` for each.
- Admin panel is available only to the `owner()` of the contract and can fetch all records by iterating `getRecordCount()` and reading `records[i]`.
- The UI subscribes to the `AttendanceMarked` event to live-refresh the admin panel.

## Smart Contract

File: `contracts/Attendance.sol`

### State
- `AttendanceRecord[] public records`
- `mapping(address => uint256[]) public studentRecords`
- `address public owner`

### Events
- `event AttendanceMarked(address indexed student, uint256 timestamp, string location)`

### Constructor
- Sets `owner = msg.sender`

### Functions (Endpoints)
- `function markAttendance(string memory location) public`
  - Appends new record `{ student: msg.sender, timestamp: block.timestamp, location }`
  - Pushes record id into `studentRecords[msg.sender]`
  - Emits `AttendanceMarked`

- `function getRecordCount() public view returns (uint256)`
  - Returns `records.length`

- `function getStudentRecordCount(address student) public view returns (uint256)`
  - Returns `studentRecords[student].length`

- `function getStudentRecordIds(address student) public view returns (uint256[] memory)`
  - Returns array of a student’s record IDs

- `function records(uint256 index) public view returns (address student, uint256 timestamp, string memory location)`
  - Auto-generated getter for the `records` array

- `function owner() public view returns (address)`
  - Auto-generated getter for the contract owner

ABI: `src/contracts/AttendanceABI.ts`

## Frontend Architecture

- `src/services/web3Service.ts`:
  - Wraps ethers.js provider, signer, and contract
  - Methods:
    - `connectWallet()`
    - `initContract(contractAddress)`
    - `markAttendance(location)`
    - `getRecordCount()`
    - `getRecord(index)`
    - `getStudentRecords(address)`
    - `getAllRecords()`
    - `isOwner()`
    - `getBalance(address)`
    - `getCurrentAccount()`
    - `onAttendanceMarked(handler)` → unsubscribe function

- `src/App.tsx`:
  - Orchestrates wallet connect, contract setup, admin detection, marking attendance, and data loading
  - Shows `AttendanceHistory` and (if owner) `AdminPanel`

- `src/components/AttendanceForm.tsx`:
  - Input for `location`; calls `markAttendance`

- `src/components/AttendanceHistory.tsx`:
  - Displays student’s records with refresh and loading states

- `src/components/AdminPanel.tsx`:
  - Owner-only view with stats, search/filter, table of all records
  - Subscribes to `AttendanceMarked` to auto-refresh

## Prerequisites

- Node.js (LTS)
- MetaMask extension
- Ganache (or any local EVM node)

## Setup & Run

1) Install deps
```bash
npm install
```

2) Start dev server
```bash
npm run dev
```
Open the Local URL shown (e.g., http://localhost:5175).

3) Configure MetaMask (once)
- Network: Ganache Local
  - RPC URL: `http://127.0.0.1:7545`
  - Chain ID: `1337`
- Import one Ganache account (this will be admin if used to deploy)

4) Deploy the contract
- Use Remix: https://remix.ethereum.org
- Compile `contracts/Attendance.sol` with Solidity 0.8.x
- Environment: Injected Web3 (MetaMask → Ganache)
- Deploy; if gas estimation fails, you can Force Send in local dev
- Copy the deployed contract address

5) Use the dApp
- Click Connect Wallet
- Paste Contract Address and Set
- If you’re the deployer account, you’ll see the Admin banner and panel
- Mark attendance with a location
- Student history updates; Admin panel shows all records

## Admin vs Student

- Admin = Deployer (`owner()`)
  - Sees Admin banner and Admin Panel
  - Can view all attendance records and stats
- Student = Any other wallet
  - Can mark attendance
  - Sees only their own history

## Troubleshooting

- MetaMask not connected
  - Ensure MetaMask is installed and unlocked
  - Ensure network is Ganache (http://127.0.0.1:7545, Chain ID 1337)

- Gas estimation error on deploy
  - In local dev, use Force Send in MetaMask/Remix
  - Try resetting MetaMask (Settings → Advanced → Reset Account)
  - Restart Ganache to clear state

- No records in Admin panel
  - Ensure you’re connected with the deployer account
  - Ensure the same contract address is set as students are using
  - Click Refresh in Admin panel

- Student history empty
  - Mark attendance first
  - Ensure contract address matches the deployed contract

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- ethers.js v6
- Solidity ^0.8.0

## License

MIT
