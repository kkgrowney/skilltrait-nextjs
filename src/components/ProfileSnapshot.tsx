'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  title: string;
  startDate: any; // Firestore datetime/timestamp
  birthday: string;
  location: string;
  fullTime: boolean;
  isAdmin: boolean;
  photo?: string;
  role?: string;
  skills?: string[];
  reason?: string;
  skillFulfillment?: Array<{
    inputSkill: string;
    bestSim: number;
  }>;
}

interface ProfileSnapshotProps {
  employee: Employee | null;
}

export default function ProfileSnapshot({ employee }: ProfileSnapshotProps) {
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // Debug logging for employee data
  console.log('ProfileSnapshot received employee:', employee);
  if (employee) {
    console.log('Employee skills:', employee.skills);
  }

  // Fetch skills from top-level skills collection
  const fetchUserSkills = async (userId: string) => {
    if (!userId) return;
    
    setSkillsLoading(true);
    try {
      // Query skills collection where userRef matches the user ID
      const skillsQuery = query(
        collection(db, 'skills'),
        where('userRef', '==', doc(db, 'users', userId))
      );
      
      const skillsSnapshot = await getDocs(skillsQuery);
      const skills = skillsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Fetched user skills:', skills);
      setUserSkills(skills);
    } catch (error) {
      console.error('Error fetching user skills:', error);
      setUserSkills([]);
    } finally {
      setSkillsLoading(false);
    }
  };

  // Fetch skills when employee changes
  useEffect(() => {
    if (employee && employee.id) {
      fetchUserSkills(employee.id);
    } else {
      setUserSkills([]);
    }
  }, [employee]);

  // Handle skill expansion/collapse - only one skill can be expanded at a time
  const toggleSkillExpansion = (skillId: string) => {
    setExpandedSkills(prev => {
      // If clicking the same skill that's already expanded, close it
      if (prev.has(skillId)) {
        return new Set();
      } else {
        // Otherwise, expand only this skill (closes any previously expanded)
        return new Set([skillId]);
      }
    });
  };

  // Helper function to format birthday without year
  const formatBirthday = (birthday: string): string => {
    if (!birthday || birthday === 'Unknown' || birthday === 'Invalid Date') return 'Unknown';
    
    try {
      // If it's already in MM/DD/YYYY format, extract MM/DD
      if (birthday.includes('/')) {
        const parts = birthday.split('/');
        if (parts.length >= 2) {
          return `${parts[0]}/${parts[1]}`;
        }
      }
      
      // Try to parse as a date
      const date = new Date(birthday);
      if (!isNaN(date.getTime())) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}/${day}`;
      }
      
      return birthday;
    } catch (error) {
      return birthday;
    }
  };

  // Helper function to format start date (Firestore datetime)
  const formatStartDate = (startDate: any): string => {
    if (!startDate) return 'Unknown';
    
    try {
      // If it's a Firestore timestamp object
      if (startDate && typeof startDate === 'object' && startDate.seconds) {
        const date = new Date(startDate.seconds * 1000);
        return date.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
      
      // If it's already a string, return as is
      if (typeof startDate === 'string') {
        return startDate;
      }
      
      // If it's a Date object
      if (startDate instanceof Date) {
        return startDate.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
      
      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  };

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
    <div className="bg-[#121417] box-border content-stretch flex flex-col items-center justify-center p-0 relative size-full border-l border-[#454446]">
      {/* Card wrapper with side nav background color */}
      <div className="m-9 p-6 bg-[#1F2327] border border-[#1F2327] rounded-[12px] h-full overflow-y-auto max-w-[600px] w-full hover:overflow-y-auto">
        {/* Header with name and employee ID */}
        <div className="box-border content-stretch flex flex-row font-['Inter:Medium',_sans-serif] font-medium gap-3 items-start justify-start leading-[0] not-italic overflow-clip px-3 py-[18px] relative shrink-0 text-[#ffffff] text-[14px] w-full">
          <div className="basis-0 grow h-7 min-h-px min-w-px relative shrink-0 text-left">
            <p className="block leading-[1.5]">{employee.name}</p>
          </div>
          <div className="basis-0 grow h-7 min-h-px min-w-px relative shrink-0 text-right">
            <p className="block leading-[1.5]">ID: {employee.employeeId}</p>
          </div>
        </div>

        {/* Rank Summary */}
        {employee.reason && (
          <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start overflow-hidden px-3 py-[18px] relative shrink-0 w-full max-w-full">
            <div className="font-['Poppins:Medium',_sans-serif] text-[#ffffff] text-[12px] text-left tracking-[0.24px]">
              <p className="block leading-[1.2]">Rank Summary</p>
            </div>
            <div className="font-['Poppins:Regular',_sans-serif] text-[#aeaeae] text-[11px] text-left leading-[1.3] w-full break-words">
              <p className="block">{employee.reason}</p>
            </div>
          </div>
        )}

        {/* Skills Matrix */}
        {employee.skillFulfillment && employee.skillFulfillment.length > 0 && (
          <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start overflow-hidden px-3 py-[18px] relative shrink-0 w-full max-w-full">
            <div className="font-['Poppins:Medium',_sans-serif] text-[#ffffff] text-[12px] text-left tracking-[0.24px]">
              <p className="block leading-[1.2]">Skills Matrix</p>
            </div>
            <div className="w-full h-80 px-0">
              <Radar
                data={{
                  labels: employee.skillFulfillment.map(skill => skill.inputSkill),
                  datasets: [
                    {
                      label: 'Skill Fulfillment',
                      data: employee.skillFulfillment.map(skill => skill.bestSim),
                      backgroundColor: 'rgba(0, 223, 113, 0.2)',
                      borderColor: '#00DF71',
                      borderWidth: 2,
                      pointBackgroundColor: '#00DF71',
                      pointBorderColor: '#00DF71',
                      pointHoverBackgroundColor: '#0AFB84',
                      pointHoverBorderColor: '#0AFB84',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  layout: {
                    padding: {
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: '#1A1D21',
                      titleColor: '#ffffff',
                      bodyColor: '#ffffff',
                      borderColor: '#00DF71',
                      borderWidth: 1,
                      callbacks: {
                        label: function(context) {
                          return `${context.dataset.label}: ${(context.parsed.r * 100).toFixed(1)}%`;
                        }
                      }
                    }
                  },
                  scales: {
                    r: {
                      beginAtZero: true,
                      min: 0,
                      max: 1,
                      ticks: {
                        stepSize: 0.2,
                        color: '#9CA3AF',
                        font: {
                          size: 8
                        },
                        callback: function(value) {
                          return `${(value * 100).toFixed(0)}%`;
                        },
                        backdropColor: 'transparent',
                        backdropPadding: 0,
                        z: 10
                      },
                      grid: {
                        color: '#374151'
                      },
                      angleLines: {
                        color: '#374151'
                      },
                      pointLabels: {
                        color: '#ffffff',
                        font: {
                          size: 9
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

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
            {employee.photo ? (
              <img 
                src={employee.photo}
                alt={`${employee.name}'s profile photo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = "profile_detail.png";
                }}
              />
            ) : (
              <div className="w-full h-full bg-[#454446] flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {employee.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
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
            <p className="block leading-[1.2]">Location: {employee.location}</p>
          </div>

          {/* Employment Type */}
          <div className="font-['Poppins:Regular',_sans-serif] h-[18px] leading-[0] not-italic relative shrink-0 text-[#aeaeae] text-[12px] text-left w-full">
            <p className="block leading-[1.2]">
              {employee.fullTime ? 'Full time' : 'Part time'} employee
              {employee.isAdmin && (
                <span className="ml-2 text-[#00DF71] font-medium">• Admin</span>
              )}
            </p>
          </div>

          {/* Skills section header */}
          <div className="box-border content-stretch flex flex-row gap-3 h-7 items-center justify-start overflow-clip px-0 py-[18px] relative shrink-0 w-full">
            <div className="basis-0 font-['Poppins:Medium',_sans-serif] grow h-[15px] leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#ffffff] text-[14px] text-left tracking-[0.28px]">
              <p className="block leading-[1.2]">Skills</p>
            </div>
          </div>

          {/* Skills list */}
          <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start overflow-hidden px-0 py-[18px] relative shrink-0 w-full max-w-full">
            {skillsLoading ? (
              <span className="text-[#aeaeae] text-xs">Loading skills...</span>
            ) : userSkills && userSkills.length > 0 ? (
              <>
                {/* Skills buttons - left to right with wrapping */}
                <div className="flex flex-row flex-wrap gap-2 items-start justify-start w-full max-w-full overflow-hidden">
                  {userSkills.map((skill, index) => {
                    const skillId = skill.id || `skill-${index}`;
                    const isExpanded = expandedSkills.has(skillId);
                    const skillName = skill.name || skill.skill || 'Unknown Skill';
                    const hasAnyExpanded = expandedSkills.size > 0;
                    const shouldDim = hasAnyExpanded && !isExpanded;
                    
                    // Check if skill has detail information (proficiency, motivation, or description)
                    const hasDetails = skill.proficiency || skill.motivation || skill.description;
                    
                    // Special case for "scrum" skill - always show as stroke button
                    const isScrumSkill = skillName.toLowerCase().includes('scrum');
                    
                    if (!hasDetails || isScrumSkill) {
                      // Green stroke button for skills without details
                      return (
                        <div key={skillId} className="relative flex-shrink-0">
                          <button
                            className={`px-3 py-1 bg-[#1F2327] border border-[#00DF71] text-[#00DF71] text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0 max-w-full ${
                              shouldDim ? 'opacity-20' : 'opacity-100'
                            } ${isScrumSkill ? '' : 'hover:bg-[#00DF71] hover:text-[#1F2327]'}`}
                            onMouseEnter={() => setHoveredSkill(skillId)}
                            onMouseLeave={() => setHoveredSkill(null)}
                          >
                            <span>{skillName}</span>
                          </button>
                          
                          {/* Custom tooltip */}
                          {hoveredSkill === skillId && (
                            <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-[9999]">
                              {isScrumSkill ? "No details available" : "No details"}
                              <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800"></div>
                            </div>
                          )}
                        </div>
                      );
                    }
                    
                    // Green filled button for skills with details
                    return (
                      <button
                        key={skillId}
                        onClick={() => toggleSkillExpansion(skillId)}
                        className={`flex items-center gap-1 px-3 py-1 bg-[#00DF71] text-[#212327] text-xs font-medium rounded-full hover:bg-[#0AFB84] transition-all duration-200 whitespace-nowrap flex-shrink-0 max-w-full ${
                          shouldDim ? 'opacity-20' : 'opacity-100'
                        }`}
                      >
                        <span>{skillName}</span>
                        <svg 
                          className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
                
                {/* Expanded skill details - full width below skills */}
                {Array.from(expandedSkills).map(skillId => {
                  const skill = userSkills.find(s => (s.id || `skill-${userSkills.indexOf(s)}`) === skillId);
                  if (!skill) return null;
                  
                  const skillName = skill.name || skill.skill || 'Unknown Skill';
                  
                  return (
                    <div 
                      key={`${skillId}-${expandedSkills.size}`} 
                      className="w-full mt-2 p-3 bg-[#1F2327] border border-[#454446] rounded-lg animate-in fade-in-0 slide-in-from-top-2 duration-300"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-xs">Skill:</span>
                          <span className="text-[#00DF71] text-xs font-medium">
                            {skillName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-xs">Proficiency:</span>
                          <span className="text-[#00DF71] text-xs font-medium">
                            {skill.proficiency || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-xs">Motivation:</span>
                          <span className="text-[#00DF71] text-xs font-medium">
                            {skill.motivation || 'Not specified'}
                          </span>
                        </div>
                          <div className="pt-2 border-t border-[#454446]">
                            <p className="text-[#aeaeae] text-xs leading-relaxed">
                              {skill.description || 'No description available for this skill.'}
                            </p>
                          </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <span className="text-[#aeaeae] text-xs">No skills listed</span>
            )}
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
              <p className="block">{formatBirthday(employee.birthday)}</p>
            </div>
            <div className="basis-0 grow h-[41px] leading-[1.5] min-h-px min-w-px relative shrink-0">
              <p className="block mb-0">Work Anniversary</p>
              <p className="block">{formatStartDate(employee.startDate)}</p>
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