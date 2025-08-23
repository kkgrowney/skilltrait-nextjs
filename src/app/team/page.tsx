'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SideNavigation, { useSideNavMargin } from '@/components/SideNavigation';
import { useNavigation } from '@/contexts/NavigationContext';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
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

  // Fetch team profile data from Firebase
  const fetchTeamProfile = async () => {
    if (!user?.uid) return;
    
    setIsLoadingProfile(true);
    try {
      const teamDocRef = doc(db, 'teams', user.uid);
      const teamDoc = await getDoc(teamDocRef);
      
      if (teamDoc.exists()) {
        const data = teamDoc.data();
        setTeamProfile(data);
        setHasTeam(true);
        console.log('Team profile loaded:', data);
      } else {
        console.log('No team profile found');
        setHasTeam(false);
        setTeamProfile(null);
      }
    } catch (error) {
      console.error('Error fetching team profile:', error);
      setHasTeam(false);
      setTeamProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch team members data from Firebase
  const fetchTeamMembers = async () => {
    if (!hasTeam) return;
    
    setIsLoadingMembers(true);
    try {
      // Fetch team members using their actual Firebase user IDs
      const memberIds = [
        'zIMIiaMN8DfFjoyZ16JOZKxFVrZ2', // Kevin Growney
        'HorpXmUHFmfT6FePBp2fTsdHy2y2'  // Jens Kresel
      ];
      
      const membersData = [];
      
      // Process Kevin Growney
      try {
        const kevinDocRef = doc(db, 'users', 'zIMIiaMN8DfFjoyZ16JOZKxFVrZ2');
        const kevinDoc = await getDoc(kevinDocRef);
        
        if (kevinDoc.exists()) {
          const kevinData = kevinDoc.data();
          membersData.push({
            id: kevinDoc.id,
            name: kevinData.display_name || kevinData.displayName || kevinData.name || 'Kevin Growney',
            photo: kevinData.photo_url || kevinData.photoURL || kevinData.photo || kevinData.profilePicture,
            role: 'Admin'
          });
          console.log('Found Kevin Growney:', kevinDoc.id);
        }
      } catch (error) {
        console.error('Error fetching Kevin Growney:', error);
      }
      
      // Process Jens Kresel
      try {
        const jensDocRef = doc(db, 'users', 'HorpXmUHFmfT6FePBp2fTsdHy2y2');
        const jensDoc = await getDoc(jensDocRef);
        
        if (jensDoc.exists()) {
          const jensData = jensDoc.data();
          membersData.push({
            id: jensDoc.id,
            name: jensData.display_name || jensData.displayName || jensData.name || 'Jens Kresel',
            photo: jensData.photo_url || jensData.photoURL || jensData.photo || jensData.profilePicture,
            role: 'Admin'
          });
          console.log('Found Jens Kresel:', jensDoc.id);
        }
      } catch (error) {
        console.error('Error fetching Jens Kresel:', error);
      }
      
      setTeamMembers(membersData);
      console.log('Team members loaded:', membersData);
    } catch (error) {
      console.error('Error fetching team members:', error);
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
              <div className="max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
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
                        className="w-full bg-[#1e2327] border border-[#454446] rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
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

                {/* Right Column */}
                <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Required Skills</h3>
                  {requiredSkills.length > 0 ? (
                    <div className="space-y-3">
                      {requiredSkills.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-[#1e2327] rounded-lg border border-[#454446]"
                        >
                          <span className="text-white font-medium">{skill}</span>
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="flex items-center justify-center w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors text-xs font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
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
              </div>
            </div>
          ) : activeTab === 'employees' ? (
            // Employees tab content
            <div className="w-full h-full">
              <EmployeesContent />
            </div>
          ) : activeTab === 'admin' ? (
            // Admin tab content
            <div className="max-w-4xl">
              {/* Team Card Container */}
              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 mb-6">
                {/* Team Title */}
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Team Profile</h2>
                  <button 
                    onClick={() => router.push('/teamEdit')}
                    className="ml-3 px-3 py-1 text-xs bg-[#00DF71] text-[#212327] rounded-full hover:bg-[#0AFB84] transition-colors"
                  >
                    Edit
                  </button>
                </div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  {/* Team Picture */}
                  <div className="flex-shrink-0">
                    {teamProfile?.teamPhoto ? (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-[#454446]">
                        <img 
                          src={teamProfile.teamPhoto} 
                          alt="Team"
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
                              {teamProfile?.teamName?.charAt(0) || 'T'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#454446] flex items-center justify-center border-2 border-[#454446]">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#1e2327] flex items-center justify-center">
                          <span className="text-white text-lg md:text-xl font-semibold">
                            {teamProfile?.teamName?.charAt(0) || 'T'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Team Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl md:text-2xl font-bold text-[#00DF71]">
                        {teamProfile?.teamName || 'My Team'}
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