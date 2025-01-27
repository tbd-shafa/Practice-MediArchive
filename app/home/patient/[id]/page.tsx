'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Notification from '@/components/Notification';
import BloodPressure from '@/components/patient/BloodPressure';
import Glucose from '@/components/patient/Glucose';
import Prescription from '@/components/patient/Prescription';
import LabReports from '@/components/patient/LabReports';
import Medicines from '@/components/patient/Medicines';
import Notes from '@/components/patient/Notes';

interface Patient {
  id: number;
  name: string;
  profile_picture: string;
}

interface BloodPressureRecord {
  systolic: number;
  diastolic: number;
  bpm: number;
  time: string;
  date: string;
}

export default function PatientDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('blood_pressure');
  const [bloodPressureData, setBloodPressureData] = useState<BloodPressureRecord[]>([]);
  const [glucoseData, setGlucoseData] = useState([]);
  const [prescriptionData, setPrescriptionData] = useState([]);
  const [labReportsData, setLabReportsData] = useState([]);
  const [medicinesData, setMedicinesData] = useState([]);
  const [notesData, setNotesData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    const fetchPatientData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch(`http://192.168.50.88:8000/v1/patients/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json'
          }
        });

        const data = await response.json();
        if (response.ok && data.status === 'success') {
          setPatient(data.data);
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchBloodPressureData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch(
          `http://192.168.50.88:8000/v1/patients_blood_pressure/list/${params.id}/?offset=0&limit=10&start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'accept': 'application/json',
            },
          }
        );

        const data = await response.json();
      
        if (response.ok && data.status === 'success') {
          setBloodPressureData(data.data.bp_records);
        }
      } catch (error) {
        console.error('Error fetching blood pressure data:', error);
      }
    };

    fetchPatientData();
    fetchBloodPressureData();
  }, [dateRange.startDate, dateRange.endDate, params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-2xl text-gray-600 mb-4">Patient Not Found</div>
          <button
            onClick={() => router.push('/home')}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Patient Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <Image
                src={patient.profile_picture}
                alt={patient.name}
                width={96}
                height={96}
                quality={100}
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQrJyEwPENBMDQ4NDQ0QUJCSkNLS0tNRkZGVFpUVFxcXEdnZXaDS1xqcGj/2wBDARUXFyAeIBogHB4gICBoRjAeHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">{patient.name}</h2>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => router.push(`/home/profileedit/${patient.id}`)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Records Section */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Navigation Tabs */}
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              <button
                className={`py-4 px-2 border-b-2 ${
                  activeTab === 'blood_pressure'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('blood_pressure')}
              >
                Blood Pressure
              </button>
              <button
                className={`py-4 px-2 border-b-2 ${
                  activeTab === 'glucose'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('glucose')}
              >
                Glucose
              </button>
              <button
                className={`py-4 px-2 border-b-2 ${
                  activeTab === 'prescription'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('prescription')}
              >
                Prescription
              </button>
              <button
                className={`py-4 px-2 border-b-2 ${
                  activeTab === 'lab_reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('lab_reports')}
              >
                Lab Reports
              </button>
              <button
                className={`py-4 px-2 border-b-2 ${
                  activeTab === 'medicines'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('medicines')}
              >
                Medicines
              </button>
              <button
                className={`py-4 px-2 border-b-2 ${
                  activeTab === 'notes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('notes')}
              >
                Notes
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {activeTab === 'blood_pressure' && (
              <BloodPressure
                patientId={params.id}
                bloodPressureData={bloodPressureData}
                dateRange={dateRange}
                onDateRangeChange={(startDate, endDate) => 
                  setDateRange({ startDate, endDate })
                }
              />
            )}
            {activeTab === 'glucose' && (
              <Glucose
                patientId={params.id}
                glucoseData={glucoseData}
              />
            )}
            {activeTab === 'prescription' && (
              <Prescription
                patientId={params.id}
                prescriptionData={prescriptionData}
              />
            )}
            {activeTab === 'lab_reports' && (
              <LabReports
                patientId={params.id}
                labReports={labReportsData}
              />
            )}
            {activeTab === 'medicines' && (
              <Medicines
                patientId={params.id}
                medicines={medicinesData}
              />
            )}
            {activeTab === 'notes' && (
              <Notes
                patientId={params.id}
                notes={notesData}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}
    </div>
  );
}
