import { useState } from 'react';

interface Medicine {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  notes: string;
}

interface MedicinesProps {
  patientId: string;
  medicines: Medicine[];
}

export default function Medicines({ patientId, medicines }: MedicinesProps) {
  return (
    <div>
      {/* Medicines Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-semibold">Medicines</h3>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700">
          + Add
        </button>
      </div>

      {/* Medicines List */}
      <div className="space-y-4">
        {medicines.map((medicine) => (
          <div key={medicine.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">Medicine Name</div>
                <div className="font-medium">{medicine.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Dosage</div>
                <div className="font-medium">{medicine.dosage}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Frequency</div>
                <div className="font-medium">{medicine.frequency}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Start Date</div>
                <div className="font-medium">
                  {new Date(medicine.startDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">End Date</div>
                <div className="font-medium">
                  {medicine.endDate ? new Date(medicine.endDate).toLocaleDateString() : 'Ongoing'}
                </div>
              </div>
              {medicine.notes && (
                <div className="col-span-2 md:col-span-3">
                  <div className="text-sm text-gray-500">Notes</div>
                  <div className="font-medium">{medicine.notes}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
