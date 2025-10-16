import { useState, useEffect } from 'react';
import { Users, Calendar, MapPin, Clock, RefreshCw, Search, Play, StopCircle, Download } from 'lucide-react';
import { web3Service, AttendanceRecord } from '../services/web3Service';

interface AdminPanelProps {
  contractAddress: string;
}

export default function AdminPanel({ contractAddress }: AdminPanelProps) {
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalRecords: 0,
    uniqueStudents: 0,
    todayRecords: 0
  });
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [newSessionCode, setNewSessionCode] = useState('');
  const [newSessionDuration, setNewSessionDuration] = useState(900); // 15 minutes default

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

  const loadAllRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const records = await web3Service.getAllRecords();
      try { setSessionActive(await web3Service.isSessionActive()); } catch {}
      const sortedRecords = records.reverse();
      setAllRecords(sortedRecords);
      setFilteredRecords(sortedRecords);

      const uniqueStudents = new Set(records.map(r => r.student)).size;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRecords = records.filter(r => {
        const recordDate = new Date(Number(r.timestamp) * 1000);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime();
      }).length;

      setStats({
        totalRecords: records.length,
        uniqueStudents,
        todayRecords
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await web3Service.startSession(newSessionCode, newSessionDuration);
      setSessionActive(true);
      setNewSessionCode('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await web3Service.endSession();
      setSessionActive(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = () => {
    const header = ['student','timestamp','isoTime','location'];
    const rows = allRecords.map(r => {
      const ts = Number(r.timestamp);
      const safeLocation = '"' + r.location.replace(/"/g, '""') + '"';
      return [r.student, String(ts), new Date(ts*1000).toISOString(), safeLocation];
    });
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'attendance.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filterRecords = (search: string) => {
    setSearchTerm(search);
    if (!search.trim()) {
      setFilteredRecords(allRecords);
      return;
    }

    const filtered = allRecords.filter(record => 
      record.location.toLowerCase().includes(search.toLowerCase()) ||
      record.student.toLowerCase().includes(search.toLowerCase()) ||
      formatTimestamp(record.timestamp).toLowerCase().includes(search.toLowerCase())
    );
    setFilteredRecords(filtered);
  };

  useEffect(() => {
    if (!contractAddress) return;

    loadAllRecords();

    // subscribe to AttendanceMarked to auto-refresh
    const unsubscribe = web3Service.onAttendanceMarked(() => {
      loadAllRecords();
    });

    return () => {
      unsubscribe?.();
    };
  }, [contractAddress]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-blue-600" size={24} />
          Admin Panel
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            disabled={isLoading || allRecords.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={loadAllRecords}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="font-semibold text-yellow-900">Session</p>
          <p className="text-sm text-yellow-800">{sessionActive ? 'Active' : 'Not Active'}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Session code"
            value={newSessionCode}
            onChange={(e) => setNewSessionCode(e.target.value)}
            className="px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            disabled={isLoading || sessionActive}
          />
          <input
            type="number"
            min={60}
            step={60}
            value={newSessionDuration}
            onChange={(e) => setNewSessionDuration(Number(e.target.value))}
            className="w-32 px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            disabled={isLoading || sessionActive}
          />
          {!sessionActive ? (
            <button
              onClick={startSession}
              disabled={isLoading || !newSessionCode.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Play size={16} /> Start
            </button>
          ) : (
            <button
              onClick={endSession}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <StopCircle size={16} /> End
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p className="font-semibold">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-blue-600" size={20} />
            <span className="font-semibold text-blue-900">Total Records</span>
          </div>
          <p className="text-2xl font-bold text-blue-800">{stats.totalRecords}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-green-600" size={20} />
            <span className="font-semibold text-green-900">Unique Students</span>
          </div>
          <p className="text-2xl font-bold text-green-800">{stats.uniqueStudents}</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-purple-600" size={20} />
            <span className="font-semibold text-purple-900">Today's Records</span>
          </div>
          <p className="text-2xl font-bold text-purple-800">{stats.todayRecords}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by location, student address, or date..."
            value={searchTerm}
            onChange={(e) => filterRecords(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="animate-spin" size={16} />
                    Loading records...
                  </div>
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No records match your search' : 'No attendance records found'}
                </td>
              </tr>
            ) : (
              filteredRecords.map((record, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users size={14} className="text-blue-600" />
                      </div>
                      <span className="font-mono text-sm">{formatAddress(record.student)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-green-600" />
                      <span className="text-gray-800">{record.location}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-600">{formatTimestamp(record.timestamp)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                      Present
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {allRecords.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          {searchTerm ? (
            <>Showing {filteredRecords.length} of {allRecords.length} attendance record{allRecords.length !== 1 ? 's' : ''}</>
          ) : (
            <>Showing {allRecords.length} attendance record{allRecords.length !== 1 ? 's' : ''}</>
          )}
        </div>
      )}
    </div>
  );
}