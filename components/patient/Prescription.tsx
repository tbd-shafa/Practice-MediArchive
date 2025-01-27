import { useState } from 'react';

interface PrescriptionRecord {
  id: number;
  date: string;
  doctor: string;
  diagnosis: string;
  prescriptionImage: string;
}

interface PrescriptionProps {
  patientId: string;
  prescriptionData: PrescriptionRecord[];
}

export default function Prescription({ patientId, prescriptionData }: PrescriptionProps) {
  return (
    <div>
      {/* Prescription Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold">Prescriptions</h3>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700">
          + Add
        </button>
      </div>

      {/* Prescription Records */}
      <div className="space-y-4">
        {prescriptionData.map((record) => (
          <div key={record.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Date</div>
                <div className="font-medium">
                  {new Date(record.date).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Doctor</div>
                <div className="font-medium">{record.doctor}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500">Diagnosis</div>
                <div className="font-medium">{record.diagnosis}</div>
              </div>
              {record.prescriptionImage && (
                <div className="col-span-2">
                  <img 
                    src={record.prescriptionImage} 
                    alt="Prescription"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
