"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PackageValues {
  has_access: boolean;
  limit: number;
  used: number;
}

interface StorageValues extends Omit<PackageValues, 'limit' | 'used'> {
  limit: number;
  used: number;
  limit_storage_type: string;
  used_storage_type: string;
}

interface Package {
  package_type: string;
  slug: string;
  name: string;
  start_date: string;
  expire_date: string;
  duration_value: number;
  duration_type: string;
  amount: string;
  id: number;
  subscription_plan_id: number;
  status: string;
  values: {
    profile: PackageValues;
    prescription: PackageValues;
    lab_report: PackageValues;
    reminder: {
      has_access: boolean;
      limit: string;
    };
    storage: StorageValues;
  };
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  dialing_code: string;
  phone_number: string;
  verified_at: string;
  created_at: string;
  updated_at: string;
  package: Package;
  has_activate_paid_subscription: boolean;
}

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
   
    if (!token) {
      router.push('/');
      return;
    }
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('http://192.168.50.88:8000/v1/clients/me/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  if (!profile) return <div className="flex justify-center items-center min-h-screen">No profile data found</div>;

  return (
   <div className="min-h-screen bg-gray-50">
         <Navbar />
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{profile.name}</h2>
            <p className="text-gray-600">{profile.email}</p>
            <p className="text-gray-600">{profile.dialing_code}{profile.phone_number}</p>
            <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Patient Profile Added</h3>
              <div className="flex items-center">
                <div className="flex-grow bg-blue-100 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(profile.package.values.profile.used / profile.package.values.profile.limit) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="ml-2">
                  {profile.package.values.profile.used}/{profile.package.values.profile.limit}
                </span>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Space Used</h3>
              <div className="flex items-center">
                <div className="flex-grow bg-blue-100 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(profile.package.values.storage.used / profile.package.values.storage.limit) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="ml-2">
                  {profile.package.values.storage.used} {profile.package.values.storage.used_storage_type}/
                  {profile.package.values.storage.limit} {profile.package.values.storage.limit_storage_type}
                </span>
              </div>
            </div>
          </div>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">My Subscription</h2>
            <div className="bg-blue-500 text-white rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{profile.package.name} [{profile.package.package_type}]</h3>
                  <p className="mt-2">${profile.package.amount} / month</p>
                  <p className="text-sm mt-1">{profile.package.status.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
} 