"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="text-2xl font-bold">
                  <span className="text-[#2D3748]">Medi</span>
                  <span className="text-[#48BB78]">Archive</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/home" className="text-blue-600 hover:text-blue-700">HOME</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About Us</Link>
              <Link href="/subscriptions" className="text-gray-600 hover:text-gray-900">Subscriptions</Link>
              <Link href="/help" className="text-gray-600 hover:text-gray-900">Help & Support</Link>
              <Link href="/share" className="text-gray-600 hover:text-gray-900">Share MediArchive</Link>
              
              <div className="flex items-center space-x-4">
               
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                  >
                     <span className="text-gray-600">Welcome</span>
                    <svg
                      className={`w-4 h-4 transform transition-transform ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <ul>
                        <li>
                          <button
                            className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            onClick={() => console.log("View Profile")}
                          >
                            Profile
                          </button>
                        </li>
                        <li>
                          <button
                            className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            onClick={() => {
                              localStorage.clear();
                              router.push("/");
                            }}
                          >
                            Log out
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
            </div>
            </div>
          </div>
        </div>
      </nav>
  );
}
