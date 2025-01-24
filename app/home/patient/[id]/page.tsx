'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Notification from '@/components/Notification';

interface Patient {
  id: number;
  name: string;
  profile_picture: string;
}

export default function PatientDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('blood_pressure');

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

    fetchPatientData();
  }, [params.id, router]);

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
                          <div className="font-medium">7 Oct 2024</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">End Date</div>
                          <div className="font-medium">15 Oct 2024</div>
                        </div>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Change
                    </button>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-6">
                  <h4 className="text-lg font-medium mb-4">Timeline</h4>
                  
                  {/* Timeline Items */}
                  <div className="relative pl-8 pb-6 border-l-2 border-blue-200">
                    {/* Date Point */}
                    <div className="absolute left-0 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    </div>
                    
                    {/* Reading */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-sm font-medium text-blue-600 mb-2">2022, July 08</div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Systolic</div>
                          <div className="font-medium">110</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Diastolic</div>
                          <div className="font-medium">83</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">BPM</div>
                          <div className="font-medium">72</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-2">12:05 am</div>
                    </div>
                  </div>

                  {/* More Timeline Items */}
                  <div className="relative pl-8 pb-6 border-l-2 border-blue-200">
                    <div className="absolute left-0 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-sm font-medium text-blue-600 mb-2">2022, July 07</div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Systolic</div>
                          <div className="font-medium">125</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Diastolic</div>
                          <div className="font-medium">89</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">BPM</div>
                          <div className="font-medium">77</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-2">8:30 am</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other tab contents would go here */}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
