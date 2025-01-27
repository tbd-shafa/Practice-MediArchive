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
  gender: string;
  dob: string;
  blood_group: string;
  profile_picture: string;
}

export default function EditPatientProfile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [blood_group, setBloodGroup] = useState('');
  const [dob, setDob] = useState('');
  const [profile_picture, setProfilePicture] = useState<File | null>(null);
  const [currentProfilePicture, setCurrentProfilePicture] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
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
          const patient = data.data;
          setName(patient.name);
          setGender(patient.gender);
          setBloodGroup(patient.blood_group);
          setDob(patient.dob);
          setCurrentProfilePicture(patient.profile_picture);
        } else {
          setNotFound(true);
          setNotification({
            show: true,
            message: "Patient not found",
            type: "error"
          });
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setNotification({
          show: true,
          message: "Error loading patient data",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [params.id, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('gender', gender);
    formData.append('blood_group', blood_group);
    formData.append('dob', dob);

    if (profile_picture) {
      formData.append('profile_picture', profile_picture);
    }

    try {
      const response = await fetch(`http://192.168.50.88:8000/v1/patients/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setNotification({
          show: true,
          message: "Patient updated successfully!",
          type: "success"
        });

        // Redirect after success
        setTimeout(() => {
          router.push('/home');
        }, 1000);
      } else {
        setNotification({
          show: true,
          message: data.message || "Failed to update patient",
          type: "error"
        });
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      setNotification({
        show: true,
        message: "Error updating patient",
        type: "error"
      });
    }
  };

  if (notFound) {
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
          <h2 className="text-2xl font-bold mb-6 text-center">Edit Patient Profile</h2>
          
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
                ) : currentProfilePicture ? (
                  <Image
                    src={currentProfilePicture}
                    alt="Patient profile"
                    width={128}
                    height={128}
                    quality={100}
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQrJyEwPENBMDQ4NDQ0QUJCSkNLS0tNRkZGVFpUVFxcXEdnZXaDS1xqcGj/2wBDARUXFyAeIBogHB4gICBoRjAeHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                onClick={() => document.getElementById('profile_pictureInput')?.click()}
              >
                Change Photo
              </button>
              <input
                type="file"
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
                placeholder="Patient Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required/>
            </div>

            {/* Gender Selection */}
            <div className="flex justify-center space-x-4">
              <label className={`flex items-center space-x-2 p-3 rounded-md cursor-pointer ${gender === 'Male' ? 'bg-blue-50 border-2 border-blue-500' : 'border-2 border-transparent'}`}>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={gender === 'Male'}
                  onChange={(e) => setGender(e.target.value)}
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
                  onChange={(e) => setGender(e.target.value)}
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
                  onChange={(e) => setGender(e.target.value)}
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
                value={blood_group}
                onChange={(e) => setBloodGroup(e.target.value)}
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
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                UPDATE
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
