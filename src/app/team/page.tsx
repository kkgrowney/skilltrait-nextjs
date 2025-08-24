'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SideNavigation, { useSideNavMargin } from '@/components/SideNavigation';
import { useNavigation } from '@/contexts/NavigationContext';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ViewTitleTab from '@/components/ViewTitleTab';
import EmployeesContent from '@/components/EmployeesContent';
import DragDropUpload from '@/components/DragDropUpload';

export default function Team() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const sideNavMargin = useSideNavMargin();
  const { currentView, setCurrentView } = useNavigation();
  const [teamProfile, setTeamProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
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

  // Fetch team profile data from connectedCompanies subcollection
  const fetchTeamProfile = async () => {
    if (!user?.uid) return;
    
    setIsLoadingProfile(true);
    try {
      // Fetch from the user's connectedCompanies subcollection
      const connectedCompaniesRef = collection(db, 'users', user.uid, 'connectedCompanies');
      const connectedCompaniesSnapshot = await getDocs(connectedCompaniesRef);
      
      if (!connectedCompaniesSnapshot.empty) {
        // Find the active and verified company connection
        let activeCompanyConnection: any = null;
        
        connectedCompaniesSnapshot.forEach((companyDoc: any) => {
          const companyData = companyDoc.data();
          console.log('Checking company connection:', companyData);
          console.log('Document ID:', companyDoc.id);
          console.log('active field:', companyData.active, 'type:', typeof companyData.active);
          console.log('verified field:', companyData.verified, 'type:', typeof companyData.verified);
          console.log('companyReference field:', companyData.companyReference, 'type:', typeof companyData.companyReference);
          
          // Look for active=true and verified=true connections
          if (companyData.active === true && companyData.verified === true) {
            activeCompanyConnection = { id: companyDoc.id, ...companyData };
            console.log('Found active and verified company connection:', activeCompanyConnection);
          }
        });
        
        if (activeCompanyConnection && activeCompanyConnection.companyReference) {
          // Fetch the actual company details from the companies collection
          try {
            console.log('Company reference found:', activeCompanyConnection.companyReference);
            
            // Handle both string IDs and Firestore document references
            let companyDocRef: any;
            if (typeof activeCompanyConnection.companyReference === 'string') {
              // If it's a string ID
              companyDocRef = doc(db, 'companies', activeCompanyConnection.companyReference);
            } else if (activeCompanyConnection.companyReference && typeof activeCompanyConnection.companyReference === 'object' && 'path' in activeCompanyConnection.companyReference) {
              // If it's a Firestore document reference, use it directly
              companyDocRef = activeCompanyConnection.companyReference;
            } else {
              console.log('Invalid companyReference format:', activeCompanyConnection.companyReference);
              setTeamProfile(activeCompanyConnection); // Fallback to connection data only
              setHasTeam(true);
              return;
            }
            
            const companyDoc = await getDoc(companyDocRef);
            
            if (companyDoc.exists()) {
              const companyDetails = companyDoc.data();
              // Combine connection data with company details
              const fullCompanyProfile = {
                ...activeCompanyConnection,
                ...companyDetails
              };
              setTeamProfile(fullCompanyProfile);
              setHasTeam(true);
              console.log('Full company profile loaded:', fullCompanyProfile);
            } else {
              console.log('Company document not found for reference:', activeCompanyConnection.companyReference);
              setTeamProfile(activeCompanyConnection); // Fallback to connection data only
              setHasTeam(true);
            }
          } catch (companyError) {
            console.error('Error fetching company details:', companyError);
            setTeamProfile(activeCompanyConnection); // Fallback to connection data only
            setHasTeam(true);
          }
        } else {
          console.log('No active and verified company connections found, or missing companyReference');
          console.log('activeCompanyConnection:', activeCompanyConnection);
          if (activeCompanyConnection) {
            console.log('companyReference type:', typeof activeCompanyConnection.companyReference);
            console.log('companyReference value:', activeCompanyConnection.companyReference);
          }
          setHasTeam(false);
          setTeamProfile(null);
        }
      } else {
        console.log('No connected companies found for user');
        setHasTeam(false);
        setTeamProfile(null);
      }
    } catch (error) {
      console.error('Error fetching connected companies:', error);
      setHasTeam(false);
      setTeamProfile(null);
    } finally {
      setIsLoadingProfile(false);
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
      
      // Query all users to find those with admin access to this company
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const membersData = [];
      
      // Check each user's connectedCompanies subcollection
      for (const userDoc of usersSnapshot.docs) {
        try {
          const connectedCompaniesRef = collection(db, 'users', userDoc.id, 'connectedCompanies');
          const connectedCompaniesSnapshot = await getDocs(connectedCompaniesRef);
          
          // Look for connections that match our criteria
          let isAdminForThisCompany = false;
          let connectionData: any = null;
          
          connectedCompaniesSnapshot.forEach((companyDoc: any) => {
            const companyData = companyDoc.data();
            console.log(`Checking user ${userDoc.id} company connection:`, companyData);
            
            // Check if this connection matches our company and user is admin
            if (companyData.active === true && 
                companyData.isAdmin === true && 
                companyData.companyReference) {
              
              // Compare company references
              let connectionCompanyRef = companyData.companyReference;
              if (typeof connectionCompanyRef === 'string' && typeof companyRefToMatch === 'string') {
                // Both are strings, compare directly
                if (connectionCompanyRef === companyRefToMatch) {
                  isAdminForThisCompany = true;
                  connectionData = companyData;
                  console.log(`User ${userDoc.id} is admin for this company`);
                }
              } else if (connectionCompanyRef && typeof connectionCompanyRef === 'object' && 
                         companyRefToMatch && typeof companyRefToMatch === 'object' &&
                         'path' in connectionCompanyRef && 'path' in companyRefToMatch) {
                // Both are Firestore document references, compare paths
                if (connectionCompanyRef.path === companyRefToMatch.path) {
                  isAdminForThisCompany = true;
                  connectionData = companyData;
                  console.log(`User ${userDoc.id} is admin for this company (path match)`);
                }
              }
            }
          });
          
          // If user is admin for this company, add them to the list
          if (isAdminForThisCompany && connectionData) {
            const userData = userDoc.data();
            membersData.push({
              id: userDoc.id,
              name: userData.display_name || userData.displayName || userData.name || 'Unknown User',
              photo: userData.photo_url || userData.photoURL || userData.photo || userData.profilePicture,
              role: 'Admin',
              connectionData: connectionData // Include connection details
            });
            console.log(`Added admin user: ${userData.display_name || userData.displayName || userData.name || 'Unknown User'}`);
          }
          
        } catch (error) {
          console.error(`Error checking user ${userDoc.id} for admin access:`, error);
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
            <div className="w-full bg-[#1e2327] flex items-center h-16" style={{ height: "64px !important", minHeight: "64px", maxHeight: "64px", paddingLeft: "32px" }}>
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

  // Render Team view for existing teams
  return (
    <div className="min-h-screen" style={{backgroundColor: '#1A1D21'}}>
      <SideNavigation />
      
      <div className="md:ml-60 ml-0 md:ml-[66px] h-full flex flex-col">
        {/* Fixed Header Container */}
        <div className="flex-shrink-0 z-20">
          {/* ViewTitle Container */}
          <div className="w-full bg-[#1e2327] flex items-center h-16" style={{ height: "64px !important", minHeight: "64px", maxHeight: "64px", paddingLeft: "32px" }}>
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
                        <div className="min-h-[400px] bg-[#1e2327] rounded-lg border border-[#454446] flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <p className="text-sm">Employee ranking functionality coming soon</p>
                            <p className="text-xs mt-1">This will allow you to rank employees based on skill requirements</p>
                          </div>
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
                    <div className="min-h-[400px] bg-[#1e2327] rounded-lg border border-[#454446] flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <p className="text-sm">Employee ranking functionality coming soon</p>
                        <p className="text-xs mt-1">This will allow you to rank employees based on skill requirements</p>
                      </div>
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

              {/* Team Members Section */}
              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Team Admin</h2>
                  <button className="px-3 py-1 text-xs bg-[#00DF71] text-[#212327] rounded-full hover:bg-[#0AFB84] transition-colors">
                    Add Admin
                  </button>
                </div>
                
                <div className="space-y-4">
                  {isLoadingMembers ? (
                    <div className="text-center text-gray-400 py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00DF71] mx-auto mb-2"></div>
                      <p className="text-sm">Loading team members...</p>
                    </div>
                  ) : teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
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
                          <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">{member.role}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <p className="text-sm">No team members found</p>
                      <p className="text-xs mt-2">Add team members to start collaborating</p>
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