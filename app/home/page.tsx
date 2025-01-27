'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Notification from "@/components/Notification";
interface Patient {
  id: number;
  name: string;
  gender: string;
  dob: string;
  blood_group: string;
  blood_group_label: string;
  profile_picture: string;
  created_at: string;
  updated_at: string | null;
  last_activity: string;
}

export default function HomePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
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
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
   
    if (!token) {
      router.push('/');
      return;
    }

    // Fetch patients data
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://192.168.50.88:8000/v1/patients/?page=1&limit=100', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json'
          }
        });
        const data = await response.json();
        if (response.ok && data.status === 'success') {
          setPatients(data.data.patient_list);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [router]);
  const handleDeletePatient = async (patientId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setNotification({
        show: true,
        message: "Unauthorized: Please log in again.",
        type: "error",
      });
      return;
    }
  
    try {
      const response = await fetch('http://192.168.50.88:8000/v1/patients/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `patient_ids=${patientId}`,
      });
  
      const data = await response.json();
  
      if (response.ok && data.status === 'success') {
        setNotification({
          show: true,
          message: data.message || "Patient deleted successfully.",
          type: "success",
        });
  
        // Remove the patient from the local state
        setPatients((prevPatients) =>
          prevPatients.filter((patient) => patient.id !== patientId)
        );
      } else {
        setNotification({
          show: true,
          message: data.message || "Failed to delete patient.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
      setNotification({
        show: true,
        message: "An error occurred. Please try again later.",
        type: "error",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : patients.length === 0 ? (
          // Show default view when no patients
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
                <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xl text-gray-600 mb-4">Add your first patient profile to get started</p>
            </div>
            <button 
              onClick={() => router.push('/home/profileadd')}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Patient Profile
            </button>
          </div>
        ) : (
          // Show patient grid when patients exist
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            {patients.map((patient) => (
              <div key={patient.id} className="bg-white rounded-lg shadow-md overflow-hidden relative group">
                <div className="aspect-w-1 aspect-h-1">
                  <Image
                    src={patient.profile_picture}
                    alt={patient.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h3 
                    onClick={() => router.push(`/home/patient/${patient.id}`)}
                    className="text-lg font-semibold text-gray-800 hover:text-blue-600 cursor-pointer"
                  >
                    {patient.name}
                  </h3>
                  <p className="text-sm text-gray-500">{new Date(patient.created_at).toLocaleDateString()}</p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white rounded-lg shadow-lg p-2 space-y-2">
                    <button 
                      onClick={() => router.push(`/home/profileedit/${patient.id}`)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Patient</span>
                    </button>
                    <button
                      onClick={() => handleDeletePatient(patient.id)}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>Delete Patient</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {/* Add Patient Button when patients exist */}
            <div 
              onClick={() => router.push('/home/profileadd')}
              className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="mt-2 text-sm text-gray-600">Add New Patient22</span>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
