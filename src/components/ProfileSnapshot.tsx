'use client';

import React from 'react';

interface Employee {
  id: string;
  name: string;
  title: string;
  start: string;
  birthday: string;
}

interface ProfileSnapshotProps {
  employee: Employee | null;
}

export default function ProfileSnapshot({ employee }: ProfileSnapshotProps) {
  if (!employee) {
    return (
      <div className="bg-[#202327] rounded-none p-6 h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-2xl mb-2">👤</div>
          <p className="text-sm">Select an employee to view their profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#202327] rounded-none border border-[#454446] h-full overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-white font-medium text-sm leading-6">{employee.name}</h2>
            <p className="text-gray-400 text-xs mt-1">{employee.title}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-medium text-sm leading-6">{employee.id}</p>
            <p className="text-gray-400 text-xs mt-1">Employee ID</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#454446] mb-6"></div>

        {/* Profile Image Placeholder */}
        <div className="bg-[#1B1D21] rounded-xl h-48 w-full mb-6 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-xs">Profile Image</p>
          </div>
        </div>

        {/* Employee Details */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">Start Date</span>
            <span className="text-white text-xs">{employee.start}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">Birthday</span>
            <span className="text-white text-xs">{employee.birthday}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 