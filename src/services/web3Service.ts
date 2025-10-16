import { BrowserProvider, Contract, formatEther } from 'ethers';
import { ATTENDANCE_ABI } from '../contracts/AttendanceABI';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface AttendanceRecord {
  student: string;
  timestamp: bigint;
  location: string;
}

class Web3Service {
  private provider: BrowserProvider | null = null;
  private contract: Contract | null = null;
  private signer: any = null;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    this.provider = new BrowserProvider(window.ethereum);
    const accounts = await this.provider.send('eth_requestAccounts', []);
    this.signer = await this.provider.getSigner();
    return accounts[0];
  }

  onAttendanceMarked(handler: (student: string, timestamp: bigint, location: string) => void): () => void {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const listener = (student: string, timestamp: bigint, location: string) => {
      try {
        handler(student, timestamp, location);
      } catch (err) {
        console.error('Error in AttendanceMarked handler:', err);
      }
    };

    this.contract.on('AttendanceMarked', listener);

    return () => {
      try {
        this.contract?.off('AttendanceMarked', listener);
      } catch (err) {
        console.error('Error removing AttendanceMarked listener:', err);
      }
    };
  }

  async initContract(contractAddress: string) {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    this.contract = new Contract(contractAddress, ATTENDANCE_ABI, this.signer);
  }

  async markAttendance(location: string, code: string) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const tx = await this.contract.markAttendance(location, code);
    await tx.wait();
    return tx;
  }

  async startSession(code: string, durationSeconds: number) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const tx = await this.contract.startSession(code, BigInt(durationSeconds));
    await tx.wait();
    return tx;
  }

  async endSession() {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const tx = await this.contract.endSession();
    await tx.wait();
    return tx;
  }

  async isSessionActive(): Promise<boolean> {
    if (!this.contract) {
      return false;
    }
    return await this.contract.isSessionActive();
  }

  async getRecordCount(): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const count = await this.contract.getRecordCount();
    return Number(count);
  }

  async getRecord(index: number): Promise<AttendanceRecord> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const record = await this.contract.records(index);
    return {
      student: record.student,
      timestamp: record.timestamp,
      location: record.location
    };
  }

  async getStudentRecords(address: string): Promise<AttendanceRecord[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const recordIds = await this.contract.getStudentRecordIds(address);
      const records: AttendanceRecord[] = [];

      for (const id of recordIds) {
        const record = await this.getRecord(Number(id));
        records.push(record);
      }

      return records;
    } catch (error) {
      console.error('Error fetching student records:', error);
      return [];
    }
  }

  async getAllRecords(): Promise<AttendanceRecord[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const recordCount = await this.getRecordCount();
      const records: AttendanceRecord[] = [];

      for (let i = 0; i < recordCount; i++) {
        const record = await this.getRecord(i);
        records.push(record);
      }

      return records;
    } catch (error) {
      console.error('Error fetching all records:', error);
      return [];
    }
  }

  async isOwner(): Promise<boolean> {
    if (!this.contract || !this.signer) {
      return false;
    }

    try {
      const owner = await this.contract.owner();
      const currentAccount = await this.signer.getAddress();
      return owner.toLowerCase() === currentAccount.toLowerCase();
    } catch (error) {
      console.error('Error checking owner status:', error);
      return false;
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    const balance = await this.provider.getBalance(address);
    return formatEther(balance);
  }

  async getCurrentAccount(): Promise<string | null> {
    if (!this.provider) return null;
    const accounts = await this.provider.send('eth_accounts', []);
    return accounts.length > 0 ? accounts[0] : null;
  }
}

export const web3Service = new Web3Service();