import { useState } from 'react';

interface GlucoseRecord {
  level: number;
  time: string;
  date: string;
  meal_status: string;
}

interface GlucoseProps {
  patientId: string;
  glucoseData: GlucoseRecord[];
}

export default function Glucose({ patientId, glucoseData }: GlucoseProps) {
  return (
    <div>
      {/* Glucose Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <h3 className="text-lg font-semibold">Glucose</h3>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700">
          + Add
        </button>
      </div>

      {/* Glucose Records */}
      <div className="space-y-4">
        {glucoseData.map((record, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">Glucose Level</div>
                <div className="font-medium">{record.level} mg/dL</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Meal Status</div>
                <div className="font-medium">{record.meal_status}</div>
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
