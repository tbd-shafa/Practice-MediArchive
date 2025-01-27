import { useState } from 'react';

interface BloodPressureRecord {
  systolic: number;
  diastolic: number;
  bpm: number;
  time: string;
  date: string;
}

interface BloodPressureProps {
  patientId: string;
  bloodPressureData: BloodPressureRecord[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

export default function BloodPressure({ patientId, bloodPressureData, dateRange, onDateRangeChange }: BloodPressureProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div>
      {/* Blood Pressure Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-semibold">Blood Pressure</h3>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700">
          + Add
        </button>
      </div>

      {/* Date Range */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-gray-600">Date Range</h4>
            <div className="flex space-x-4 mt-2">
              <div>
                <div className="text-sm text-gray-500">Start Date</div>
                <div className="font-medium">
                  {new Date(dateRange.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">End Date</div>
                <div className="font-medium">
                  {new Date(dateRange.endDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Change
          </button>
        </div>
        
        {/* Date Picker */}
        {showDatePicker && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => onDateRangeChange(e.target.value, dateRange.endDate)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => onDateRangeChange(dateRange.startDate, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Blood Pressure Records */}
      <div className="space-y-4">
        {bloodPressureData.map((record, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">Systolic</div>
                <div className="font-medium">{record.systolic} mmHg</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Diastolic</div>
                <div className="font-medium">{record.diastolic} mmHg</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">BPM</div>
                <div className="font-medium">{record.bpm}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Date & Time</div>
                <div className="font-medium">
                  {new Date(`${record.date}T${record.time}`).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
