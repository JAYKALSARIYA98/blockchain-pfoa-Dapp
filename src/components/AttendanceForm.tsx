import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

interface AttendanceFormProps {
  onMarkAttendance: (location: string, code: string) => Promise<void>;
  isLoading: boolean;
  isSessionActive?: boolean;
}

export default function AttendanceForm({ onMarkAttendance, isLoading, isSessionActive }: AttendanceFormProps) {
  const [location, setLocation] = useState('');
  const [code, setCode] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !code.trim()) return;

    await onMarkAttendance(location, code);
    setSuccess(true);
    setLocation('');
    setCode('');

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Mark Attendance</h2>
      {isSessionActive === false && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 mb-4 text-sm">
          Session is not active. Ask admin to start a session.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (e.g., Classroom A, Lab 101)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
            Session Code
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter the session code provided by admin"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !location.trim() || !code.trim() || isSessionActive === false}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing...
            </>
          ) : success ? (
            <>
              <CheckCircle size={20} />
              Attendance Marked!
            </>
          ) : (
            'Mark Attendance'
          )}
        </button>
      </form>
    </div>
  );
}
