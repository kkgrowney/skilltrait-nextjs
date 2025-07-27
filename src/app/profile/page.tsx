"use client";

import SideNavAuth from '@/components/side_nav_auth';

export default function ProfilePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1B1D21" }}>
      <SideNavAuth />
      <div className="ml-60 p-8">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>
          
          <div className="bg-[#212327] rounded-lg p-6 border" style={{ borderColor: "#454446" }}>
            <h2 className="text-xl font-semibold text-white mb-4">User Profile</h2>
            <p className="text-gray-300">
              This is the profile page. Content will be added here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 