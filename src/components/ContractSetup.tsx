import { useState } from 'react';
import { Settings } from 'lucide-react';

interface ContractSetupProps {
  onSetContract: (address: string) => void;
  currentAddress: string;
}

export default function ContractSetup({ onSetContract, currentAddress }: ContractSetupProps) {
  const [address, setAddress] = useState(currentAddress);
  const [isEditing, setIsEditing] = useState(!currentAddress);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onSetContract(address);
      setIsEditing(false);
    }
  };

  if (!isEditing && currentAddress) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">Contract Address</p>
            <p className="font-mono text-sm text-blue-900">{currentAddress}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Setup Contract</h2>
      <p className="text-gray-600 mb-4 text-sm">
        Enter your deployed Attendance contract address
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="contract" className="block text-sm font-medium text-gray-700 mb-2">
            Contract Address
          </label>
          <input
            type="text"
            id="contract"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Set Contract Address
        </button>
      </form>
    </div>
  );
}
