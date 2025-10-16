import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import WalletConnect from './components/WalletConnect';
import ContractSetup from './components/ContractSetup';
import AttendanceForm from './components/AttendanceForm';
import AttendanceHistory from './components/AttendanceHistory';
import AdminPanel from './components/AdminPanel';
import { web3Service, AttendanceRecord } from './services/web3Service';

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const currentAccount = await web3Service.getCurrentAccount();
      if (currentAccount) {
        setAccount(currentAccount);
        const bal = await web3Service.getBalance(currentAccount);
        setBalance(bal);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  const handleConnect = async () => {
    try {
      setError(null);
      const connectedAccount = await web3Service.connectWallet();
      setAccount(connectedAccount);
      const bal = await web3Service.getBalance(connectedAccount);
      setBalance(bal);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSetContract = async (address: string) => {
    try {
      setError(null);
      await web3Service.initContract(address);
      setContractAddress(address);
      
      const adminStatus = await web3Service.isOwner();
      setIsAdmin(adminStatus);
      
      try {
        const active = await web3Service.isSessionActive();
        setIsSessionActive(active);
      } catch {}

      if (account) {
        await loadRecords(account);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMarkAttendance = async (location: string, code: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await web3Service.markAttendance(location, code);
      await loadRecords(account!);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecords = async (studentAddress: string) => {
    try {
      const studentRecords = await web3Service.getStudentRecords(studentAddress);
      setRecords(studentRecords.reverse());
    } catch (err: any) {
      console.error('Error loading records:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Shield size={40} className="text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Web3 Attendance System</h1>
          </div>
          <p className="text-gray-600">Blockchain-based attendance tracking</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            <p className="font-semibold">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <WalletConnect account={account} balance={balance} onConnect={handleConnect} />
        
        {account && isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-yellow-600" />
              <p className="font-semibold">Admin Access</p>
            </div>
            <p className="text-sm mt-1">You have admin privileges and can view all attendance records.</p>
          </div>
        )}

        {account && (
          <>
            <ContractSetup
              onSetContract={handleSetContract}
              currentAddress={contractAddress}
            />

            {contractAddress && (
              <>
                <AttendanceForm
                  onMarkAttendance={handleMarkAttendance}
                  isLoading={isLoading}
                  isSessionActive={isSessionActive}
                />

                <AttendanceHistory 
                  records={records} 
                  onRefresh={() => loadRecords(account!)} 
                  isLoading={isLoading}
                />

                {isAdmin && (
                  <div className="mt-8">
                    <AdminPanel contractAddress={contractAddress} />
                  </div>
                )}
              </>
            )}
          </>
        )}

       
      </div>
    </div>
  );
}

export default App;