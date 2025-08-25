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

  // Check if user is admin - if not, show limited view
  if (hasTeam && teamProfile && !(teamProfile as any).isAdmin && !isLoadingProfile) {
    return (
      <div className="min-h-screen" style={{backgroundColor: '#1A1D21'}}>
        <SideNavigation />
        
        <div className={`${sideNavMargin} h-full flex flex-col`}>
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