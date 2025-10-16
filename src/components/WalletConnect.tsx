import { Wallet } from 'lucide-react';

interface WalletConnectProps {
  account: string | null;
  balance: string;
  onConnect: () => void;
}

export default function WalletConnect({ account, balance, onConnect }: WalletConnectProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {!account ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Connect your MetaMask wallet to mark attendance</p>
          <button
            onClick={onConnect}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <Wallet size={20} />
            Connect MetaMask
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Connected Account</p>
            <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded">{account}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Balance</p>
            <p className="font-semibold text-lg text-gray-800">{parseFloat(balance).toFixed(4)} ETH</p>
          </div>
        </div>
      )}
    </div>
  );
}
