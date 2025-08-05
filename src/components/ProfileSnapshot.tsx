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
      <div className="bg-[#121417] rounded-none p-6 h-full flex items-center justify-center pb-16 border-l border-[#454446]">
        <div className="text-center text-gray-400">
          <div className="text-2xl mb-2">👤</div>
          <p className="text-sm">Select an employee to view their profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121417] box-border content-stretch flex flex-col items-center justify-center p-0 relative size-full">
      {/* Card wrapper with side nav background color */}
      <div className="m-9 bg-[#1F2327] border border-[#1F2327] rounded-[12px] h-full overflow-hidden">
        {/* Header with name and employee ID */}
        <div className="box-border content-stretch flex flex-row font-['Inter:Medium',_sans-serif] font-medium gap-3 items-start justify-start leading-[0] not-italic overflow-clip px-3 py-[18px] relative shrink-0 text-[#ffffff] text-[14px] w-full">
          <div className="basis-0 grow h-7 min-h-px min-w-px relative shrink-0 text-left">
            <p className="block leading-[1.5]">{employee.name}</p>
          </div>
          <div className="basis-0 grow h-7 min-h-px min-w-px relative shrink-0 text-right">
            <p className="block leading-[1.5]">{employee.id}</p>
          </div>
        </div>

        {/* Divider line */}
        <div className="box-border content-stretch flex flex-row gap-3 h-2.5 items-center justify-center overflow-clip px-3 py-[18px] relative shrink-0 w-full">
          <div className="h-0 relative shrink-0 w-[341px]">
            <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
              <div className="w-full h-px bg-[#454446]"></div>
            </div>
          </div>
        </div>

        {/* Profile section header */}
        <div className="box-border content-stretch flex flex-row gap-3 h-[31px] items-center justify-start overflow-clip px-3 py-[18px] relative shrink-0 w-full">
          <div className="basis-0 font-['Poppins:Medium',_sans-serif] grow h-[15px] leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#ffffff] text-[14px] text-left tracking-[0.28px]">
            <p className="block leading-[1.2]">Profile</p>
          </div>
        </div>

        {/* Profile image */}
        <div className="box-border content-stretch flex flex-row gap-3 items-center justify-center overflow-clip px-3 py-[18px] relative shrink-0 w-full">
          <div className="h-[211px] rounded-xl shrink-0 w-[218px] overflow-hidden">
            <img 
              src="profile_detail.png"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Profile details */}
        <div className="box-border content-stretch flex flex-col gap-1 items-start justify-start overflow-clip px-3 py-[18px] relative shrink-0 w-full">
          {/* Name */}
          <div className="font-['Poppins:Medium',_sans-serif] h-[22px] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[18px] text-left w-full">
            <p className="block leading-none">{employee.name}</p>
          </div>

          {/* Title */}
          <div className="font-['Poppins:Regular',_sans-serif] h-[18px] leading-[0] not-italic relative shrink-0 text-[#aeaeae] text-[14px] text-left w-full">
            <p className="block leading-[1.2]">{employee.title}</p>
          </div>

          {/* Pronouns */}
          <div className="font-['Poppins:Regular',_sans-serif] h-[18px] leading-[0] not-italic relative shrink-0 text-[#aeaeae] text-[12px] text-left w-full">
            <p className="block leading-[1.2]">she/her (zo-ee max-well)</p>
          </div>

          {/* Account Status */}
          <div className="font-['Poppins:Regular',_sans-serif] h-[18px] leading-[0] not-italic relative shrink-0 text-[#aeaeae] text-[12px] text-left w-full">
            <p className="leading-[1.2]">
              <span>{`Account: `}</span>
              <span className="text-[#00df71]">Active</span>
            </p>
          </div>

          {/* Location */}
          <div className="font-['Poppins:Regular',_sans-serif] h-[18px] leading-[0] not-italic relative shrink-0 text-[#aeaeae] text-[12px] text-left w-full">
            <p className="block leading-[1.2]">Location: New York, NY</p>
          </div>

          {/* Employment Type */}
          <div className="font-['Poppins:Regular',_sans-serif] h-[18px] leading-[0] not-italic relative shrink-0 text-[#aeaeae] text-[12px] text-left w-full">
            <p className="block leading-[1.2]">Full time employee</p>
          </div>

          {/* Anniversaries section header */}
          <div className="box-border content-stretch flex flex-row gap-3 h-7 items-center justify-start overflow-clip px-0 py-[18px] relative shrink-0 w-full">
            <div className="basis-0 font-['Poppins:Medium',_sans-serif] grow h-[15px] leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#ffffff] text-[14px] text-left tracking-[0.28px]">
              <p className="block leading-[1.2]">Anniversaries</p>
            </div>
          </div>

          {/* Anniversary details */}
          <div className="box-border content-stretch flex flex-row font-['Roboto:Regular',_sans-serif] font-normal gap-3 h-[41px] items-start justify-start leading-[0] overflow-clip p-0 relative shrink-0 text-[#ffffff] text-[12px] text-left w-full">
            <div className="basis-0 grow h-[41px] leading-[1.5] min-h-px min-w-px relative shrink-0">
              <p className="block mb-0">Birthday</p>
              <p className="block">{employee.birthday}</p>
            </div>
            <div className="basis-0 grow h-[41px] leading-[1.5] min-h-px min-w-px relative shrink-0">
              <p className="block mb-0">Work Anniversary</p>
              <p className="block">{employee.start}</p>
            </div>
          </div>

          {/* Contact information section header */}
          <div className="box-border content-stretch flex flex-row gap-3 h-7 items-center justify-start overflow-clip px-0 py-[18px] relative shrink-0 w-full">
            <div className="basis-0 font-['Poppins:Medium',_sans-serif] grow h-[15px] leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#ffffff] text-[14px] text-left tracking-[0.28px]">
              <p className="block leading-[1.2]">Contact information</p>
            </div>
          </div>

          {/* Contact details */}
          <div className="box-border content-stretch flex flex-row font-['Roboto:Regular',_sans-serif] font-normal gap-3 h-14 items-start justify-start leading-[0] overflow-clip p-0 relative shrink-0 text-[#ffffff] text-[12px] text-left w-full">
            <div className="basis-0 grow h-[41px] leading-[1.5] min-h-px min-w-px relative shrink-0">
              <p className="block mb-0">Primary</p>
              <p className="block">(111) 222-3333</p>
            </div>
            <div className="basis-0 grow h-[41px] leading-[1.5] min-h-px min-w-px relative shrink-0">
              <p className="block mb-0">Work email</p>
              <p className="block">carla@workemail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 