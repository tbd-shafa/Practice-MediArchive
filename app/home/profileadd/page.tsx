'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Footer from "@/components/Footer";
import Notification from "@/components/Notification";
import { useRouter } from "next/navigation";
export default function AddPatientProfile() {
  const router = useRouter();
  const [name, setname] = useState('');
  const [gender, setgender] = useState('Male');
  const [blood_group, setblood_group] = useState('');
  const [dob, setdob] = useState('');
  const [profile_picture, setprofile_picture] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
      show: boolean;
      message: string;
      type: "success" | "error" | "info";
    }>({
      show: false,
      message: "",
      type: "info",
    });
    const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setprofile_picture(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log(1);
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('gender', gender);
    formData.append('blood_group', blood_group);
    formData.append('dob', dob);
    // Ensure the file input is included
    const fileInput = document.getElementById(
      "profile_pictureInput"
    ) as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append("profile_picture", fileInput.files[0]);
    }

    try {
      const response = await fetch('http://192.168.50.88:8000/v1/patients/', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMTk2MDk1MTYyOCIsImV4cCI6MTczNzgyMDAzNX0.qmHARtFUHUOob5SjfknsxJBjCUuFuG9uUPUdcai0fys',
          'accept': 'application/json',
        },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        // Handle validation errors
        setNotification({
          show: true,
          message: data.message || "An error occurred.",
          type: "error",
        });
        return;
      }
      if (response.ok) {
        
        setMessage(data.message);
        // Reset form fields
        setname('');
        setgender('Male');
        setblood_group('');
        setdob('');
        setprofile_picture(null);
         // Handle success
      setNotification({
        show: true,
        message: "Patient created successfully!",
        type: "success",
      });

      // Redirect after 1 second
      setTimeout(() => {
        router.push("/home");
      }, 1000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Failed to add patient. Please try again.");
      }
    } catch (error) {
      console.error('Error:', error);
      setNotification({
        show: true,
        message: "Failed to add patient. Please try again.",
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
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Add Patient Profile</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden mb-2">
                {profile_picture ? (
                  <Image
                    src={URL.createObjectURL(profile_picture)}
                    alt="Patient profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                onClick={() => document.getElementById('profile_pictureInput')?.click()}
              >
                Add Patient Photo
              </button>
              <input
                type="file"
                name="profile_picture"
                id="profile_pictureInput"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Patient Name */}

            <div>
              <input
                type="text"
                name="name"
                placeholder="Patient Name"
               
                onChange={(e) => setname(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* gender Selection */}
            <div className="flex justify-center space-x-4">
              <label className={`flex items-center space-x-2 p-3 rounded-md cursor-pointer ${gender === 'Male' ? 'bg-blue-50 border-2 border-blue-500' : 'border-2 border-transparent'}`}>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={gender === 'Male'}
                  onChange={(e) => setgender(e.target.value)}
                  className="hidden"
                />
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Male</span>
              </label>
              <label className={`flex items-center space-x-2 p-3 rounded-md cursor-pointer ${gender === 'Female' ? 'bg-pink-50 border-2 border-pink-500' : 'border-2 border-transparent'}`}>
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={gender === 'Female'}
                  onChange={(e) => setgender(e.target.value)}
                  className="hidden"
                />
                <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Female</span>
              </label>
              <label className={`flex items-center space-x-2 p-3 rounded-md cursor-pointer ${gender === 'Other' ? 'bg-purple-50 border-2 border-purple-500' : 'border-2 border-transparent'}`}>
                <input
                  type="radio"
                  name="gender"
                  value="Other"
                  checked={gender === 'Other'}
                  onChange={(e) => setgender(e.target.value)}
                  className="hidden"
                />
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Other</span>
              </label>
            </div>

            {/* Blood Group and Date of Birth */}
            <div className="grid grid-cols-2 gap-4">
              <select
              name="blood_group"
                value={blood_group}
                onChange={(e) => setblood_group(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>

              <input
                type="date"
                name="dob"
                value={dob}
                onChange={(e) => setdob(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
            
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                ADD
              </button>
            </div>
          </form>
        </div>
      </main>
       {/* Footer */}
       <Footer />
    </div>
  );
}
