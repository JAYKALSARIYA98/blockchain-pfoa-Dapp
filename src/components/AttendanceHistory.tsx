import { Clock, MapPin, RefreshCw } from 'lucide-react';
import { AttendanceRecord } from '../services/web3Service';

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function AttendanceHistory({ records, onRefresh, isLoading }: AttendanceHistoryProps) {
  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Your Attendance History</h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <RefreshCw className="animate-spin" size={16} />
            Loading your attendance records...
          </div>
        </div>
      ) : records.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No attendance records yet. Mark your first attendance above!</p>
      ) : (
        <div className="space-y-3">
          {records.map((record, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-green-600" />
                    <span className="font-semibold text-gray-800">{record.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} />
                    <span>{formatTimestamp(record.timestamp)}</span>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    {formatAddress(record.student)}
                  </p>
                </div>

                <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Present
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}