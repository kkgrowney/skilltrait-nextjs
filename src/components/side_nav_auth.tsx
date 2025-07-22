'use client';

import React from 'react';

export default function SideNavAuth() {
  return (
    <aside className="bg-[#181d21] w-60 min-h-screen flex flex-col justify-between border-r border-[#454446]">
      {/* Top Section */}
      <div className="flex flex-col gap-4 p-3">
        {/* Company Name */}
        <div className="text-center text-gray-300 font-semibold text-base mb-2">Acme, Inc</div>
        {/* Nav Links */}
        <nav className="flex flex-col gap-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#101214] text-[#00df71] font-medium text-base">
            <span className="inline-block w-5 h-5 bg-gray-700 rounded" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 font-medium text-base hover:bg-gray-800">
            <span className="inline-block w-5 h-5 bg-gray-700 rounded" />
            Companies
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 font-medium text-base hover:bg-gray-800">
            <span className="inline-block w-5 h-5 bg-gray-700 rounded" />
            Contacts
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 font-medium text-base hover:bg-gray-800 relative">
            <span className="inline-block w-5 h-5 bg-gray-700 rounded" />
            Notifications
            <span className="ml-auto bg-[#00df71] text-[#181d21] text-xs font-medium rounded-full px-2 py-0.5">3</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 font-medium text-base hover:bg-gray-800">
            <span className="inline-block w-5 h-5 bg-gray-700 rounded" />
            Team
            <span className="ml-auto bg-[#00df71] text-[#181d21] text-xs font-medium rounded-full px-2 py-0.5">5</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 font-medium text-base hover:bg-gray-800">
            <span className="inline-block w-5 h-5 bg-gray-700 rounded" />
            Admin Settings
          </a>
        </nav>
      </div>
      {/* Bottom CTA */}
      <div className="p-3 mt-auto mb-6">
        <button className="w-full bg-[#00dc79] text-[#2b2a2d] font-medium text-xs rounded-lg py-2">Try Premium for 30 days</button>
      </div>
    </aside>
  );
} 