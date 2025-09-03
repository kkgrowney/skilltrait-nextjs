'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SideNavigation, { useSideNavMargin } from '@/components/SideNavigation';
import { useNavigation } from '@/contexts/NavigationContext';
import { useEffect, useState, useMemo } from 'react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ViewTitleTab from '@/components/ViewTitleTab';
import EmployeesContent from '@/components/EmployeesContent';
import DragDropUpload from '@/components/DragDropUpload';
import ProfileSnapshot from '@/components/ProfileSnapshot';

// SkillRankSection Component
interface SkillRankSectionProps {
  skillData: {
    skill: string;
    proficiency: string;
    motivation: string;
  };
  employeesRanked: boolean;
  onChevronClick: () => void;
  rankedEmployees: any[];
}

function SkillRankSection({ skillData, employeesRanked, onChevronClick, rankedEmployees }: SkillRankSectionProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

  // Get ranked employees from parent component
  const skillRankedEmployees = useMemo(() => {
    console.log(`🔍 useMemo for skill: ${skillData.skill}`);
    console.log(`  - rankedEmployees:`, rankedEmployees);
    console.log(`  - rankedEmployees.length:`, rankedEmployees.length);
    
    // Find the employees for this specific skill
    const skillResult = rankedEmployees.find(result => result.skill === skillData.skill);
    console.log(`  - skillResult found:`, skillResult);
    
    const employees = skillResult ? skillResult.employees : [];
    console.log(`  - returning employees:`, employees);
    console.log(`  - employees.length:`, employees.length);
    
    return employees;
  }, [rankedEmployees, skillData.skill]);

  // Auto-expand when employee data is successfully loaded for this specific skill
  useEffect(() => {
    console.log(`🔍 Auto-expand check for skill: ${skillData.skill}`);
    console.log(`  - skillRankedEmployees.length: ${skillRankedEmployees.length}`);
    console.log(`  - isExpanded: ${isExpanded}`);
    console.log(`  - skillRankedEmployees:`, skillRankedEmployees);
    
    if (skillRankedEmployees.length > 0 && !isExpanded) {
      console.log(`🔍 Auto-expanding chevron for skill: ${skillData.skill}, employees: ${skillRankedEmployees.length}`);
      setIsExpanded(true);
    }
  }, [skillRankedEmployees.length, isExpanded, skillData.skill]);

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'Master': return 'text-purple-400';
      case 'Expert': return 'text-blue-400';
      case 'Advanced': return 'text-green-400';
      case 'Intermediate': return 'text-yellow-400';
      case 'Beginner': return 'text-gray-400';
      default: return 'text-gray-300';
    }
  };

  const getMotivationColor = (motivation: string) => {
    switch (motivation) {
      case 'Very High': return 'text-green-400';
      case 'High': return 'text-blue-400';
      case 'Moderate': return 'text-yellow-400';
      case 'Low': return 'text-orange-400';
      case 'Very Low': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Full Time' ? 'bg-green-500' : 'bg-orange-500';
  };

  const getProficiencyLevel = (proficiency: string) => {
    switch (proficiency) {
      case 'Beginner': return 1;
      case 'Intermediate': return 2;
      case 'Advanced': return 3;
      case 'Expert': return 4;
      case 'Master': return 5;
      default: return 0;
    }
  };

  const getMotivationLevel = (motivation: string) => {
    switch (motivation) {
      case 'Very Low': return 1;
      case 'Low': return 2;
      case 'Moderate': return 3;
      case 'High': return 4;
      case 'Very High': return 5;
      default: return 0;
    }
  };

  // Handle employee selection
  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  // Handle select all employees
  const handleSelectAll = (checked: boolean) => {
    if (checked && skillRankedEmployees.length > 0) {
      const allIds = skillRankedEmployees.slice(0, 10).map((emp: any) => emp.id);
      setSelectedEmployees(new Set(allIds));
      } else {
      setSelectedEmployees(new Set());
    }
  };



  // This function is no longer needed - we use the new ranking system instead

  return (
    <div className="bg-[#212327] rounded-lg border border-[#454446] overflow-hidden">
      {/* Skill Header */}
      <div className="p-4 bg-[#2a2e32] border-b border-[#454446]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white">{skillData.skill}</h4>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 whitespace-nowrap">Proficiency</span>
                                  <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'].map((level, index) => (
                    <div
                      key={level}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        getProficiencyLevel(skillData.proficiency) >= index + 1
                          ? 'bg-[#00DF71]'
                          : 'bg-[#454446]'
                      }`}
                    />
                  ))}
                    </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 whitespace-nowrap">Motivation</span>
                                  <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {['Very Low', 'Low', 'Moderate', 'High', 'Very High'].map((level, index) => (
                    <div
                      key={level}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        getMotivationLevel(skillData.motivation) >= index + 1
                          ? 'bg-[#00DF71]'
                          : 'bg-[#454446]'
                      }`}
                    />
                  ))}
                    </div>
                </div>
              </div>
            </div>
                      </div>
                        <div className="flex items-center gap-2">
              {/* Custom Container */}
              <button 
                onClick={() => {
                  // Trigger ranking for this specific skill
                  const skillToRank = [{
                    skill: skillData.skill,
                    proficiency: skillData.proficiency,
                    motivation: skillData.motivation
                  }];
                  
                  console.log('🔍 Debug: Individual skill ranking triggered for:', skillData.skill);
                  console.log('🔍 Debug: skillToRank array:', skillToRank);
                  
                  // Call the parent's ranking function
                  if (typeof window !== 'undefined') {
                    // Use a custom event to communicate with parent component
                    const event = new CustomEvent('rankSingleSkill', {
                      detail: { skillToRank }
                    });
                    window.dispatchEvent(event);
                  }
                }}
                className="ml-5 flex items-center gap-2 px-3 py-2 rounded-lg transition-all bg-[#00DF71] hover:bg-[#0AFB84] text-[#212327] font-medium cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105"
                title={`Rank employees based on ${skillData.skill} skill`}
              >
                <span className="text-xs whitespace-nowrap">
                  Rank Employees
                </span>
                  <svg 
                    className="w-5 h-5" 
                    viewBox="0 0 20 20" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                  <path d="M6.16667 16.3333H2V8.08333C2 7.97283 2.0439 7.86685 2.12204 7.78871C2.20018 7.71057 2.30616 7.66667 2.41667 7.66667H5.75C5.86051 7.66667 5.96649 7.71057 6.04463 7.78871C6.12277 7.86685 6.16667 7.97283 6.16667 8.08333V16.3333ZM12.4167 3.41667C12.4167 3.30616 12.3728 3.20018 12.2946 3.12204C12.2165 3.0439 12.1105 3 12 3H8.66667C8.55616 3 8.45018 3.0439 8.37204 3.12204C8.2939 3.20018 8.25 3.30616 8.25 3.41667V16.3333H12.4167V3.41667ZM18.25 10.3333H14.9167C14.8062 10.3333 14.7002 10.3772 14.622 10.4554C14.5439 10.5335 14.5 10.6395 14.5 10.75V16.3333H18.6667V10.75C18.6667 10.6395 18.6228 10.5335 18.5446 10.4554C18.4665 10.3772 18.3605 10.3333 18.25 10.3333Z" fill="currentColor"/>
                  </svg>
              </button>
              {/* Expand/Collapse Arrow */}
            <button 
              onClick={() => {
                // Allow expansion when we have employee data for this skill
                if (skillRankedEmployees.length > 0) {
                  setIsExpanded(!isExpanded);
                }
              }}
              className={`p-2 transition-colors ${
                skillRankedEmployees.length > 0 
                  ? 'text-gray-300 hover:text-white cursor-pointer' 
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              title={
                skillRankedEmployees.length > 0 
                  ? "Click to expand/collapse employee list" 
                  : "Ranking not completed yet"
              }
            >
              <svg 
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Employee Grid */}
      {isExpanded && (
        <div className="p-4">

          {/* Selection Counter */}
          {selectedEmployees.size > 0 && (
            <div className="mb-4 flex items-center justify-between bg-[#1B1D21] rounded-lg border border-[#454446] p-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">
                  {selectedEmployees.size} employee{selectedEmployees.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedEmployees(new Set())}
                  className="text-xs text-gray-400 hover:text-white transition-colors underline"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-[#00DF71] text-black text-xs font-medium rounded hover:bg-[#00DF71]/90 transition-colors">
                  Export Selected
                </button>
                <button className="px-3 py-1.5 bg-[#454446] text-white text-xs font-medium rounded hover:bg-[#454446]/80 transition-colors">
                  Compare Selected
                </button>
              </div>
            </div>
          )}

          {/* Employee Table */}
          <div className="bg-[#1e2327] rounded-lg border border-[#454446] overflow-hidden">
            {/* Horizontal Scrollable Container */}
            <div className="overflow-x-auto">
              {/* Table with Fixed Column Widths */}
              <div className="min-w-[600px]">
                {/* Table Header */}
                <div className="bg-[#1B1D21] border-b border-[#3D3C3E] p-0">
                  <div className="flex">
                    <div className="w-[40px] py-3 flex justify-center">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.size === skillRankedEmployees.slice(0, 10).length && selectedEmployees.size > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4 text-[#00DF71] focus:ring-[#00DF71] border-gray-600 rounded bg-[#1B1D21]"
                        style={{ accentColor: '#00DF71' }}
                      />
                    </div>

                    <div className="pl-3 pr-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider flex-1">NAME</div>
                    <div className="pl-3 pr-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider flex-1">TITLE</div>
                    <div className="pl-3 pr-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider flex-1">LOCATION</div>
                    <div className="pl-3 pr-20 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider flex-1">CONFIDENCE (1-100)</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-[#3D3C3E]">
                  {skillRankedEmployees
                    .slice(0, 10) // Show top 10 employees
                    .map((employee: any, index: number) => (
                      <div 
                        key={employee.id} 
                        className={`flex cursor-pointer transition-all duration-200 ${
                          selectedEmployees.has(employee.id) 
                            ? 'bg-[#202327] border-l-2 border-[#00DF71]' 
                            : 'bg-[#191D21] hover:bg-[#202327]'
                        }`}
                                                  onClick={() => {
                            setSelectedEmployee(employee);
                            setShowProfileModal(true);
                          }}
                      >
                        <div className="w-[40px] py-4 flex justify-center">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.has(employee.id)}
                            onChange={(e) => handleSelectEmployee(employee.id, e.target.checked)}
                            className="h-4 w-4 text-[#00DF71] focus:ring-[#00DF71] border-gray-600 rounded bg-[#1B1D21]"
                            style={{ accentColor: '#00DF71' }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        <div 
                          className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-white font-medium flex-1 underline hover:text-gray-300 transition-colors"
                        >
                          {employee.name}
                        </div>
                        <div className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-gray-300 flex-1">{employee.title}</div>
                        <div className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-gray-300 flex-1">{employee.location}</div>
                        <div className="pl-3 pr-20 py-4 whitespace-nowrap text-sm text-gray-300 flex-1 text-center">
                          {employee.similarity || '0'}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Showing top {Math.min(skillRankedEmployees.length, 10)} employees ranked by {skillData.skill} confidence
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Rankings based on confidence scores (highest to lowest)
            </p>
          </div>
        </div>
      )}

      {/* ProfileSnapshot Modal */}
      {showProfileModal && selectedEmployee && (
        <div 
          className="fixed inset-0 z-50 transition-all duration-500"
          style={{
            backgroundColor: isClosing ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 0, 0.3)'
          }}
          onClick={() => {
            setIsClosing(true);
            setTimeout(() => {
              setShowProfileModal(false);
              setSelectedEmployee(null);
              setIsClosing(false);
            }, 500);
          }}
        >
          <div 
            className={`absolute right-0 top-0 h-full bg-[#1A1D21] transform transition-transform duration-500 ease-in-out ${
              isClosing ? 'translate-x-full' : 'translate-x-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - positioned in top-right corner */}
            <button
              onClick={() => {
                setIsClosing(true);
                setTimeout(() => {
                  setShowProfileModal(false);
                  setSelectedEmployee(null);
                  setIsClosing(false);
                }, 500);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#2a2e32] rounded-lg z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Full Height ProfileSnapshot Content */}
            <div className="h-full overflow-y-auto">
              <ProfileSnapshot employee={selectedEmployee} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Team() {
  // Add CSS animation for notification
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        0% { opacity: 0; transform: translateY(-100%); }
        20% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-100%); }
      }
      
      @keyframes slideInRight {
        0% { opacity: 0; transform: translateX(100%); }
        100% { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes slideOutRight {
        0% { opacity: 1; transform: translateX(0); }
        100% { opacity: 0; transform: translateX(100%); }
      }
      
      .animate-slideInRight {
        transform: translateX(0);
        transition: transform 0.5s ease-in-out;
      }
      
      .animate-slideOutRight {
        transform: translateX(100%);
        transition: transform 0.5s ease-in-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const { user, loading } = useAuth();
  const router = useRouter();
  const sideNavMargin = useSideNavMargin();
  const { currentView, setCurrentView } = useNavigation();
  const [teamProfile, setTeamProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [adminMembers, setAdminMembers] = useState<any[]>([]);
  const [isLoadingAdminMembers, setIsLoadingAdminMembers] = useState(true);
  const [activeTab, setActiveTab] = useState('skill-search');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [hasTeam, setHasTeam] = useState(false);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [totalEmployeeCount, setTotalEmployeeCount] = useState(66);
  const [skillProficiencies, setSkillProficiencies] = useState<{ [key: string]: string }>({});
  const [skillMotivations, setSkillMotivations] = useState<{ [key: string]: string }>({});
  const [selectedSkillsForAction, setSelectedSkillsForAction] = useState<string[]>([]);
  const [bulkProficiency, setBulkProficiency] = useState<string>('Advanced');
  const [bulkMotivation, setBulkMotivation] = useState<string>('Moderate');
  const [showProficiencyDropdown, setShowProficiencyDropdown] = useState(false);
  const [showMotivationDropdown, setShowMotivationDropdown] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{ [key: string]: { proficiency?: string; motivation?: string } }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [rightContainerTab, setRightContainerTab] = useState<'required-skills' | 'rank-employees'>('required-skills');
  const [notification, setNotification] = useState<string | null>(null);
  const [rankEmployeesSkills, setRankEmployeesSkills] = useState<{ skill: string; proficiency: string; motivation: string }[]>([]);
  const [employeesRanked, setEmployeesRanked] = useState(false);
  const [isAllSkillsExpanded, setIsAllSkillsExpanded] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [skillsToRemove, setSkillsToRemove] = useState<string[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvFileName, setCsvFileName] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [editingSkillValue, setEditingSkillValue] = useState<string>('');
  const [rankedEmployeeResults, setRankedEmployeeResults] = useState<any[]>([]);
  const [isRankingLoading, setIsRankingLoading] = useState(false);

  // Handle adding a skill to required skills
  const handleAddSkill = (skill: string) => {
    if (!requiredSkills.includes(skill)) {
      setRequiredSkills([...requiredSkills, skill]);
    }
  };

  // Helper functions to convert proficiency/motivation to integers
  const getProficiencyInt = (proficiency: string): number => {
    switch (proficiency) {
      case 'Beginner': return 1;
      case 'Intermediate': return 2;
      case 'Advanced': return 3;
      case 'Expert': return 4;
      case 'Master': return 5;
      default: return 1;
    }
  };

  const getMotivationInt = (motivation: string): number => {
    switch (motivation) {
      case 'Very Low': return 1;
      case 'Low': return 2;
      case 'Moderate': return 3;
      case 'High': return 4;
      case 'Very High': return 5;
      default: return 1;
    }
  };

  // Handle removing a skill from required skills
  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  // Handle proficiency change for a skill
  const handleProficiencyChange = (skill: string, proficiency: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [skill]: {
        ...prev[skill],
        proficiency: proficiency
      }
    }));
  };

  // Handle motivation change for a skill
  const handleMotivationChange = (skill: string, motivation: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [skill]: {
        ...prev[skill],
        motivation: motivation
      }
    }));
  };



  // Handle bulk update of selected skills
  const handleBulkUpdate = () => {
    const updatedProficiencies = { ...skillProficiencies };
    const updatedMotivations = { ...skillMotivations };
    
    // Apply bulk changes to selected skills
    selectedSkillsForAction.forEach(skill => {
      updatedProficiencies[skill] = bulkProficiency;
      updatedMotivations[skill] = bulkMotivation;
    });
    
    // Apply pending changes from individual skill modifications
    Object.keys(pendingChanges).forEach(skill => {
      const pendingSkillChanges = pendingChanges[skill];
      if (pendingSkillChanges.proficiency) {
        updatedProficiencies[skill] = pendingSkillChanges.proficiency;
      }
      if (pendingSkillChanges.motivation) {
        updatedMotivations[skill] = pendingSkillChanges.motivation;
      }
    });
    
    setSkillProficiencies(updatedProficiencies);
    setSkillMotivations(updatedMotivations);
    setSelectedSkillsForAction([]);
    setBulkProficiency('Advanced');
    setBulkMotivation('Moderate');
    setPendingChanges({}); // Clear pending changes after saving
  };

  // Handle file upload and skills building
  const handleBuildSkills = async () => {
    if (!csvFile || !user) return;

    setIsProcessingFile(true);
    try {
      // Get Firebase auth token
      const token = await user.getIdToken();
      
      // Create form data
      const formData = new FormData();
      formData.append('file', csvFile);

      // Call the parse-file API
      const response = await fetch('/api/parse-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.text) {
        // Log the extracted text content to console
        console.log('=== EXTRACTED FILE CONTENT ===');
        console.log('File name:', csvFileName);
        console.log('File type:', csvFile.type);
        console.log('Extracted text:');
        console.log(data.text);
        console.log('=== END EXTRACTED CONTENT ===');
        
        // Send extracted text to our proxy API route to get skills
        try {
          console.log('=== CALLING GET SKILLS API ===');
          console.log('Extracted text length:', data.text.length);
          
          const skillsResponse = await fetch("/api/get-skills", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              value: data.text
            })
          });
          
          console.log('Response status:', skillsResponse.status);
          console.log('Response ok:', skillsResponse.ok);
          
          const skillsData = await skillsResponse.json();
          
          if (!skillsResponse.ok) {
            throw new Error(skillsData.error || 'Failed to get skills from API');
          }
          
          const skillsResult = skillsData.skills;
          
          console.log('=== CLOUD FUNCTION RESPONSE ===');
          console.log('Skills from cloud function:', skillsResult);
          console.log('=== END CLOUD FUNCTION RESPONSE ===');
          
          // Parse the skills from the cloud function response
          let skills: string[] = [];
          try {
            // The cloud function returns: {"message":"```json\n[\"skill1\",\"skill2\"]\n```"}
            // First try to parse the outer JSON
            const outerResponse = JSON.parse(skillsResult);
            
            if (outerResponse.message) {
              // Extract the JSON array from the markdown code block
              const jsonMatch = outerResponse.message.match(/```json\n(.*?)\n```/s);
              if (jsonMatch) {
                const skillsArray = JSON.parse(jsonMatch[1]);
                if (Array.isArray(skillsArray)) {
                  skills = skillsArray;
                }
              }
            } else if (Array.isArray(outerResponse)) {
              // Direct array response
              skills = outerResponse;
            } else if (outerResponse.skills && Array.isArray(outerResponse.skills)) {
              // Skills property
              skills = outerResponse.skills;
            }
          } catch (parseError) {
            console.log('JSON parsing failed, trying fallback:', parseError);
            // If not JSON, try to split by common delimiters
            skills = skillsResult.split(/[,\n\r;]/).map(skill => skill.trim()).filter(skill => skill.length > 0);
          }
          
          console.log('=== PARSED SKILLS FROM CLOUD FUNCTION ===');
          console.log('Skills array:', skills);
          console.log('=== END PARSED SKILLS ===');

          // Add unique skills to required skills
          const newSkills = skills.filter(skill => 
            skill && 
            !requiredSkills.includes(skill) && 
            skill.length > 0
          );

          console.log('=== FINAL SKILLS TO ADD ===');
          console.log('New skills to add:', newSkills);
          console.log('Existing skills:', requiredSkills);
          console.log('=== END FINAL SKILLS ===');

          if (newSkills.length > 0) {
            setRequiredSkills(prev => [...prev, ...newSkills]);
            setNotification(`Added ${newSkills.length} new skills from file!`);
            setTimeout(() => setNotification(null), 3000);
            
            // Clear the file after successful import
            setCsvFile(null);
            setCsvFileName('');
          } else {
            setNotification('No new skills found in file or all skills already exist.');
            setTimeout(() => setNotification(null), 3000);
          }
        } catch (apiError) {
          console.error('Error calling get-skills API:', apiError);
          console.log('=== FALLBACK: USING EXTRACTED TEXT DIRECTLY ===');
          
          // Fallback: Use the extracted text directly and try to extract skills
          const fallbackSkills = data.text
            .split(/[,\n\r;]/)
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0 && skill.length < 100)
            .slice(0, 15); // Limit to first 15 potential skills
          
          console.log('Fallback skills extracted:', fallbackSkills);
          
          const newSkills = fallbackSkills.filter(skill => 
            skill && 
            !requiredSkills.includes(skill) && 
            skill.length > 0
          );

          if (newSkills.length > 0) {
            setRequiredSkills(prev => [...prev, ...newSkills]);
            setNotification(`Added ${newSkills.length} skills from file (using fallback method).`);
            setTimeout(() => setNotification(null), 3000);
            
            // Clear the file after successful import
            setCsvFile(null);
            setCsvFileName('');
          } else {
            setNotification('Skills API unavailable and no skills could be extracted from file.');
            setTimeout(() => setNotification(null), 3000);
          }
        }
      } else {
        setNotification(data.error || 'Error processing file.');
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setNotification('Error processing file. Please check the file format.');
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Handle skill name editing
  const handleSkillNameEdit = (skill: string) => {
    setEditingSkill(skill);
    setEditingSkillValue(skill);
  };

  const handleSkillNameSave = () => {
    if (editingSkill && editingSkillValue.trim()) {
      const newSkillName = editingSkillValue.trim();
      
      // Check if the new name already exists (avoid duplicates)
      if (newSkillName !== editingSkill && requiredSkills.includes(newSkillName)) {
        setNotification('A skill with this name already exists.');
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      // Update the skill name
      setRequiredSkills(prev => 
        prev.map(s => s === editingSkill ? newSkillName : s)
      );

      // Update related data structures
      if (skillProficiencies[editingSkill]) {
        setSkillProficiencies(prev => {
          const newProficiencies = { ...prev };
          newProficiencies[newSkillName] = newProficiencies[editingSkill];
          delete newProficiencies[editingSkill];
          return newProficiencies;
        });
      }

      if (skillMotivations[editingSkill]) {
        setSkillMotivations(prev => {
          const newMotivations = { ...prev };
          newMotivations[newSkillName] = newMotivations[editingSkill];
          delete newMotivations[editingSkill];
          return newMotivations;
        });
      }

      if (pendingChanges[editingSkill]) {
        setPendingChanges(prev => {
          const newChanges = { ...prev };
          newChanges[newSkillName] = newChanges[editingSkill];
          delete newChanges[editingSkill];
          return newChanges;
        });
      }

      // Update selected skills if the edited skill was selected
      if (selectedSkillsForAction.includes(editingSkill)) {
        setSelectedSkillsForAction(prev => 
          prev.map(s => s === editingSkill ? newSkillName : s)
        );
      }

      setNotification('Skill name updated successfully!');
      setTimeout(() => setNotification(null), 3000);
    }
    
    // Exit edit mode
    setEditingSkill(null);
    setEditingSkillValue('');
  };

  const handleSkillNameCancel = () => {
    setEditingSkill(null);
    setEditingSkillValue('');
  };

  // Handle rank employees action
  const handleRankEmployees = () => {
    const skillsToRank = selectedSkillsForAction.map(skill => {
      // Get the most current value: pending changes first, then saved values, then defaults
      const currentProficiency = pendingChanges[skill]?.proficiency || skillProficiencies[skill] || 'Advanced';
      const currentMotivation = pendingChanges[skill]?.motivation || skillMotivations[skill] || 'Moderate';
      
      return {
        skill,
        proficiency: currentProficiency,
        motivation: currentMotivation
      };
    });
    
    setRankEmployeesSkills(skillsToRank);
    setRightContainerTab('rank-employees');
    setSelectedSkillsForAction([]);
    setPendingChanges({});
    
    // Don't start the ranking process automatically - let user click individual skill buttons
  };

  // Start employee ranking process
  const startEmployeeRanking = async (skillsToRank: any[]) => {
    try {
      // Set loading state
      setIsRankingLoading(true);
      setNotification('Starting employee ranking process...');
      
      // Get company ID from existing companyRef
      let companyId: string = '';
      console.log('🔍 Debug: teamProfile:', teamProfile);
      console.log('🔍 Debug: teamProfile.companyReference:', teamProfile?.companyReference);
      console.log('🔍 Debug: typeof teamProfile.companyReference:', typeof teamProfile?.companyReference);
      
      if (teamProfile && teamProfile.companyReference) {
        if (typeof teamProfile.companyReference === 'string') {
          companyId = teamProfile.companyReference;
          console.log('🔍 Debug: Using string company ID:', companyId);
        } else if (teamProfile.companyReference && typeof teamProfile.companyReference === 'object') {
          // Handle Firestore document reference object
          if ('path' in teamProfile.companyReference) {
            companyId = teamProfile.companyReference.path.split('/').pop() || '';
            console.log('🔍 Debug: Using path company ID:', companyId);
            console.log('🔍 Debug: Full path:', teamProfile.companyReference.path);
          } else if ('referencePath' in teamProfile.companyReference) {
            companyId = teamProfile.companyReference.referencePath.split('/').pop() || '';
            console.log('🔍 Debug: Using referencePath company ID:', companyId);
            console.log('🔍 Debug: Full referencePath:', teamProfile.companyReference.referencePath);
          }
        }
      }
      
      // If teamProfile doesn't have companyReference, try to get it from the user's active connection
      if (!companyId) {
        console.log('🔄 teamProfile missing companyReference, checking user connections...');
        
        try {
          // Query user connections directly to get company ID
          const userConnectionsQuery = query(
            collection(db, 'connectedCompanies'),
            where('userRef', '==', doc(db, 'users', user!.uid)),
            where('active', '==', true),
            where('verified', '==', true)
          );
          
          const userConnectionsSnapshot = await getDocs(userConnectionsQuery);
          
          if (!userConnectionsSnapshot.empty) {
            const userConnection = userConnectionsSnapshot.docs[0];
            const companyData = userConnection.data();
            
            if (companyData.companyReference) {
              if (typeof companyData.companyReference === 'string') {
                companyId = companyData.companyReference;
                console.log('🔍 Debug: From user connection - Using string company ID:', companyId);
              } else if (companyData.companyReference && typeof companyData.companyReference === 'object') {
                if ('path' in companyData.companyReference) {
                  companyId = companyData.companyReference.path.split('/').pop() || '';
                  console.log('🔍 Debug: From user connection - Using path company ID:', companyId);
                } else if ('referencePath' in companyData.companyReference) {
                  companyId = companyData.companyReference.referencePath.split('/').pop() || '';
                  console.log('🔍 Debug: From user connection - Using referencePath company ID:', companyId);
                }
              }
            }
          }
        } catch (connectionError) {
          console.error('❌ Error fetching user connections:', connectionError);
        }
      }
      
      console.log('🔍 Debug: Final companyId:', companyId);
      
      if (!companyId) {
        console.error('❌ Company ID not found after refetch. teamProfile:', teamProfile);
        throw new Error('Company ID not found. Please ensure you have an active company connection.');
      }
      
      // Call cloud function for each skill
      const allRankedEmployees: any[] = [];
      
      console.log('🚀 Starting ranking for skills:', skillsToRank);
      console.log('🏢 Using company ID:', companyId);
      console.log('🔍 skillsToRank type:', typeof skillsToRank);
      console.log('🔍 skillsToRank length:', skillsToRank.length);
      console.log('🔍 skillsToRank structure:', JSON.stringify(skillsToRank, null, 2));
      
      for (const skillData of skillsToRank) {
        try {
          console.log('📋 Processing skill:', skillData);
          console.log('📋 skillData type:', typeof skillData);
          console.log('📋 skillData keys:', Object.keys(skillData));
          console.log('📋 skillData.skill:', skillData.skill);
          console.log('📋 skillData.proficiency:', skillData.proficiency);
          console.log('📋 skillData.motivation:', skillData.motivation);
          
          const rankedEmployees = await callVectorSearchAPI(skillData, companyId);
          allRankedEmployees.push({
            skill: skillData.skill,
            employees: rankedEmployees
          });
        } catch (error) {
          console.error(`Error ranking for skill ${skillData.skill}:`, error);
          // Continue with other skills even if one fails
        }
      }
      
      // Store the ranked results
      console.log('🔍 Storing ranked results:', allRankedEmployees);
      setRankedEmployeeResults(allRankedEmployees);
      
      // Mark ranking as complete
      setEmployeesRanked(true);
      
      setNotification('Employee ranking completed successfully!');
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      console.error('Error ranking employees:', error);
      setNotification(`Error ranking employees: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsRankingLoading(false);
    }
  };

  // Call the vectorSearch cloud function
  const callVectorSearchAPI = async (skillData: any, companyId: string) => {
    console.log('🎯 callVectorSearchAPI called with:');
    console.log('  - skillData:', skillData);
    console.log('  - companyId:', companyId);
    console.log('  - skillData type:', typeof skillData);
    console.log('  - companyId type:', typeof companyId);
    
    // Validate skillData structure
    if (!skillData || typeof skillData !== 'object') {
      throw new Error('Invalid skillData: must be an object');
    }
    
    if (!skillData.skill) {
      throw new Error('Missing skill name in skillData');
    }
    
    // Use default values if proficiency/motivation are missing
    const proficiency = skillData.proficiency || 'Advanced';
    const motivation = skillData.motivation || 'Moderate';
    
    console.log('  - Using proficiency:', proficiency);
    console.log('  - Using motivation:', motivation);
    
    // Map proficiency and motivation to integers
    const proficiencyInt = getProficiencyInt(proficiency);
    const motivationInt = getMotivationInt(motivation);
    
    console.log('  - skillData.proficiency:', skillData.proficiency);
    console.log('  - skillData.motivation:', skillData.motivation);
    console.log('  - proficiencyInt mapped:', proficiencyInt);
    console.log('  - motivationInt mapped:', motivationInt);
    
    const requestBody = {
      query: skillData.skill,
      comp: companyId,
      mot: motivationInt,
      prof: proficiencyInt
    };
    
    console.log('🔍 Debug: skillData received:', skillData);
    console.log('🔍 Debug: companyId received:', companyId);
    console.log('🔍 Debug: proficiencyInt calculated:', proficiencyInt);
    console.log('🔍 Debug: motivationInt calculated:', motivationInt);
    console.log('🔍 Debug: requestBody object:', requestBody);
    console.log('🔍 Debug: requestBody JSON stringified:', JSON.stringify(requestBody));
    console.log('🔍 Debug: requestBody type:', typeof requestBody);
    console.log('🔍 Debug: JSON.stringify result type:', typeof JSON.stringify(requestBody));
    
    console.log('📤 Sending request to cloud function with body:', JSON.stringify(requestBody, null, 2));
    
    // Use our Next.js API route to avoid CORS issues
    const apiUrl = '/api/vector-search';
    
    console.log('🌐 Making request to Next.js API route:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Vector search result for', skillData.skill, ':', result);
    
    // Extract the results array from the response
    const results = result.results || [];
    console.log('Extracted results for', skillData.skill, ':', results);
    
    // Process the results to get user information
    const processedEmployees = await Promise.all(
      results.map(async (item: any) => {
        try {
          // Extract user ID from userRef (now a string)
          const userId = item.userRef;
          
          if (!userId) {
            console.warn('No user ID found in userRef:', item.userRef);
            return null;
          }
          
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', userId));
          
          if (!userDoc.exists()) {
            console.warn('User document not found for ID:', userId);
            return null;
          }
          
          const userData = userDoc.data();
          
          // Map motivation and proficiency from numbers to strings
          const motivationMap: { [key: number]: string } = {
            1: 'Very Low',
            2: 'Low', 
            3: 'Moderate',
            4: 'High',
            5: 'Very High'
          };
          
          const proficiencyMap: { [key: number]: string } = {
            1: 'Beginner',
            2: 'Intermediate',
            3: 'Advanced',
            4: 'Expert',
            5: 'Master'
          };
          
          // Calculate confidence percentage (confidence is already 0-100)
          const confidence = item.confidence || 0;
          const confidencePercentage = confidence.toFixed(2);
          
          return {
            id: userId,
            name: userData.display_name || userData.displayName || userData.name || 'Unknown User',
            title: userData.currentRole || userData.title || userData.jobTitle || 'Unknown Title',
            location: userData.location || 'Unknown Location',
            skills: userData.skills || [],
            experience: userData.experience || 0,
            motivation: motivationMap[item.motivation] || 'Moderate',
            proficiency: proficiencyMap[item.motivation] || 'Advanced', // Using motivation as proficiency for now
            skillName: item.name,
            skillDescription: item.description,
            similarity: parseFloat(confidencePercentage),
            similarityPercentage: `${confidencePercentage}%`,
            reason: item.reason || 'No reason provided',
            photo: userData.photo_url || userData.photoURL || userData.photo || userData.profilePicture
          };
        } catch (error) {
          console.error('Error processing user data:', error);
          return null;
        }
      })
    );
    
    // Filter out null results and sort by confidence (highest to lowest)
    const validEmployees = processedEmployees.filter(emp => emp !== null);
    const sortedEmployees = validEmployees.sort((a, b) => b.similarity - a.similarity);
    
    // Take top 10 employees
    const topEmployees = sortedEmployees.slice(0, 10);
    
    console.log('Processed employees for', skillData.skill, ':', topEmployees);
    return topEmployees;
  };



  // Rank employees based on skills (simulated algorithm)
  const rankEmployeesBySkills = async (skillsToRank: any[]): Promise<any[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate sample employee rankings based on skills
    const sampleEmployees = [
      { id: 'EMP-001', name: 'Sarah Johnson', title: 'Senior Developer', skills: ['JavaScript', 'React', 'Node.js'], experience: 5, location: 'San Francisco, CA' },
      { id: 'EMP-002', name: 'Michael Chen', title: 'Full Stack Engineer', skills: ['Python', 'Django', 'React'], experience: 4, location: 'New York, NY' },
      { id: 'EMP-003', name: 'Emily Rodriguez', title: 'UX Designer', skills: ['UI/UX Design', 'Figma', 'Prototyping'], experience: 3, location: 'Austin, TX' },
      { id: 'EMP-004', name: 'David Kim', title: 'Data Scientist', skills: ['Python', 'Machine Learning', 'Data Analysis'], experience: 6, location: 'Seattle, WA' },
      { id: 'EMP-005', name: 'Lisa Wang', title: 'Product Manager', skills: ['Product Management', 'Agile', 'User Research'], experience: 4, location: 'Boston, MA' },
      { id: 'EMP-006', name: 'James Wilson', title: 'DevOps Engineer', skills: ['Docker', 'Kubernetes', 'AWS'], experience: 5, location: 'Denver, CO' },
      { id: 'EMP-007', name: 'Alex Thompson', title: 'Frontend Developer', skills: ['React', 'TypeScript', 'CSS'], experience: 2, location: 'Portland, OR' },
      { id: 'EMP-008', name: 'Maria Garcia', title: 'Backend Developer', skills: ['Java', 'Spring Boot', 'PostgreSQL'], experience: 4, location: 'Miami, FL' },
      { id: 'EMP-009', name: 'Ryan Lee', title: 'Mobile Developer', skills: ['React Native', 'iOS', 'Android'], experience: 3, location: 'Chicago, IL' },
      { id: 'EMP-010', name: 'Jennifer Brown', title: 'QA Engineer', skills: ['Testing', 'Automation', 'Selenium'], experience: 3, location: 'Phoenix, AZ' }
    ];

    // Calculate rankings based on skill requirements
    const rankedEmployees = sampleEmployees.map(employee => {
      let totalScore = 0;
      let skillMatches = 0;
      
      skillsToRank.forEach(requiredSkill => {
        const hasSkill = employee.skills.some(skill => 
          skill.toLowerCase().includes(requiredSkill.skill.toLowerCase()) ||
          requiredSkill.skill.toLowerCase().includes(skill.toLowerCase())
        );
        
        if (hasSkill) {
          skillMatches++;
          // Base score for having the skill
          totalScore += 50;
          
          // Bonus for experience level
          totalScore += Math.min(employee.experience * 5, 25);
          
          // Bonus for skill proficiency match
          const proficiencyBonus = getProficiencyBonus(requiredSkill.proficiency);
          totalScore += proficiencyBonus;
          
          // Bonus for motivation level
          const motivationBonus = getMotivationBonus(requiredSkill.motivation);
          totalScore += motivationBonus;
        }
      });
      
      // Calculate match percentage
      const matchPercentage = (skillMatches / skillsToRank.length) * 100;
      
      // Final score with match percentage weight
      const finalScore = (totalScore * matchPercentage) / 100;
      
      return {
        ...employee,
        skillMatches,
        matchPercentage: Math.round(matchPercentage * 10) / 10,
        totalScore: Math.round(finalScore * 10) / 10,
        ranking: 0 // Will be set after sorting
      };
    });

    // Sort by score and assign rankings
    rankedEmployees.sort((a, b) => b.totalScore - a.totalScore);
    rankedEmployees.forEach((employee, index) => {
      employee.ranking = index + 1;
    });

    return rankedEmployees;
  };

  // Helper functions for scoring
  const getProficiencyBonus = (proficiency: string): number => {
    switch (proficiency) {
      case 'Beginner': return 10;
      case 'Intermediate': return 20;
      case 'Advanced': return 30;
      case 'Expert': return 40;
      case 'Master': return 50;
      default: return 10;
    }
  };

  const getMotivationBonus = (motivation: string): number => {
    switch (motivation) {
      case 'Very Low': return 5;
      case 'Low': return 10;
      case 'Moderate': return 15;
      case 'High': return 20;
      case 'Very High': return 25;
      default: return 10;
    }
  };

  // Handle remove confirmation
  const handleRemoveConfirmation = () => {
    setRequiredSkills(requiredSkills.filter(skill => !skillsToRemove.includes(skill)));
    setSelectedSkillsForAction([]);
    setPendingChanges({});
    setShowRemoveConfirmation(false);
    setSkillsToRemove([]);
  };

  // Apply pending changes to table rows in real-time
  const applyPendingChanges = (skill: string, field: 'proficiency' | 'motivation', value: string) => {
    if (selectedSkillsForAction.includes(skill)) {
      setPendingChanges(prev => ({
        ...prev,
        [skill]: {
          ...prev[skill],
          [field]: value
        }
      }));
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowProficiencyDropdown(false);
        setShowMotivationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle single skill ranking from child components
  useEffect(() => {
    const handleSingleSkillRank = (event: CustomEvent) => {
      const { skillToRank } = event.detail;
      
      console.log('🔍 Debug: handleSingleSkillRank received event:', event);
      console.log('🔍 Debug: event.detail:', event.detail);
      console.log('🔍 Debug: skillToRank:', skillToRank);
      console.log('🔍 Debug: skillToRank type:', typeof skillToRank);
      console.log('🔍 Debug: skillToRank length:', skillToRank?.length);
      
      // Start the ranking process for this single skill immediately
      startEmployeeRanking(skillToRank);
    };

    window.addEventListener('rankSingleSkill', handleSingleSkillRank as EventListener);
    
    return () => {
      window.removeEventListener('rankSingleSkill', handleSingleSkillRank as EventListener);
    };
  }, []);

  // Fetch team profile data from connectedCompanies collection (EFFICIENT - using Firestore queries)
  const fetchTeamProfile = async () => {
    if (!user?.uid) return;
    
    setIsLoadingProfile(true);
    try {
      console.log('🔍 Starting fetchTeamProfile for user:', user.uid);
      
      // ✅ EFFICIENT: Query with filters to get only the user's active and verified company connection
      const userConnectionsQuery = query(
        collection(db, 'connectedCompanies'),
        where('userRef', '==', doc(db, 'users', user.uid)),
        where('active', '==', true),
        where('verified', '==', true)
      );
      
      console.log('📁 Querying with filters: userRef, active=true, verified=true');
      const userConnectionsSnapshot = await getDocs(userConnectionsQuery);
      console.log('📊 User connections snapshot size:', userConnectionsSnapshot.size);
      
      if (!userConnectionsSnapshot.empty) {
        console.log('✅ Found active and verified company connection for user');
        
        // Get the first (and should be only) connection
        const userConnection = userConnectionsSnapshot.docs[0];
        const companyData = userConnection.data();
        
        console.log('🔗 Company Connection Data:');
        console.log('  📄 Document ID:', userConnection.id);
        console.log('  🔍 Key Fields:');
        console.log('    - active:', companyData.active);
        console.log('    - verified:', companyData.verified);
        console.log('    - companyReference:', companyData.companyReference);
        console.log('    - userRef:', companyData.userRef);
        console.log('    - isAdmin:', companyData.isAdmin || false);
        console.log('    - role:', companyData.role || 'Employee');
        
        const activeCompanyConnection = { id: userConnection.id, ...(companyData as object) };
        console.log('🎯 Active company connection found:', JSON.stringify(activeCompanyConnection, null, 2));
        
        if (activeCompanyConnection && (activeCompanyConnection as any).companyReference) {
          console.log('\n🏢 Company reference found, fetching company details...');
          console.log('🔗 Company reference:', (activeCompanyConnection as any).companyReference);
          
          // Fetch the actual company details from the companies collection
          try {
            // Handle both string IDs and Firestore document references
            let companyDocRef: any;
            if (typeof (activeCompanyConnection as any).companyReference === 'string') {
              // If it's a string ID
              companyDocRef = doc(db, 'companies', (activeCompanyConnection as any).companyReference);
              console.log('📁 Using string ID, created doc ref:', `companies/${(activeCompanyConnection as any).companyReference}`);
            } else if ((activeCompanyConnection as any).companyReference && typeof (activeCompanyConnection as any).companyReference === 'object' && 'path' in (activeCompanyConnection as any).companyReference) {
              // If it's a Firestore document reference, use it directly
              companyDocRef = (activeCompanyConnection as any).companyReference;
              console.log('📁 Using Firestore doc reference, path:', (activeCompanyConnection as any).companyReference.path);
            } else {
              console.log('❌ Invalid companyReference format:', (activeCompanyConnection as any).companyReference);
              console.log('🔧 Falling back to connection data only');
              setTeamProfile(activeCompanyConnection);
              setHasTeam(true);
              return;
            }
            
            console.log('📖 Fetching company document...');
            const companyDoc = await getDoc(companyDocRef);
            
            if (companyDoc.exists()) {
              const companyDetails = companyDoc.data();
              console.log('✅ Company document found!');
              console.log('📋 Company details:', JSON.stringify(companyDetails, null, 2));
              
              // Combine connection data with company details
              const fullCompanyProfile = {
                ...activeCompanyConnection,
                ...(companyDetails || {})
              };
              console.log('🔗 Combined full company profile:', JSON.stringify(fullCompanyProfile, null, 2));
              
              setTeamProfile(fullCompanyProfile);
              setHasTeam(true);
              console.log('✅ Team profile and hasTeam state updated successfully');
            } else {
              console.log('❌ Company document not found for reference:', (activeCompanyConnection as any).companyReference);
              console.log('🔧 Falling back to connection data only');
              setTeamProfile(activeCompanyConnection);
              setHasTeam(true);
            }
          } catch (companyError) {
            console.error('❌ Error fetching company details:', companyError);
            console.log('🔧 Falling back to connection data only');
            setTeamProfile(activeCompanyConnection);
            setHasTeam(true);
          }
        } else {
          console.log('\n❌ No active and verified company connections found, or missing companyReference');
          console.log('🔍 activeCompanyConnection:', activeCompanyConnection);
          if (activeCompanyConnection) {
            console.log('🔍 companyReference type:', typeof (activeCompanyConnection as any).companyReference);
            console.log('🔍 companyReference value:', (activeCompanyConnection as any).companyReference);
          }
          setHasTeam(false);
          setTeamProfile(null);
        }
      } else {
        console.log('❌ No connected companies found for user');
        setHasTeam(false);
        setTeamProfile(null);
      }
    } catch (error) {
      console.error('❌ Error fetching connected companies:', error);
      setHasTeam(false);
      setTeamProfile(null);
    } finally {
      setIsLoadingProfile(false);
      console.log('🏁 fetchTeamProfile completed');
    }
  };

  // Fetch admin members from connectedCompanies collection (same query as Employees but with isAdmin = true)
  const fetchAdminMembers = async () => {
    if (!user?.uid) return;
    
    setIsLoadingAdminMembers(true);
    try {
      console.log('Fetching admin members...');
      
      // Query the top-level connectedCompanies collection to find the current user's company
      const userConnectionsQuery = query(
        collection(db, 'connectedCompanies'),
        where('userRef', '==', doc(db, 'users', user.uid)),
        where('active', '==', true)
      );
      
      const userConnectionsSnapshot = await getDocs(userConnectionsQuery);
      console.log(`Found ${userConnectionsSnapshot.docs.length} active connections for current user`);
      
      if (userConnectionsSnapshot.docs.length === 0) {
        console.log('Current user is not connected to any active company');
        setAdminMembers([]);
        return;
      }
      
      // Get the company reference from the user's connection
      const userConnection = userConnectionsSnapshot.docs[0];
      const companyRef = userConnection.data().companyReference;
      
      if (!companyRef) {
        console.log('User connection missing companyReference');
        setAdminMembers([]);
        return;
      }
      
      // Now query all active admin connections for this company - using proper Firestore filters
      const adminConnectionsQuery = query(
        collection(db, 'connectedCompanies'),
        where('companyReference', '==', companyRef),
        where('active', '==', true),
        where('isAdmin', '==', true)
      );
      
      const adminConnectionsSnapshot = await getDocs(adminConnectionsQuery);
      console.log(`Found ${adminConnectionsSnapshot.docs.length} admin connections for company`);
      
      const adminMembersList: any[] = [];
      
      // Fetch user data for each admin connection
      for (const connection of adminConnectionsSnapshot.docs) {
        try {
          const connectionData = connection.data();
          const userRef = connectionData.userRef;
          
          if (!userRef) {
            console.log('Admin connection missing userRef:', connection.id);
            continue;
          }
          
          // Get user data using the userRef
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as any;
            const userId = userDoc.id;
            
            // Create admin member object
            const adminMember = {
              id: userId,
              name: userData.display_name || userData.displayName || userData.name || 'Unknown User',
              role: connectionData.role || 'Admin',
              photo: userData.photo_url || userData.photoURL || userData.photo || userData.profilePicture,
              isAdmin: true
            };
            
            adminMembersList.push(adminMember);
            console.log(`Added admin member: ${adminMember.name}`);
          } else {
            console.log(`User document not found for userRef:`, userRef);
          }
        } catch (error) {
          console.error(`Error loading admin member:`, error);
        }
      }
      
      setAdminMembers(adminMembersList);
      console.log('Admin members loaded:', adminMembersList);
      
    } catch (error) {
      console.error('Error fetching admin members:', error);
      setAdminMembers([]);
    } finally {
      setIsLoadingAdminMembers(false);
    }
  };

  // Fetch team members data from Firebase
  const fetchTeamMembers = async () => {
    if (!hasTeam || !teamProfile?.companyReference) return;
    
    setIsLoadingMembers(true);
    try {
      console.log('Fetching admin users for company reference:', teamProfile.companyReference);
      
      // Get the company reference to match against
      let companyRefToMatch: any;
      if (typeof teamProfile.companyReference === 'string') {
        companyRefToMatch = teamProfile.companyReference;
      } else if (teamProfile.companyReference && typeof teamProfile.companyReference === 'object' && 'path' in teamProfile.companyReference) {
        companyRefToMatch = teamProfile.companyReference;
      } else {
        console.log('Invalid companyReference format for admin lookup:', teamProfile.companyReference);
        setTeamMembers([]);
        return;
      }
      
      console.log('Company reference to match:', companyRefToMatch);
      
      // ✅ EFFICIENT: Query connectedCompanies directly with filters
      let companyRefQuery: any;
      if (typeof companyRefToMatch === 'string') {
        // If it's a string ID, create a document reference
        companyRefQuery = doc(db, 'companies', companyRefToMatch);
      } else if (companyRefToMatch && typeof companyRefToMatch === 'object' && 'path' in companyRefToMatch) {
        // If it's already a Firestore document reference, use it directly
        companyRefQuery = companyRefToMatch;
      } else {
        console.log('Invalid company reference format:', companyRefToMatch);
        setTeamMembers([]);
        return;
      }
      
      // Query for all active admin connections for this company
      const adminConnectionsQuery = query(
        collection(db, 'connectedCompanies'),
        where('companyReference', '==', companyRefQuery),
        where('active', '==', true),
        where('isAdmin', '==', true)
      );
      
      console.log('Querying for admin connections with filters');
      const adminConnectionsSnapshot = await getDocs(adminConnectionsQuery);
      console.log('Admin connections found:', adminConnectionsSnapshot.size);
      
      const membersData = [];
      
      // Process each admin connection
      for (const connectionDoc of adminConnectionsSnapshot.docs) {
        try {
          const connectionData = connectionDoc.data();
          console.log('Admin connection data:', connectionData);
          
          // Get the user data for this connection
          const userRef = connectionData.userRef;
          if (userRef) {
            let userDocRef: any;
            if (typeof userRef === 'string') {
              userDocRef = doc(db, 'users', userRef);
            } else if (userRef && typeof userRef === 'object' && 'path' in userRef) {
              userDocRef = userRef;
            } else {
              console.log('Invalid userRef format:', userRef);
              continue;
            }
            
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data() as any;
              membersData.push({
                id: userDoc.id,
                name: userData.display_name || userData.displayName || userData.name || 'Unknown User',
                photo: userData.photo_url || userData.photoURL || userData.photo || userData.profilePicture,
                role: 'Admin',
                connectionData: connectionData
              });
              console.log(`Added admin user: ${userData.display_name || userData.displayName || userData.name || 'Unknown User'}`);
            }
          }
        } catch (error) {
          console.error(`Error processing admin connection ${connectionDoc.id}:`, error);
        }
      }
      
      setTeamMembers(membersData);
      console.log('Admin team members loaded:', membersData);
    } catch (error) {
      console.error('Error fetching admin team members:', error);
      setTeamMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Set current view when component mounts
  useEffect(() => {
    setCurrentView('team');
  }, []);

  // File upload handlers
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackgroundFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const removeBackground = () => {
    setBackgroundFile(null);
    setBackgroundPreview(null);
  };

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchTeamProfile();
    }
  }, [user]);

  // Fetch team members when team profile is loaded
  useEffect(() => {
    if (hasTeam) {
      fetchTeamMembers();
    }
  }, [hasTeam]);

  // Fetch admin members when team profile is loaded
  useEffect(() => {
    if (hasTeam) {
      fetchAdminMembers();
    }
  }, [hasTeam]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#1A1D21'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00DF71] mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle navigation when user is not authenticated
  useEffect(() => {
    if (!user && !loading) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  if (!user) {
    return null;
  }

  // Render Create Team view for new users
  if (!hasTeam && !isLoadingProfile) {
    return (
      <div className="min-h-screen" style={{backgroundColor: '#1A1D21'}}>
        <SideNavigation />
        
        <div className="md:ml-60 ml-0 md:ml-[66px] h-full flex flex-col">
          {/* Fixed Header Container */}
          <div className="flex-shrink-0 z-20">
            {/* ViewTitle Container */}
            <div className="w-full bg-[#1e2327] flex items-center border-b border-[#454446] h-16" style={{ height: "64px !important", minHeight: "64px", maxHeight: "64px", paddingLeft: "32px" }}>
              {/* Title text */}
              <div className="font-semibold text-[#ffffff] text-[18px] whitespace-nowrap md:ml-0 ml-9 flex items-center">
                Team
              </div>
            </div>
          </div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
            <div className="w-full max-w-md text-center">
              {/* Create Team Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-4">Create Your Team</h1>
                <p className="text-gray-400 text-lg">Get started by setting up your team profile</p>
              </div>

              {/* Create Team Button */}
              <button 
                onClick={() => router.push('/teamEdit')}
                className="w-full bg-[#00DF71] text-[#212327] font-medium py-4 px-6 rounded-lg hover:bg-[#0AFB84] transition-colors text-lg"
              >
                Create Team
              </button>

              {/* Additional Info */}
              <div className="mt-8 text-gray-400">
                <p className="text-sm">You'll be able to:</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Set your team name and branding</li>
                  <li>• Upload team logo and background</li>
                  <li>• Manage team members</li>
                  <li>• Customize your team profile</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is admin - if not, show limited view
  if (hasTeam && teamProfile && !(teamProfile as any).isAdmin && !isLoadingProfile) {
    return (
      <div className="min-h-screen" style={{backgroundColor: '#1A1D21'}}>
        <SideNavigation />
        
        <div className={`${sideNavMargin} h-full flex flex-col`}>
          {/* Fixed Header Container */}
          <div className="flex-shrink-0 z-20">
            {/* ViewTitle Container */}
            <div className="w-full bg-[#1e2327] flex items-center border-b border-[#454446] h-16" style={{ height: "64px !important", minHeight: "64px", maxHeight: "64px", paddingLeft: "32px" }}>
              {/* Title text */}
              <div className="font-semibold text-[#ffffff] text-[18px] whitespace-nowrap md:ml-0 ml-9 flex items-center">
                Team
              </div>
            </div>
          </div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Join Company Team</h2>
              <p className="text-gray-400 mb-6">You are connected to {teamProfile.companyName || 'a company'} but don't have admin access</p>
              <p className="text-gray-500 text-sm mb-6">Contact your team admin to request additional permissions</p>
              <div className="bg-[#212327] rounded-lg p-6 border border-[#454446] max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-white mb-3">Your Company Info</h3>
                <p className="text-gray-300 text-sm mb-2">
                  <span className="text-gray-400">Company:</span> {teamProfile.companyName || 'N/A'}
                </p>
                <p className="text-gray-300 text-sm mb-2">
                  <span className="text-gray-400">Role:</span> {teamProfile.role || 'Employee'}
                </p>
                <p className="text-gray-300 text-sm mb-2">
                  <span className="text-gray-400">Status:</span> 
                  <span className={teamProfile.active ? "text-[#00DF71] ml-2" : "text-red-400 ml-2"}>
                    {teamProfile.active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Team view for existing teams (only for admin users)
  return (
    <div className="min-h-screen" style={{backgroundColor: '#1A1D21'}}>
      <SideNavigation />
      
              <div className="md:ml-60 ml-0 md:ml-[66px] h-full flex flex-col">
          {/* Fixed Header Container */}
          <div className="flex-shrink-0 z-20">
            {/* ViewTitle Container */}
            <div className="w-full bg-[#1e2327] flex items-center border-b border-[#454446] h-16" style={{ height: "64px !important", minHeight: "64px", maxHeight: "64px", paddingLeft: "32px" }}>
              {/* Title text */}
              <div className="font-semibold text-[#ffffff] text-[18px] whitespace-nowrap md:ml-0 ml-9 flex items-center">
                Team
              </div>
            </div>
          
          {/* ViewTitleTab Component */}
          <ViewTitleTab activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8" style={{ height: 'calc(100vh - 64px - 48px - 48px)' }}>
          {/* Notification */}
          {notification && (
            <div 
              className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 text-white px-4 py-2 rounded-b-lg shadow-lg text-center"
              style={{
                backgroundColor: '#EB7686',
                animation: 'slideDown 1s ease-in-out'
              }}
            >
              {notification}
            </div>
          )}

          {/* Remove Confirmation Dialog */}
          {showRemoveConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#212327] border border-[#454446] rounded-lg p-6 max-w-md mx-4">
                <h3 className="text-lg font-semibold text-white mb-4">Confirm Removal</h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to remove {skillsToRemove.length} skill{skillsToRemove.length !== 1 ? 's' : ''}? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowRemoveConfirmation(false)}
                    className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemoveConfirmation}
                    className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'skill-search' ? (
            // Skill Search tab content
            <div className="w-full h-full">
              <div className="w-full flex flex-col lg:flex-row gap-8 px-8">
                {/* Left Column - 4/12 ratio */}
                <div className="lg:w-4/12 flex-shrink-0 space-y-6">
                  {/* Add tasks & skills Section */}
                  <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6">
                    <h3 className="text-lg font-bold text-white mb-2">Add tasks & skills</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Upload project tasks / requirements to build a skill rank employees
                    </p>
                    <div className="flex gap-3">
                      <div className="flex-1">
                      <input
                          type="file"
                          accept=".csv,.docx,.xlsx,.xls"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setCsvFile(file);
                              setCsvFileName(file.name);
                            }
                          }}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex items-center justify-center w-full bg-[#1e2327] border-2 border-dashed border-[#454446] rounded-lg px-4 py-3 text-white hover:border-[#00DF71] transition-colors cursor-pointer"
                        >
                          {csvFileName ? (
                            <span className="text-gray-300">{csvFileName}</span>
                          ) : (
                            <span className="text-gray-400">Click to upload CSV, DOCX, or XLSX file</span>
                          )}
                        </label>
                      </div>
                      <button 
                        onClick={handleBuildSkills}
                        disabled={!csvFile || isProcessingFile}
                        className="px-6 py-3 bg-[#00DF71] text-[#212327] font-medium rounded-lg hover:bg-[#0AFB84] transition-colors whitespace-nowrap disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
                      >
                        {isProcessingFile ? 'Processing...' : 'Build Skills'}
                      </button>
                    </div>
                    {csvFile && (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setCsvFile(null);
                            setCsvFileName('');
                          }}
                          className="text-red-400 text-xs hover:text-red-300 transition-colors"
                        >
                          Remove file
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Separator */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#454446]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-[#1A1D21] text-gray-400">or</span>
                    </div>
                  </div>

                  {/* Search Skills Section */}
                  <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Search Skills</h3>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search for skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && searchQuery.trim()) {
                            const trimmedSkill = searchQuery.trim();
                            if (!requiredSkills.includes(trimmedSkill)) {
                              handleAddSkill(trimmedSkill);
                              setSearchQuery('');
                              setShowSearchDropdown(false);
                            }
                          }
                        }}
                        className="w-full bg-[#1e2327] border border-[#454446] rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors"
                        onFocus={() => setShowSearchDropdown(true)}
                        onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      
                      {/* Search Dropdown */}
                      {showSearchDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#212327] border border-[#454446] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                          <div className="p-2">
                            <div className="text-xs text-gray-400 font-medium mb-2 px-2">
                              {searchQuery ? 'Search Results' : 'Popular Skills'}
                            </div>
                            {[
                              'JavaScript', 'React', 'Python', 'Data Analysis', 'Project Management', 
                              'Leadership', 'Communication', 'UI/UX Design', 'Product Management', 
                              'Machine Learning', 'Customer Success', 'Sales', 'Marketing', 
                              'Design Thinking', 'Agile', 'Scrum', 'Data Science', 'Cloud Computing', 
                              'DevOps', 'Cybersecurity'
                            ]
                              .filter(skill => 
                                skill.toLowerCase().includes(searchQuery.toLowerCase())
                              )
                              .map((skill, index) => (
                                <button
                                  key={index}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#2a2e32] rounded-md transition-colors"
                                  onClick={() => {
                                    handleAddSkill(skill);
                                    setSearchQuery(skill);
                                    setShowSearchDropdown(false);
                                  }}
                                >
                                  {skill}
                                </button>
                              ))}
                            {searchQuery && [
                              'JavaScript', 'React', 'Python', 'Data Analysis', 'Project Management', 
                              'Leadership', 'Communication', 'UI/UX Design', 'Product Management', 
                              'Machine Learning', 'Customer Success', 'Sales', 'Marketing', 
                              'Design Thinking', 'Agile', 'Scrum', 'Data Science', 'Cloud Computing', 
                              'DevOps', 'Cybersecurity'
                            ]
                              .filter(skill => 
                                skill.toLowerCase().includes(searchQuery.toLowerCase())
                              ).length === 0 && (
                                <div className="px-3 py-2 text-sm text-gray-400">
                                  No skills found matching "{searchQuery}"
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Popular Skills Section */}
                  <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Popular Skills</h3>
                    <div className="flex flex-wrap gap-3">
                      {[
                        'JavaScript', 'React', 'Python', 'Data Analysis', 'Project Management', 
                        'Leadership', 'Communication', 'UI/UX Design', 'Product Management', 
                        'Machine Learning', 'Customer Success', 'Sales', 'Marketing', 
                        'Design Thinking', 'Agile', 'Scrum', 'Data Science', 'Cloud Computing', 
                        'DevOps', 'Cybersecurity'
                      ].map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-[#2a2e32] hover:bg-[#3a3e42] border border-[#454446] rounded-full px-3 py-2 transition-colors group cursor-pointer"
                          onClick={() => handleAddSkill(skill)}
                        >
                          <span className="text-sm text-gray-300 group-hover:text-white whitespace-nowrap">
                            {skill}
                          </span>
                          <button
                            className="flex items-center justify-center w-5 h-5 bg-[#00DF71] hover:bg-[#0AFB84] text-[#212327] rounded-full transition-colors text-xs font-bold"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddSkill(skill);
                            }}
                          >
                            +
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - 8/12 ratio */}
                <div className="lg:w-8/12 flex-shrink-0">
                  <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 h-full w-full">
                    {/* Tabs */}
                    <div className="flex border-b border-[#454446] mb-6">
                      <button
                        onClick={() => setRightContainerTab('required-skills')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          rightContainerTab === 'required-skills'
                            ? 'text-[#00DF71] border-b-2 border-[#00DF71]'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Required Skills
                      </button>
                      <button
                        disabled={true}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          rightContainerTab === 'rank-employees'
                            ? 'text-[#00DF71] border-b-2 border-[#00DF71]'
                            : 'text-gray-500 cursor-not-allowed'
                        }`}
                        title="Click 'Rank Employees' button below to activate this tab"
                      >
                        Rank Employees
                      </button>
                    </div>

                    {/* Tab Content */}
                    {rightContainerTab === 'required-skills' ? (
                      <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Required Skills</h3>
                    </div>
                    
                    {requiredSkills.length > 0 ? (
                      <div className="bg-[#1e2327] rounded-lg border border-[#454446] overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 p-4 bg-[#2a2e32] border-b border-[#454446]">
                          <div className="col-span-1">
                            <input
                              type="checkbox"
                              checked={requiredSkills.length > 0 && requiredSkills.every(skill => selectedSkillsForAction.includes(skill))}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSkillsForAction([...requiredSkills]);
                                } else {
                                  setSelectedSkillsForAction([]);
                                  // Clear all pending changes when deselecting all skills
                                  setPendingChanges({});
                                }
                              }}
                              className="w-4 h-4 text-[#00DF71] bg-[#1e2327] border-[#454446] rounded focus:ring-[#00DF71] focus:ring-2"
                            />
                          </div>
                          <div className="col-span-5 text-sm font-medium text-gray-300">Skill Name</div>
                          <div className="col-span-3 text-sm font-medium text-gray-300 flex items-center gap-2">
                            Proficiency
                            <div className="relative dropdown-container">
                              <button
                                onClick={() => setShowProficiencyDropdown(!showProficiencyDropdown)}
                                className="ml-2 p-1 hover:bg-[#1e2327] rounded transition-colors"
                              >
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {showProficiencyDropdown && (
                                <div className="absolute top-full left-0 mt-1 bg-[#1e2327] border border-[#454446] rounded-lg shadow-lg z-10 min-w-[120px]">
                                  <div className="py-1">
                                        {['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'].map((level) => (
                                      <button
                                        key={level}
                                        onClick={() => {
                                          setBulkProficiency(level);
                                          setShowProficiencyDropdown(false);
                                          // Apply changes to all selected skills in real-time
                                          selectedSkillsForAction.forEach(skill => {
                                            applyPendingChanges(skill, 'proficiency', level);
                                          });
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-[#2a2e32] transition-colors ${
                                          bulkProficiency === level ? 'text-[#00DF71] bg-[#2a2e32]' : 'text-white'
                                        }`}
                                      >
                                        {level}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-span-3 text-sm font-medium text-gray-300 flex items-center gap-2">
                            Motivation
                            <div className="relative dropdown-container">
                              <button
                                onClick={() => setShowMotivationDropdown(!showMotivationDropdown)}
                                className="ml-2 p-1 hover:bg-[#1e2327] rounded transition-colors"
                              >
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {showMotivationDropdown && (
                                <div className="absolute top-full left-0 mt-1 bg-[#1e2327] border border-[#454446] rounded-lg shadow-lg z-10 min-w-[120px]">
                                  <div className="py-1">
                                        {['Very Low', 'Low', 'Moderate', 'High', 'Very High'].map((level) => (
                                      <button
                                        key={level}
                                        onClick={() => {
                                          setBulkMotivation(level);
                                          setShowMotivationDropdown(false);
                                          // Apply changes to all selected skills in real-time
                                          selectedSkillsForAction.forEach(skill => {
                                            applyPendingChanges(skill, 'motivation', level);
                                          });
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-[#2a2e32] transition-colors ${
                                          bulkMotivation === level ? 'text-[#00DF71] bg-[#2a2e32]' : 'text-white'
                                        }`}
                                      >
                                        {level}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                        
                        {/* Table Body */}
                        <div className="divide-y divide-[#454446]">
                          {requiredSkills.map((skill, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 p-4 hover:bg-[#2a2e32] transition-colors">
                              <div className="col-span-1 flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedSkillsForAction.includes(skill)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedSkillsForAction([...selectedSkillsForAction, skill]);
                                    } else {
                                      setSelectedSkillsForAction(selectedSkillsForAction.filter(s => s !== skill));
                                      // Clear pending changes for deselected skill
                                      setPendingChanges(prev => {
                                        const newChanges = { ...prev };
                                        delete newChanges[skill];
                                        return newChanges;
                                      });
                                    }
                                  }}
                                  className="w-4 h-4 text-[#00DF71] bg-[#1e2327] border-[#454446] rounded focus:ring-[#00DF71] focus:ring-2"
                                />
                              </div>
                              <div className="col-span-5 text-white font-medium">
                                {editingSkill === skill ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={editingSkillValue}
                                      onChange={(e) => setEditingSkillValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleSkillNameSave();
                                        } else if (e.key === 'Escape') {
                                          handleSkillNameCancel();
                                        }
                                      }}
                                      className="flex-1 bg-[#1e2327] border border-[#00DF71] rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-[#00DF71] focus:ring-1 focus:ring-[#00DF71]"
                                      autoFocus
                                    />
                                    <button
                                      onClick={handleSkillNameSave}
                                      className="px-2 py-1 bg-[#00DF71] text-[#212327] text-xs rounded hover:bg-[#0AFB84] transition-colors"
                                      title="Save"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={handleSkillNameCancel}
                                      className="px-2 py-1 bg-[#454446] text-white text-xs rounded hover:bg-[#5a5c5e] transition-colors"
                                      title="Cancel"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <div 
                                    className="cursor-pointer hover:text-[#00DF71] transition-colors group flex items-center gap-2"
                                    onClick={() => handleSkillNameEdit(skill)}
                                    title="Click to edit skill name"
                                  >
                                    <span>{skill}</span>
                                    <svg 
                                      className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="col-span-3">
                                <select 
                                  value={pendingChanges[skill]?.proficiency || skillProficiencies[skill] || 'Advanced'}
                                  onChange={(e) => handleProficiencyChange(skill, e.target.value)}
                                  className="w-full bg-[#1e2327] border border-[#454446] rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-[#00DF71]"
                                >
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Advanced">Advanced</option>
                                  <option value="Expert">Expert</option>
                                      <option value="Master">Master</option>
                                </select>
                              </div>
                              <div className="col-span-3">
                                <select 
                                  value={pendingChanges[skill]?.motivation || skillMotivations[skill] || 'Moderate'}
                                  onChange={(e) => handleMotivationChange(skill, e.target.value)}
                                  className="w-full bg-[#1e2327] border border-[#454446] rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-[#00DF71]"
                                >
                                      <option value="Very Low">Very Low</option>
                                  <option value="Low">Low</option>
                                      <option value="Moderate">Moderate</option>
                                      <option value="High">High</option>
                                      <option value="Very High">Very High</option>
                                    </select>
                                  </div>

                                </div>
                              ))}
                            </div>
                            
                            {/* Bulk Actions */}
                            <div className="p-4 bg-[#2a2e32] border-t border-[#454446]">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-300">
                                  {selectedSkillsForAction.length > 0 
                                    ? `${selectedSkillsForAction.length} skill${selectedSkillsForAction.length !== 1 ? 's' : ''} selected`
                                    : 'No skills selected'
                                  }
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      if (selectedSkillsForAction.length > 0) {
                                        setSkillsToRemove([...selectedSkillsForAction]);
                                        setShowRemoveConfirmation(true);
                                      }
                                    }}
                                    disabled={selectedSkillsForAction.length === 0}
                                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                      selectedSkillsForAction.length > 0
                                        ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                    }`}
                                  >
                                    Remove
                                  </button>
                                                                      <button
                                      onClick={handleBulkUpdate}
                                      disabled={Object.keys(pendingChanges).length === 0}
                                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                        Object.keys(pendingChanges).length > 0
                                          ? 'bg-[#00DF71] hover:bg-[#0AFB84] text-[#212327] font-medium cursor-pointer'
                                          : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                      }`}
                                    >
                                      Update
                                    </button>
                                    <button
                        onClick={() => {
                          // Use the same logic as handleRankEmployees function
                          const skillsToRank = selectedSkillsForAction.map(skill => {
                            // Get the most current value: pending changes first, then saved values, then defaults
                            const currentProficiency = pendingChanges[skill]?.proficiency || skillProficiencies[skill] || 'Advanced';
                            const currentMotivation = pendingChanges[skill]?.motivation || skillMotivations[skill] || 'Moderate';
                            
                            return {
                              skill,
                              proficiency: currentProficiency,
                              motivation: currentMotivation
                            };
                          });
                          
                          setRankEmployeesSkills(skillsToRank);
                          setRightContainerTab('rank-employees');
                          setSelectedSkillsForAction([]);
                          setPendingChanges({});
                          
                          // Don't start the ranking process automatically - let user click individual skill buttons
                        }}
                                      disabled={selectedSkillsForAction.length === 0 || Object.keys(pendingChanges).length > 0}
                                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                        employeesRanked
                                          ? 'border border-[#00DF71] bg-transparent text-[#00DF71] font-medium cursor-pointer hover:bg-[#00DF71] hover:text-[#212327]'
                                          : selectedSkillsForAction.length > 0 && Object.keys(pendingChanges).length === 0
                                            ? 'bg-[#00DF71] hover:bg-[#0AFB84] text-[#212327] font-medium cursor-pointer'
                                            : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                      }`}
                                    >
                                      {employeesRanked ? 'Ranked' : 'Next'}
                                    </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="min-h-[400px] bg-[#1e2327] rounded-lg border border-[#454446] flex items-center justify-center">
                            <div className="text-center text-gray-400">
                              <p className="text-sm">No required skills added yet</p>
                              <p className="text-xs mt-1">Add skills from the left column to get started</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Rank Employees Tab Content
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-white">Rank Employees</h3>
                        </div>
                        
                        {/* All Skills Container */}
                        <div className="bg-gray-600 rounded-lg border border-gray-400 overflow-hidden mb-4">
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <span className="text-lg font-semibold text-[#00DF71]">All Skills</span>
                                <div className="text-xs text-white">
                                  {rankEmployeesSkills.length} skill{rankEmployeesSkills.length !== 1 ? 's' : ''} selected
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                                        <button 
                          onClick={handleRankEmployees}
                          disabled={rankEmployeesSkills.length === 0 || !teamProfile?.companyReference}
                          className={`ml-5 flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                            rankEmployeesSkills.length > 0 && teamProfile?.companyReference
                              ? 'bg-[#00DF71] hover:bg-[#0AFB84] text-[#212327] font-medium cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105'
                              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                          }`}
                          title={
                            !teamProfile?.companyReference 
                              ? "Company profile not loaded yet" 
                              : rankEmployeesSkills.length > 0 
                                ? "Click to rank employees based on selected skills" 
                                : "No skills selected for ranking"
                          }
                        >
                                  <span className="text-xs whitespace-nowrap">
                                    Rank Employees
                                  </span>
                                  <svg 
                                    className="w-5 h-5" 
                                    viewBox="0 0 20 20" 
                                    fill="none" 
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M6.16667 16.3333H2V8.08333C2 7.97283 2.0439 7.86685 2.12204 7.78871C2.20018 7.71057 2.30616 7.66667 2.41667 7.66667H5.75C5.86051 7.66667 5.96649 7.71057 6.04463 7.78871C6.12277 7.86685 6.16667 7.97283 6.16667 8.08333V16.3333ZM12.4167 3.41667C12.4167 3.30616 12.3728 3.20018 12.2946 3.12204C12.2165 3.0439 12.1105 3 12 3H8.66667C8.55616 3 8.45018 3.0439 8.37204 3.12204C8.2939 3.20018 8.25 3.30616 8.25 3.41667V16.3333H12.4167V3.41667ZM18.25 10.3333H14.9167C14.8062 10.3333 14.7002 10.3772 14.622 10.4554C14.5439 10.5335 14.5 10.6395 14.5 10.75V16.3333H18.6667V10.75C18.6667 10.6395 18.6228 10.5335 18.5446 10.4554C18.4665 10.3772 18.3605 10.3333 18.25 10.3333Z" fill="currentColor"/>
                                  </svg>
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (!notification) {
                                      setNotification("Click Rank Employee to see the results.");
                                      setTimeout(() => setNotification(null), 2000);
                                    }
                                  }}
                                  className="p-2 transition-colors text-gray-400 hover:text-white cursor-pointer"
                                >
                                  <svg 
                                    className={`w-5 h-5 transition-transform ${isAllSkillsExpanded ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded All Skills Content */}
                          {isAllSkillsExpanded && (
                            <div className="px-4 pb-4 border-t border-gray-500">
                              <div className="pt-4 space-y-3">
                                <div className="text-sm text-gray-300 font-medium">Skills Summary</div>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                  <div className="space-y-2">
                                    <div className="text-gray-400">Total Skills: {rankEmployeesSkills.length}</div>
                                    <div className="text-gray-400">Average Proficiency: {rankEmployeesSkills.length > 0 ? 'Calculating...' : 'N/A'}</div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="text-gray-400">Average Motivation: {rankEmployeesSkills.length > 0 ? 'Calculating...' : 'N/A'}</div>
                                    <div className="text-gray-400">Status: {employeesRanked ? 'Ranked' : 'Pending'}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Rank Employees Container */}
                        <div className="space-y-4">
                          {rankEmployeesSkills.length > 0 ? (
                            rankEmployeesSkills.map((skillData, index) => (
                              <SkillRankSection 
                                key={index} 
                                skillData={skillData}
                                employeesRanked={employeesRanked}
                                onChevronClick={() => {
                                  // Notification removed - keeping only the All Skills container notification
                                }}
                                rankedEmployees={rankedEmployeeResults}
                              />
                            ))
                          ) : (
                            <div className="text-center text-gray-400 py-8">
                              <p className="text-sm">No skills selected for ranking</p>
                              <p className="text-xs mt-1">Select skills from the Required Skills tab and click "Rank Employees" to get started</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>


              </div>
            </div>
          ) : activeTab === 'brand-assets' ? (
            // Brand Assets tab content
            <div className="w-full h-full">
              <div className="max-w-4xl space-y-6">
                {/* Logo Upload Section */}
                <DragDropUpload
                  onFileUpload={(file) => {
                    setLogoFile(file);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setLogoPreview(e.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }}
                  onFileRemove={removeLogo}
                  uploadedFile={logoFile}
                  title="Logo"
                  description="Upload your team's logo. Recommended size: 40px x 250px"
                  maxDimensions="H 40 X W 250"
                  previewWidth="w-[250px]"
                  previewHeight="h-[40px]"
                />

                {/* Background Image Upload Section */}
                <DragDropUpload
                  onFileUpload={(file) => {
                    setBackgroundFile(file);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setBackgroundPreview(e.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }}
                  onFileRemove={removeBackground}
                  uploadedFile={backgroundFile}
                  title="Background Image"
                  description="Upload a background image for your team. Recommended size: 600x400px"
                  maxDimensions="H 400 X W 600"
                  previewWidth="w-[300px]"
                  previewHeight="h-[200px]"
                />
              </div>
            </div>
          ) : activeTab === 'employees' ? (
            // Employees tab content
            <div className="w-full h-full">
              {/* Employees Header with Count Badge */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Employees</h2>
                <div className="bg-white text-[#212327] px-3 py-1 rounded-full text-sm font-medium">
                  {totalEmployeeCount}
                </div>
              </div>
              <EmployeesContent />
            </div>
          ) : activeTab === 'admin' ? (
            // Admin tab content
            <div className="max-w-4xl">
              {/* Team Card Container */}
              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 mb-6">
                {/* Company Title */}
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Company Profile</h2>
                  <button 
                    onClick={() => router.push('/teamEdit')}
                    className="ml-3 px-3 py-1 text-xs bg-[#00DF71] text-[#212327] rounded-full hover:bg-[#0AFB84] transition-colors"
                  >
                    Edit
                  </button>
                </div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    {teamProfile?.logoUrl ? (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-[#454446]">
                        <img 
                          src={teamProfile.logoUrl} 
                          alt="Company Logo"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initial if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#454446] flex items-center justify-center hidden border-2 border-[#454446]">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#1e2327] flex items-center justify-center">
                            <span className="text-white text-lg md:text-xl font-semibold">
                              {teamProfile?.companyName?.charAt(0) || teamProfile?.name?.charAt(0) || 'C'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#454446] flex items-center justify-center border-2 border-[#454446]">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#1e2327] flex items-center justify-center">
                          <span className="text-white text-lg md:text-xl font-semibold">
                            {teamProfile?.companyName?.charAt(0) || teamProfile?.name?.charAt(0) || 'C'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Company Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl md:text-2xl font-bold text-[#00DF71]">
                        {teamProfile?.companyName || teamProfile?.name || 'Company Profile'}
                      </h2>
                    </div>
                    {teamProfile?.website ? (
                      <a 
                        href={teamProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 text-sm md:text-base hover:underline"
                      >
                        {teamProfile.website}
                      </a>
                    ) : (
                      <p className="text-gray-300 text-sm md:text-base">
                        No website set
                      </p>
                    )}
                    {/* Company Status */}
                    {teamProfile && (
                      <div className="mt-2 flex items-center gap-4 text-xs">
                        <span className="text-gray-400">
                          Status: <span className={teamProfile.active ? "text-[#00DF71]" : "text-red-400"}>
                            {teamProfile.active ? "Active" : "Inactive"}
                          </span>
                        </span>
                        <span className="text-gray-400">
                          Verified: <span className={teamProfile.verified ? "text-[#00DF71]" : "text-yellow-400"}>
                            {teamProfile.verified ? "Yes" : "No"}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Team Admin Section */}
              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Team Admin</h2>
                  <button className="px-3 py-1 text-xs bg-[#00DF71] text-[#212327] rounded-full hover:bg-[#0AFB84] transition-colors">
                    Add Admin
                  </button>
                </div>
                
                <div className="space-y-4">
                  {isLoadingAdminMembers ? (
                    <div className="text-center text-gray-400 py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00DF71] mx-auto mb-2"></div>
                      <p className="text-sm">Loading admin members...</p>
                    </div>
                  ) : adminMembers.length > 0 ? (
                    adminMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-[#1e2327] rounded-lg border border-[#454446]">
                        <div className="flex items-center gap-3">
                          {member.photo ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#454446]">
                              <img 
                                src={member.photo} 
                                alt={member.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="w-10 h-10 rounded-full bg-[#454446] flex items-center justify-center hidden border-2 border-[#454446]">
                                <span className="text-white text-sm font-semibold">
                                  {member.name.split(' ').map((n: string) => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#454446] flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {member.name.split(' ').map((n: string) => n[0]).join('')}
                                </span>
                            </div>
                          )}
                          <div>
                            <h3 className="text-white font-medium">{member.name}</h3>
                            <p className="text-gray-400 text-sm">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs bg-[#00DF71] text-[#212327] rounded-full">Admin</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <p className="text-sm">No admin members found</p>
                      <p className="text-xs mt-2">Add admin members to manage the team</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Employees tab content
            <div className="w-full h-full">
              <EmployeesContent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}