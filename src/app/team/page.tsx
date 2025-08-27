'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SideNavigation, { useSideNavMargin } from '@/components/SideNavigation';
import { useNavigation } from '@/contexts/NavigationContext';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ViewTitleTab from '@/components/ViewTitleTab';
import EmployeesContent from '@/components/EmployeesContent';
import DragDropUpload from '@/components/DragDropUpload';

// SkillRankSection Component
interface SkillRankSectionProps {
  skillData: {
    skill: string;
    proficiency: string;
    motivation: string;
  };
  employeesRanked: boolean;
  onChevronClick: () => void;
}

function SkillRankSection({ skillData, employeesRanked, onChevronClick }: SkillRankSectionProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Sample employee data - replace with actual data later
  const sampleEmployees = [
    { id: 'jcTGHjDFmlX4Lnmp5KJ1IXXeW573', name: 'James', title: 'Employee', startDate: 'Unknown', birthday: 'Unknown', location: 'Unknown', status: 'Part Time' },
    { id: 'EMP-411703', name: 'Avery Martin', title: 'AI Engineer', startDate: 'January 17, 2000', birthday: '10/20', location: 'San Francisco, CA', status: 'Part Time' },
    { id: 'EMP-195807', name: 'Jamie Thomas', title: 'Copywriter', startDate: 'June 18, 1989', birthday: '05/04', location: 'Detroit, MI', status: 'Full Time' },
    { id: 'EMP-824226', name: 'Sage Jones', title: 'Graphic Designer', startDate: 'September 26, 2018', birthday: '10/29', location: 'Boston, MA', status: 'Part Time' },
    { id: 'EMP-485985', name: 'Charlie Thomas', title: 'Data Analyst', startDate: 'September 2, 1999', birthday: '03/22', location: 'Houston, TX', status: 'Full Time' },
    { id: 'EMP-123456', name: 'Sarah Johnson', title: 'Product Manager', startDate: 'March 15, 2021', birthday: '07/12', location: 'Seattle, WA', status: 'Full Time' },
    { id: 'EMP-789012', name: 'Michael Chen', title: 'Software Engineer', startDate: 'November 8, 2020', birthday: '12/03', location: 'Austin, TX', status: 'Full Time' },
    { id: 'EMP-345678', name: 'Emily Rodriguez', title: 'UX Designer', startDate: 'August 22, 2019', birthday: '04/18', location: 'Miami, FL', status: 'Part Time' },
    { id: 'EMP-901234', name: 'David Kim', title: 'Data Scientist', startDate: 'January 30, 2022', birthday: '09/25', location: 'Denver, CO', status: 'Full Time' },
    { id: 'EMP-567890', name: 'Lisa Wang', title: 'Marketing Specialist', startDate: 'May 12, 2021', birthday: '02/14', location: 'Portland, OR', status: 'Part Time' }
  ];

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

  // Cloud function trigger for vector search
  const triggerVectorSearch = async () => {
    if (!user) return;
    
    setIsSearching(true);
    try {
      // Get company document ID from user's connected company
      const userConnectionsQuery = query(
        collection(db, 'connectedCompanies'),
        where('userRef', '==', doc(db, 'users', user.uid)),
        where('active', '==', true),
        where('verified', '==', true)
      );
      
      const userConnectionsSnapshot = await getDocs(userConnectionsQuery);
      if (userConnectionsSnapshot.empty) {
        console.error('No active company connection found');
        return;
      }
      
      const userConnection = userConnectionsSnapshot.docs[0];
      const companyRef = userConnection.data().companyReference;
      
      // Extract company ID from reference
      let companyId: string;
      if (typeof companyRef === 'string') {
        companyId = companyRef;
      } else if (companyRef && typeof companyRef === 'object' && 'path' in companyRef) {
        companyId = companyRef.path.split('/').pop() || '';
      } else {
        console.error('Invalid company reference format');
        return;
      }
      
      // Prepare request body
      const requestBody = {
        query: skillData.skill,
        comp: companyId,
        mot: skillData.motivation,
        prof: skillData.proficiency
      };
      
      console.log('Triggering vector search with:', requestBody);
      
      // Make POST request to cloud function
      const response = await fetch('https://us-central1-skill-trait-rwubkx.cloudfunctions.net/vectorSearch', {
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
      console.log('Vector search result:', result);
      
      // TODO: Handle the search results (replace sample employees with actual results)
      // For now, just log the results
      
    } catch (error) {
      console.error('Error triggering vector search:', error);
    } finally {
      setIsSearching(false);
    }
  };

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
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 whitespace-nowrap">Motivation</span>
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
                        <div className="flex items-center gap-2">
              {/* Custom Container */}
              <div className="ml-5 flex items-end gap-2">
                <span className={`text-xs whitespace-nowrap ${employeesRanked ? 'text-gray-400' : 'text-gray-400'}`}>
                  {employeesRanked ? 'Ranked' : 'Rank Employees'}
                </span>
                {employeesRanked ? (
                  <svg 
                    className="w-5 h-5" 
                    viewBox="0 0 20 20" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M5.02587 7.07015C2.31003 9.81552 2.32479 14.2583 5.07015 16.9741C7.81552 19.69 12.2583 19.6752 14.9741 16.9298C17.69 14.1845 17.6752 9.74172 14.9298 7.02587C12.1845 4.31003 7.74172 4.32479 5.02587 7.07015ZM13.4096 10.6568L9.60148 14.5092C9.27676 14.8339 8.7454 14.8339 8.42068 14.5092L8.27308 14.3616L7.83028 13.9188L6.59044 12.6937C6.26571 12.369 6.26571 11.8376 6.59044 11.5129C6.91516 11.1882 7.44652 11.1882 7.77124 11.5129L9.01108 12.738L12.2288 9.4908C12.5535 9.16608 13.0848 9.16608 13.4096 9.4908C13.7343 9.80076 13.7343 10.3321 13.4096 10.6568Z" fill="#9CA3AF"/>
                  </svg>
                ) : (
                  <svg 
                    className="w-5 h-5" 
                    viewBox="0 0 20 20" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6.16667 16.3333H2V8.08333C2 7.97283 2.0439 7.86685 2.12204 7.78871C2.20018 7.71057 2.30616 7.66667 2.41667 7.66667H5.75C5.86051 7.66667 5.96649 7.71057 6.04463 7.78871C6.12277 7.86685 6.16667 7.97283 6.16667 8.08333V16.3333ZM12.4167 3.41667C12.4167 3.30616 12.3728 3.20018 12.2946 3.12204C12.2165 3.0439 12.1105 3 12 3H8.66667C8.55616 3 8.45018 3.0439 8.37204 3.12204C8.2939 3.20018 8.25 3.30616 8.25 3.41667V16.3333H12.4167V3.41667ZM18.25 10.3333H14.9167C14.8062 10.3333 14.7002 10.3772 14.622 10.4554C14.5439 10.5335 14.5 10.6395 14.5 10.75V16.3333H18.6667V10.75C18.6667 10.6395 18.6228 10.5335 18.5446 10.4554C18.4665 10.3772 18.3605 10.3333 18.25 10.3333Z" fill="#00DF71"/>
                  </svg>
                )}
              </div>
              {/* Expand/Collapse Arrow */}
            <button 
              onClick={() => {
                if (employeesRanked) {
                  setIsExpanded(!isExpanded);
                } else {
                  onChevronClick();
                }
              }}
              className={`p-2 transition-colors ${employeesRanked ? 'text-gray-400 hover:text-white cursor-pointer' : 'text-gray-600 cursor-not-allowed'}`}
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

          {/* Employee Table */}
          <div className="bg-[#1e2327] rounded-lg border border-[#454446] overflow-hidden">
            {/* Horizontal Scrollable Container */}
            <div className="overflow-x-auto">
              {/* Table with Fixed Column Widths */}
              <div className="min-w-[600px]">
                {/* Table Header */}
                <div className="bg-[#1B1D21] border-b border-[#3D3C3E] p-0">
                  <div className="flex">
                    <div className="w-[54px] py-3 flex justify-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-[#00DF71] focus:ring-[#00DF71] border-gray-600 rounded bg-[#1B1D21]"
                        style={{ accentColor: '#00DF71' }}
                      />
                    </div>
                    <div className="py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider flex-1">EMPLOYEE ID</div>
                    <div className="pl-3 pr-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider flex-1">NAME</div>
                    <div className="pl-3 pr-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider flex-1">TITLE</div>
                    <div className="pl-3 pr-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider flex-1">START DATE</div>
                    <div className="pl-3 pr-20 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider flex-1">RANKING</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-[#3D3C3E]">
                  {sampleEmployees
                    .slice(0, 10) // Show top 10 employees
                    .map((employee, index) => (
                      <div key={employee.id} className="flex bg-[#191D21] hover:bg-[#202327] transition-colors">
                        <div className="w-[54px] py-4 flex justify-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-[#00DF71] focus:ring-[#00DF71] border-gray-600 rounded bg-[#1B1D21]"
                            style={{ accentColor: '#00DF71' }}
                          />
                        </div>
                        <div className="py-4 whitespace-nowrap text-sm text-gray-300 flex-1">
                          {employee.id.length > 14 ? `${employee.id.substring(0, 14)}...` : employee.id}
                        </div>
                        <div className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-white font-medium flex-1">{employee.name}</div>
                        <div className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-gray-300 flex-1">{employee.title}</div>
                        <div className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-gray-300 flex-1">{employee.startDate}</div>
                        <div className="pl-3 pr-20 py-4 whitespace-nowrap text-sm text-gray-300 flex-1 text-right">
                          {(99.9 - (index * 6.66)).toFixed(1)}%
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
              Showing top 10 employees ranked by {skillData.skill} proficiency
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Employee source and ranking algorithm will be defined later
            </p>
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
  const [bulkProficiency, setBulkProficiency] = useState<string>('Beginner');
  const [bulkMotivation, setBulkMotivation] = useState<string>('Low');
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

  // Handle adding a skill to required skills
  const handleAddSkill = (skill: string) => {
    if (!requiredSkills.includes(skill)) {
      setRequiredSkills([...requiredSkills, skill]);
    }
  };

  // Handle removing a skill from required skills
  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  // Handle proficiency change for a skill
  const handleProficiencyChange = (skill: string, proficiency: string) => {
    setSkillProficiencies(prev => ({ ...prev, [skill]: proficiency }));
  };

  // Handle motivation change for a skill
  const handleMotivationChange = (skill: string, motivation: string) => {
    setSkillMotivations(prev => ({ ...prev, [skill]: motivation }));
  };

  // Handle bulk update of selected skills
  const handleBulkUpdate = () => {
    const updatedProficiencies = { ...skillProficiencies };
    const updatedMotivations = { ...skillMotivations };
    
    selectedSkillsForAction.forEach(skill => {
      updatedProficiencies[skill] = bulkProficiency;
      updatedMotivations[skill] = bulkMotivation;
    });
    
    setSkillProficiencies(updatedProficiencies);
    setSkillMotivations(updatedMotivations);
    setSelectedSkillsForAction([]);
    setPendingChanges({}); // Clear pending changes after saving
  };

  // Handle rank employees action
  const handleRankEmployees = () => {
    const skillsToRank = selectedSkillsForAction.map(skill => {
      // Get the most current value: pending changes first, then saved values, then defaults
      const currentProficiency = pendingChanges[skill]?.proficiency || skillProficiencies[skill] || 'Beginner';
      const currentMotivation = pendingChanges[skill]?.motivation || skillMotivations[skill] || 'Low';
      
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
    
    // Simulate AI processing delay - in real implementation, this would be an actual API call
    setTimeout(() => {
      setEmployeesRanked(true);
    }, 2000); // 2 second delay to simulate AI processing
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
                      <input
                        type="text"
                        placeholder="Add CSV task list / requirements"
                        className="flex-1 bg-[#1e2327] border-2 border-dashed border-[#454446] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors"
                      />
                      <button className="px-6 py-3 bg-[#00DF71] text-[#212327] font-medium rounded-lg hover:bg-[#0AFB84] transition-colors whitespace-nowrap">
                        Build Skills
                      </button>
                    </div>
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
                        onClick={() => setRightContainerTab('rank-employees')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          rightContainerTab === 'rank-employees'
                            ? 'text-[#00DF71] border-b-2 border-[#00DF71]'
                            : 'text-gray-400 hover:text-white'
                        }`}
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
                                    }
                                  }}
                                  className="w-4 h-4 text-[#00DF71] bg-[#1e2327] border-[#454446] rounded focus:ring-[#00DF71] focus:ring-2"
                                />
                              </div>
                              <div className="col-span-5 text-white font-medium">{skill}</div>
                              <div className="col-span-3">
                                <select 
                                  value={pendingChanges[skill]?.proficiency || skillProficiencies[skill] || 'Beginner'}
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
                                  value={pendingChanges[skill]?.motivation || skillMotivations[skill] || 'Low'}
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
                                      disabled={selectedSkillsForAction.length === 0}
                                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                        selectedSkillsForAction.length > 0
                                          ? 'bg-gray-600 hover:bg-gray-700 text-white font-medium cursor-pointer border border-gray-500'
                                          : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                      }`}
                                    >
                                      Update
                                    </button>
                                    <button
                                      onClick={handleRankEmployees}
                                      disabled={selectedSkillsForAction.length === 0 || Object.keys(pendingChanges).length > 0}
                                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                        selectedSkillsForAction.length > 0 && Object.keys(pendingChanges).length === 0
                                          ? 'bg-[#00DF71] hover:bg-[#0AFB84] text-[#212327] font-medium cursor-pointer'
                                          : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                      }`}
                                    >
                                      Rank Employees
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
                                <div className="ml-5 flex items-end gap-2">
                                  <span className="text-xs text-[#00DF71] whitespace-nowrap">
                                    Rank Employees
                                  </span>
                                  <svg 
                                    className="w-5 h-5" 
                                    viewBox="0 0 20 20" 
                                    fill="none" 
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M6.16667 16.3333H2V8.08333C2 7.97283 2.0439 7.86685 2.12204 7.78871C2.20018 7.71057 2.30616 7.66667 2.41667 7.66667H5.75C5.86051 7.66667 5.96649 7.71057 6.04463 7.78871C6.12277 7.86685 6.16667 7.97283 6.16667 8.08333V16.3333ZM12.4167 3.41667C12.4167 3.30616 12.3728 3.20018 12.2946 3.12204C12.2165 3.0439 12.1105 3 12 3H8.66667C8.55616 3 8.45018 3.0439 8.37204 3.12204C8.2939 3.20018 8.25 3.30616 8.25 3.41667V16.3333H12.4167V3.41667ZM18.25 10.3333H14.9167C14.8062 10.3333 14.7002 10.3772 14.622 10.4554C14.5439 10.5335 14.5 10.6395 14.5 10.75V16.3333H18.6667V10.75C18.6667 10.6395 18.6228 10.5335 18.5446 10.4554C18.4665 10.3772 18.3605 10.3333 18.25 10.3333Z" fill="#00DF71"/>
                                  </svg>
                                </div>
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