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
}

function SkillRankSection({ skillData }: SkillRankSectionProps) {
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
            {/* Rank Label and Icon */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 whitespace-nowrap">Rank</span>
              <button 
                onClick={triggerVectorSearch}
                disabled={isSearching}
                className={`p-2 transition-colors ${
                  isSearching 
                    ? 'text-[#00DF71] cursor-not-allowed' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Search for employees with this skill"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00DF71]"></div>
                ) : (
                  <svg className="w-7.5 h-7.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3.35887C18.0012 2.59267 17.381 1.97055 16.6148 1.96936C15.8486 1.96817 15.2265 2.58834 15.2253 3.35457C15.2248 3.71415 15.3638 4.05989 15.6132 4.31892L13.9054 6.67707C13.4107 6.43905 12.8224 6.51403 12.4033 6.86849L11.1995 5.87548C11.5745 5.20775 11.3372 4.36246 10.6695 3.98742C10.0017 3.61241 9.15646 3.84967 8.78142 4.5174C8.48936 5.03743 8.56255 5.686 8.96318 6.12786L7.32487 8.23796C6.63738 7.89077 5.79861 8.16668 5.45143 8.85417C5.28316 9.1874 5.25552 9.57414 5.37467 9.92791L4.43611 10.4621C3.9366 9.88207 3.0615 9.81685 2.48152 10.3163C1.90153 10.8158 1.83631 11.6909 2.3358 12.2709C2.34735 12.2843 2.35914 12.2975 2.37116 12.3104V16.3169C2.37116 16.4512 2.47998 16.56 2.61422 16.56H4.12419C4.25827 16.5596 4.36685 16.451 4.36725 16.3169V12.3133C4.73094 11.9345 4.84968 11.3829 4.67413 10.8879L5.61265 10.3538C5.63357 10.3789 5.65581 10.4028 5.67934 10.4255V16.3198C5.67975 16.4542 5.78876 16.5629 5.92313 16.5629H7.43668C7.57091 16.5629 7.67974 16.4541 7.67974 16.3198V10.4298C8.18086 9.90271 8.19363 9.07932 7.70913 8.53695L8.99183 6.88214V16.3198C8.99223 16.4539 9.10081 16.5625 9.23489 16.5629H10.747C10.8814 16.5629 10.9904 16.4542 10.9908 16.3198V6.33509L12.0935 7.24494C11.7956 7.77831 11.8802 8.44356 12.3021 8.88539V16.3198C12.3026 16.4542 12.4116 16.5629 12.5459 16.5629H14.0573C14.1917 16.5629 14.3007 16.4542 14.3011 16.3198V8.88611C14.8127 8.34694 14.8127 7.50162 14.3011 6.96245L15.6147 5.15134V16.3198C15.6151 16.4539 15.7236 16.5625 15.8577 16.5629H17.3698C17.5039 16.5625 17.6125 16.4539 17.6129 16.3169V4.31892C17.8615 4.0612 18.0003 3.717 18 3.35887ZM3.37352 10.4506C3.87147 10.4646 4.26373 10.8797 4.24971 11.3776C4.23622 11.8558 3.85174 12.2403 3.37352 12.2538C2.87554 12.2406 2.48259 11.8262 2.49582 11.3282C2.50853 10.85 2.89245 10.4648 3.37063 10.4506H3.37352V10.4506ZM2.86017 16.0768V12.6403C3.18918 12.7722 3.55641 12.7722 3.88546 12.6403V16.0768H2.86017ZM6.68026 8.56562C7.17802 8.56562 7.58152 8.96912 7.58152 9.46688C7.58152 9.96464 7.17802 10.3681 6.68026 10.3681C6.1825 8.56562 5.77901 9.96464 5.77901 9.46688C5.77901 8.96912 5.77901 8.56562 6.68026 8.56562ZM6.16763 16.0768V10.7539C6.49706 10.8851 6.86422 10.8851 7.19365 10.7539V16.0753L6.16763 16.0768ZM9.9913 4.29382C10.4893 4.30787 10.8815 4.72291 10.8675 5.22086C10.854 5.69908 10.4695 6.08356 9.9913 6.09705C9.49335 6.083 9.10109 5.66796 9.11511 5.17001C9.1286 4.69182 9.51308 4.30731 9.9913 4.29382ZM9.47864 16.0768V6.48636C9.80747 6.61934 10.1751 6.61934 10.5039 6.48636V16.0768H9.47864ZM13.3016 7.0234C13.7996 7.03745 14.1918 7.45249 14.1778 7.95044C14.1643 8.42866 13.7798 8.81314 13.3016 8.82663C12.8037 8.81258 12.4114 8.39754 12.4254 7.89959C12.4389 7.42137 12.8234 7.03689 13.3016 7.0234ZM12.789 16.0768V9.21092C13.1182 9.34212 13.4851 9.34212 13.8143 9.21092V16.0739L12.789 16.0768ZM16.6119 2.45404C17.1097 2.45404 17.5132 2.85753 17.5132 3.3553C17.5132 3.85306 17.1097 4.25655 16.6119 4.25655C16.115 4.22847 15.7349 3.80286 15.7629 3.30592C15.7888 2.84819 16.1542 2.48278 16.6119 2.45693V2.45404ZM16.0993 16.0768V4.64445C16.4282 4.77815 16.7963 4.77815 17.1253 4.64445V16.0768L16.0993 16.0768ZM17.3684 18.0305H2.61425C2.48001 18.0304 2.37131 17.9214 2.37147 17.7872C2.37163 17.6532 2.48023 17.5446 2.61425 17.5444H17.3684C17.5024 17.5517 17.6051 17.6663 17.5979 17.8003C17.5911 17.9242 17.4922 18.0231 17.3684 18.0298V18.0305Z"/>
                  </svg>
                )}
              </button>
            </div>
            {/* Expand/Collapse Arrow */}
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
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
                        <div className="py-4 whitespace-nowrap text-sm text-gray-300 flex-1">{employee.id}</div>
                        <div className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-white font-medium flex-1">{employee.name}</div>
                        <div className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-gray-300 flex-1">{employee.title}</div>
                        <div className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-gray-300 flex-1">{employee.startDate}</div>
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
                            : 'text-white'
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
                      {requiredSkills.length > 0 && (
                        <button
                          onClick={() => setRequiredSkills([])}
                          className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                        >
                          Clear All
                        </button>
                      )}
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
                            {selectedSkillsForAction.length > 0 && (
                              <div className="p-4 bg-[#2a2e32] border-t border-[#454446]">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-300">
                                    {selectedSkillsForAction.length} skill{selectedSkillsForAction.length !== 1 ? 's' : ''} selected
                                  </span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setRequiredSkills(requiredSkills.filter(skill => !selectedSkillsForAction.includes(skill)));
                                        setSelectedSkillsForAction([]);
                                        setPendingChanges({});
                                      }}
                                      className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                    >
                                      Remove
                                    </button>
                                    <button
                                      onClick={handleBulkUpdate}
                                      className="px-3 py-1 text-xs bg-[#00DF71] hover:bg-[#0AFB84] text-[#212327] font-medium rounded-full transition-colors"
                                    >
                                      Update
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
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
                        
                        {/* Rank Employees Container */}
                        <div className="space-y-4">
                          {/* Sample Required Skills - Replace with actual data later */}
                          {[
                            { skill: 'React', proficiency: 'Master', motivation: 'High' },
                            { skill: 'UX', proficiency: 'Beginner', motivation: 'Low' },
                            { skill: 'JavaScript', proficiency: 'Expert', motivation: 'Very High' },
                            { skill: 'Project Management', proficiency: 'Advanced', motivation: 'Moderate' },
                            { skill: 'Data Analysis', proficiency: 'Intermediate', motivation: 'High' }
                          ].map((skillData, index) => (
                            <SkillRankSection 
                              key={index} 
                              skillData={skillData} 
                            />
                          ))}
                        </div>
                      </div>
                    )}
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
                            : 'text-white'
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
                          {requiredSkills.length > 0 && (
                            <button
                              onClick={() => setRequiredSkills([])}
                              className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                            >
                              Clear All
                            </button>
                          )}
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
                            {selectedSkillsForAction.length > 0 && (
                              <div className="p-4 bg-[#2a2e32] border-t border-[#454446]">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-300">
                                      {selectedSkillsForAction.length} selected
                                    </span>
                                    {Object.keys(pendingChanges).length > 0 && (
                                      <span className="text-sm text-[#00DF71] font-medium">
                                        {Object.keys(pendingChanges).length} skill{Object.keys(pendingChanges).length !== 1 ? 's' : ''} changed - update to save
                                      </span>
                                    )}
                                  </div>
                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setRequiredSkills(requiredSkills.filter(skill => !selectedSkillsForAction.includes(skill)));
                                        setSelectedSkillsForAction([]);
                                        setPendingChanges({});
                                      }}
                                      className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                    >
                                      Remove
                                    </button>
                                    <button
                                      onClick={handleBulkUpdate}
                                      className="px-3 py-1 text-xs bg-[#00DF71] hover:bg-[#0AFB84] text-[#212327] font-medium rounded-full transition-colors"
                                    >
                                      Update
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
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
                        
                        {/* Rank Employees Container */}
                        <div className="space-y-4">
                          {/* Sample Required Skills - Replace with actual data later */}
                          {[
                            { skill: 'React', proficiency: 'Master', motivation: 'High' },
                            { skill: 'UX', proficiency: 'Beginner', motivation: 'Low' },
                            { skill: 'JavaScript', proficiency: 'Expert', motivation: 'Very High' },
                            { skill: 'Project Management', proficiency: 'Advanced', motivation: 'Moderate' },
                            { skill: 'Data Analysis', proficiency: 'Intermediate', motivation: 'High' }
                          ].map((skillData, index) => (
                            <SkillRankSection 
                              key={index} 
                              skillData={skillData} 
                            />
                          ))}
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