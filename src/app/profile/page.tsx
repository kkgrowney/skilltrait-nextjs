"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SideNavigation, { useSideNavMargin } from '@/components/SideNavigation';
import ProfileViewTitleTab from '@/components/ProfileViewTitleTab';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, query, orderBy, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('summary');
  const { user } = useAuth();
  const router = useRouter();
  const sideNavMargin = useSideNavMargin();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [recentProps, setRecentProps] = useState<any[]>([]);
  const [recentTemplates, setRecentTemplates] = useState<any[]>([]);
  const [isLoadingRecentProps, setIsLoadingRecentProps] = useState(true);
  const [isLoadingRecentTemplates, setIsLoadingRecentTemplates] = useState(true);
  const [carouselPosition, setCarouselPosition] = useState(0);
  const [templatesCarouselPosition, setTemplatesCarouselPosition] = useState(0);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedSkillDetail, setSelectedSkillDetail] = useState<string | null>(null);
  const [overviewText, setOverviewText] = useState('');
  const [originalOverviewText, setOriginalOverviewText] = useState('');
  const [selectedProficiencyLevel, setSelectedProficiencyLevel] = useState<string>('');

  // Fetch user profile data
  const fetchUserProfile = async () => {
    if (!user?.uid) return;
    
    setIsLoadingProfile(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile(data);
        setOverviewText(data.overview || '');
        setOriginalOverviewText(data.overview || '');
        setSelectedProficiencyLevel(data.proficiencyLevel || '');
        console.log('User profile loaded:', data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch recent props data
  const fetchRecentProps = async () => {
    if (!user?.uid) return;
    
    setIsLoadingRecentProps(true);
    try {
      const propsRef = collection(db, "users", user.uid, "props");
      const q = query(propsRef, orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setRecentProps(items);
        setIsLoadingRecentProps(false);
      });
      return () => unsub();
    } catch (error) {
      console.error('Error fetching recent props:', error);
      setRecentProps([]);
      setIsLoadingRecentProps(false);
    }
  };

  // Fetch recent templates data
  const fetchRecentTemplates = async () => {
    if (!user?.uid) return;
    
    setIsLoadingRecentTemplates(true);
    try {
      const templatesRef = collection(db, "users", user.uid, "templates");
      const q = query(templatesRef, orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setRecentTemplates(items);
        setIsLoadingRecentTemplates(false);
      });
      return () => unsub();
    } catch (error) {
      console.error('Error fetching recent templates:', error);
      setRecentTemplates([]);
      setIsLoadingRecentTemplates(false);
    }
  };

  // Carousel scroll handlers
  const handleCarouselScroll = (direction: "left" | "right") => {
    if (direction === "left" && carouselPosition > 0) {
      setCarouselPosition(carouselPosition - 1);
    } else if (direction === "right" && carouselPosition < 1) {
      setCarouselPosition(carouselPosition + 1);
    }
  };

  const handleTemplatesCarouselScroll = (direction: "left" | "right") => {
    if (direction === "left" && templatesCarouselPosition > 0) {
      setTemplatesCarouselPosition(templatesCarouselPosition - 1);
    } else if (direction === "right" && templatesCarouselPosition < 1) {
      setTemplatesCarouselPosition(templatesCarouselPosition + 1);
    }
  };

  // Handle adding skills
  const handleAddSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Handle removing skills
  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
    if (selectedSkillDetail === skill) {
      setSelectedSkillDetail(null);
    }
  };

  // Handle skill selection for detail view
  const handleSkillSelect = (skill: string) => {
    if (selectedSkillDetail === skill) {
      setSelectedSkillDetail(null);
    } else {
      setSelectedSkillDetail(skill);
    }
  };

  // Handle closing skill detail
  const handleCloseSkillDetail = () => {
    setSelectedSkillDetail(null);
  };

  const handleSaveOverview = async () => {
    if (!user?.uid) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { overview: overviewText });
      setOriginalOverviewText(overviewText);
    } catch (error) {
      console.error('Error saving overview:', error);
      alert('Failed to save overview.');
    }
  };

  const handleCancelOverview = () => {
    setOverviewText(originalOverviewText);
  };

  const handleProficiencyLevelSelect = async (level: string) => {
    if (!user?.uid) return;
    
    let newLevel = '';
    if (selectedProficiencyLevel === level) {
      // If clicking the same level, deselect it
      newLevel = '';
    } else {
      // Select the new level (automatically deselects the previous one)
      newLevel = level;
    }
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { proficiencyLevel: newLevel });
      setSelectedProficiencyLevel(newLevel);
    } catch (error) {
      console.error('Error saving proficiency level:', error);
      alert('Failed to save proficiency level.');
    }
  };

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchRecentProps();
      fetchRecentTemplates();
    }
  }, [user]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1B1D21" }}>
      <SideNavigation />
      
      <div className={`${sideNavMargin} h-full flex flex-col`}>
        {/* Fixed Header Container */}
        <div className="flex-shrink-0 z-20">
          {/* ViewTitle Container */}
          <div className="w-full bg-[#1e2327] flex items-center h-16" style={{ height: "64px !important", minHeight: "64px", maxHeight: "64px", paddingLeft: "32px" }}>
            {/* Title text */}
            <div className="font-semibold text-[#ffffff] text-[18px] whitespace-nowrap md:ml-0 ml-9 flex items-center">
              Profile
            </div>
          </div>
          
          {/* ProfileViewTitleTab Component */}
          <ProfileViewTitleTab activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8" style={{ height: 'calc(100vh - 64px - 48px - 48px)' }}>
          {activeTab === 'summary' ? (
            // Summary tab content with profile card, recent props, and recent templates
            <div className="max-w-4xl">
              {/* Profile Card Container */}
              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 mb-6">
                {/* Profile Title */}
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Profile</h2>
                  <button
                    onClick={() => router.push("/profileEdit")}
                    className="ml-3 px-3 py-1 text-xs bg-[#00DF71] text-[#212327] rounded-full hover:bg-[#0AFB84] transition-colors"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    {userProfile?.photo_url ||
                    userProfile?.photoURL ||
                    userProfile?.photo ||
                    userProfile?.profilePicture ? (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-[#454446]">
                        <img
                          src={
                            userProfile?.photo_url ||
                            userProfile?.photoURL ||
                            userProfile?.photo ||
                            userProfile?.profilePicture
                          }
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initial if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#454446] flex items-center justify-center hidden border-2 border-[#454446]">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#1e2327] flex items-center justify-center">
                            <span className="text-white text-lg md:text-xl font-semibold">
                              {userProfile?.display_name?.charAt(0) ||
                                userProfile?.displayName?.charAt(0) ||
                                userProfile?.name?.charAt(0) ||
                                userProfile?.email?.charAt(0) ||
                                user?.displayName?.charAt(0) ||
                                user?.email?.charAt(0) ||
                                "U"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#454446] flex items-center justify-center border-2 border-[#454446]">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#1e2327] flex items-center justify-center">
                          <span className="text-white text-lg md:text-xl font-semibold">
                            {userProfile?.display_name?.charAt(0) ||
                              userProfile?.displayName?.charAt(0) ||
                              userProfile?.name?.charAt(0) ||
                              userProfile?.email?.charAt(0) ||
                              user?.displayName?.charAt(0) ||
                              user?.email?.charAt(0) ||
                              "U"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl md:text-2xl font-bold text-[#00DF71]">
                        {userProfile?.display_name ||
                          userProfile?.displayName ||
                          userProfile?.name ||
                          user?.displayName ||
                          "User"}
                      </h2>

                      {/* LinkedIn Icon - Only show if LinkedIn URL exists */}
                      {(userProfile?.linkedInLink || userProfile?.linkedin) && (
                        <a
                          href={
                            userProfile?.linkedInLink || userProfile?.linkedin
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
                          style={{ transform: "translateY(0px)" }}
                        >
                          <svg
                            className="w-[14px] h-[14px] md:w-[20px] md:h-[20px] text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </a>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm md:text-base">
                      {userProfile?.currentRole ||
                        userProfile?.title ||
                        userProfile?.role ||
                        userProfile?.jobTitle ||
                        "No title set"}
                    </p>
                  </div>
                </div>

                {/* Separator */}
                <div className="border-t border-[#454446] my-4"></div>

                {/* About Section */}
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-2">
                    About
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base">
                    {userProfile?.about ||
                      userProfile?.bio ||
                      userProfile?.description ||
                      "No bio set"}
                  </p>
                </div>
              </div>

              {/* Recent Props Section */}
              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Recent Props</h2>
                  <Link href="/props" className="px-3 py-1 text-xs bg-[#00DF71] text-[#212327] rounded-full hover:bg-[#0AFB84] transition-colors">
                    View All
                  </Link>
                </div>

                <div className="relative">
                  {/* Left Arrow */}
                  <button
                    onClick={() => handleCarouselScroll("left")}
                    disabled={carouselPosition === 0}
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#1e2327] border border-[#454446] rounded-full p-2 transition-colors ${
                      carouselPosition === 0
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-[#00DF71] cursor-pointer"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Right Arrow */}
                  <button
                    onClick={() => handleCarouselScroll("right")}
                    disabled={carouselPosition === 1}
                    className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#1e2327] border border-[#454446] rounded-full p-2 transition-colors ${
                      carouselPosition === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-[#00DF71] cursor-pointer"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Carousel Container */}
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide px-8 carousel-container" style={{ paddingLeft: "44px" }}>
                    {isLoadingRecentProps && (
                      <div className="text-gray-400 text-sm">Loading...</div>
                    )}
                    {!isLoadingRecentProps && recentProps.length === 0 && (
                      <div className="text-gray-400 text-sm">No props yet</div>
                    )}
                    {recentProps.map((prop) => (
                      <Link key={prop.id} href={`/props/${prop.id}`} className="rounded overflow-hidden border border-[#454446] hover:border-[#00DF71] transition-colors flex-shrink-0 w-full md:w-[calc(33.333%-8px)]" style={{ borderRadius: "4px" }}>
                        <div className="relative" style={{ aspectRatio: "5 / 4" }}>
                          <img
                            src={prop.fullPropImage || "/liquid_death_props.png"}
                            alt={prop.propsTitle || "Recent Prop"}
                            className="object-contain relative z-20 w-full h-full"
                            style={{ borderRadius: "4px", width: "100%", height: "100%", objectPosition: "bottom" }}
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Templates Section */}
              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Recent Templates
                  </h2>
                  <Link href="/templates" className="px-3 py-1 text-xs bg-[#00DF71] text-[#212327] rounded-full hover:bg-[#0AFB84] transition-colors">
                    View All
                  </Link>
                </div>

                <div className="relative">
                  {/* Left Arrow */}
                  <button
                    onClick={() => handleTemplatesCarouselScroll("left")}
                    disabled={templatesCarouselPosition === 0}
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#1e2327] border border-[#454446] rounded-full p-2 transition-colors ${
                      templatesCarouselPosition === 0
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-[#00DF71] cursor-pointer"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Right Arrow */}
                  <button
                    onClick={() => handleTemplatesCarouselScroll("right")}
                    disabled={templatesCarouselPosition === 1}
                    className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#1e2327] border border-[#454446] rounded-full p-2 transition-colors ${
                      templatesCarouselPosition === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-[#00DF71] cursor-pointer"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Carousel Container */}
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide px-8 templates-carousel-container" style={{ paddingLeft: "44px" }}>
                    {isLoadingRecentTemplates && (
                      <div className="text-gray-400 text-sm">Loading...</div>
                    )}
                    {!isLoadingRecentTemplates && recentTemplates.length === 0 && (
                      <div className="text-gray-400 text-sm">No templates yet</div>
                    )}
                    {recentTemplates.map((t) => (
                      <Link
                        key={t.id}
                        href={`/templates/${t.id}`}
                        className="rounded overflow-hidden border border-[#454446] hover:border-[#00DF71] transition-colors flex-shrink-0 w-full md:w-[calc(33.333%-8px)]"
                        style={{ borderRadius: "4px" }}
                      >
                        <div className="relative" style={{ aspectRatio: "5 / 4" }}>
                          {/* White background fill */}
                          <div
                            className="absolute inset-0 z-5 bg-white"
                            style={{ borderRadius: "4px" }}
                          />
                          {/* Background layer (props background 600x400) */}
                          <div
                            className="absolute inset-0 z-10 overflow-hidden"
                            style={{ borderRadius: "4px" }}
                          >
                            <img
                              src={t.backgroundUrl || "/liquid_death_props.png"}
                              alt={t.company || ""}
                              className="w-full h-full object-cover"
                              style={{ borderRadius: "4px", objectFit: "cover", objectPosition: "center" }}
                            />
                          </div>
                          {/* Foreground props image */}
                          <img
                            src={t.basePropsUrl || ""}
                            alt={t.company || ""}
                            className="object-contain relative z-20 w-full h-full"
                            style={{ borderRadius: "4px", width: "100%", height: "100%", objectPosition: "bottom" }}
                          />
                          {/* White header with logo/company (scaled proportionally) */}
                          <div
                            className="absolute top-0 left-0 right-0 bg-white border-b-2 border-gray-200 z-30"
                            style={{ height: "33px", borderRadius: "4px 4px 0 0" }}
                          >
                            <div
                              className="absolute flex items-center gap-1 px-2"
                              style={{ height: "60%", width: "100%", left: 0, top: "50%", transform: "translateY(-50%)" }}
                            >
                              <span className="text-gray-700 text-xs font-medium truncate">
                                {t.company}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'settings' ? (
            // Settings tab content
            <div className="max-w-4xl">
              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Profile Settings</h2>
                <p className="text-gray-300">
                  Profile settings and configuration options will be displayed here.
                </p>
              </div>
            </div>
          ) : activeTab === 'skills' ? (
            // Skills tab content
            <div className="max-w-6xl">
              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-6">My Skills</h2>
                
                {/* Responsive two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Conditional Content */}
                  <div>
                    {selectedSkills.length === 0 ? (
                      // Show Getting Started when no skills
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Getting Started</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          Start by adding your core competencies and areas of specialization. 
                          You can organize skills by category, add proficiency levels, and include 
                          relevant certifications or achievements.
                        </p>
                      </div>
                    ) : (
                      // Show Your Skills when skills exist
                      <div>
                        <div className="flex flex-wrap gap-2">
                          {selectedSkills.map((skill, index) => (
                                                        <div
                              key={index}
                              className={`flex items-center gap-2 border rounded-full px-3 py-2 transition-colors group cursor-pointer ${
                                selectedSkillDetail === skill
                                  ? 'bg-[#00DF71] border-[#00DF71]'
                                  : 'bg-[#2a2e32] border-[#454446] hover:bg-[#3a3e42]'
                              }`}
                              onClick={() => handleSkillSelect(skill)}
                            >
                              <span className={`text-sm whitespace-nowrap ${
                                selectedSkillDetail === skill
                                  ? 'text-[#212327] font-medium'
                                  : 'text-gray-300 group-hover:text-white group-hover:underline'
                              }`}>
                                {skill}
                              </span>
                              <button
                                className={`flex items-center justify-center w-5 h-5 border rounded-full transition-colors text-xs font-bold ${
                                  selectedSkillDetail === skill
                                    ? 'border-[#212327] text-[#212327] hover:bg-[#212327] hover:text-[#00DF71]'
                                    : 'border-[#454446] text-white hover:border-[#00DF71] hover:text-[#00DF71]'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveSkill(skill);
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                                    {/* Right Column - Conditional Content */}
                  <div className="h-full">
                    {selectedSkillDetail ? (
                      /* Skill Detail Container */
                      <div className="bg-[#1e2327] rounded-lg border border-[#454446] h-full p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-xl font-semibold text-white">{selectedSkillDetail}</h4>
                          <button
                            onClick={handleCloseSkillDetail}
                            className="flex items-center justify-center w-8 h-8 border border-[#454446] hover:border-[#00DF71] text-white hover:text-[#00DF71] rounded-full transition-colors text-lg font-bold"
                          >
                            ×
                          </button>
                        </div>
                        
                        {/* Skill Detail Content */}
                        <div className="space-y-6">
                          <div className="bg-[#212327] rounded-lg border border-[#454446] p-4">
                            <h5 className="text-md font-semibold text-white mb-3">Overview</h5>
                            
                            <div className="space-y-3">
                              <textarea
                                id="overviewTextarea"
                                placeholder="Enter your overview here..."
                                maxLength={160}
                                rows={4}
                                className="w-full bg-[#1A1D21] border border-[#454446] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors resize-none"
                                value={overviewText}
                                onChange={(e) => setOverviewText(e.target.value)}
                              />
                              
                              <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-400">
                                  <span className={overviewText.length > 160 ? 'text-red-400 font-semibold' : ''}>
                                    {overviewText.length > 160 ? `${overviewText.length - 160} over limit` : `${160 - overviewText.length} characters remaining`}
                                  </span>
                                </div>
                                
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleCancelOverview}
                                    className="px-4 py-2 text-sm border border-[#454446] text-gray-300 rounded-lg font-medium hover:border-[#00DF71] hover:text-[#00DF71] transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleSaveOverview}
                                    disabled={overviewText.length > 160 || overviewText === originalOverviewText}
                                    className="px-4 py-2 text-sm bg-[#00DF71] text-[#212327] rounded-lg font-medium hover:bg-[#0AFB84] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-[#212327] rounded-lg border border-[#454446] p-4">
                            <h5 className="text-md font-semibold text-white mb-3">Proficiency Level</h5>
                            <div className="flex gap-2">
                              {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level, index) => (
                                <button
                                  key={index}
                                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                                    selectedProficiencyLevel === level
                                      ? 'bg-[#00DF71] border-[#00DF71] text-[#212327] font-medium'
                                      : 'bg-[#2a2e32] border-[#454446] text-gray-300 hover:border-[#00DF71] hover:text-[#00DF71]'
                                  }`}
                                  onClick={() => handleProficiencyLevelSelect(level)}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-[#212327] rounded-lg border border-[#454446] p-4">
                            <h5 className="text-md font-semibold text-white mb-3">Skill Growth</h5>
                            <p className="text-gray-300 text-sm mb-4">
                              How motivated are you to build this skill
                            </p>
                            <div className="flex gap-2">
                              {['Low', 'Medium', 'High', 'Very High'].map((motivation, index) => (
                                <button
                                  key={index}
                                  className="px-3 py-2 text-sm border border-[#454446] rounded-lg text-gray-300 hover:border-[#00DF71] hover:text-[#00DF71] transition-colors"
                                >
                                  {motivation}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Search and Popular Skills */
                      <div className="space-y-6">
                        {/* Search Section */}
                        <div className="bg-[#1e2327] rounded-lg border border-[#454446] p-4">
                          <h4 className="text-md font-semibold text-white mb-3">Search Skills</h4>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search for skills..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchQuery.trim()) {
                                  const trimmedSkill = searchQuery.trim();
                                  if (!selectedSkills.includes(trimmedSkill)) {
                                    handleAddSkill(trimmedSkill);
                                    setSearchQuery('');
                                    setShowSearchDropdown(false);
                                  }
                                }
                              }}
                              className="w-full bg-[#212327] border border-[#454446] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors"
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
                                  {['JavaScript', 'React', 'Python', 'Data Analysis', 'Project Management', 'Leadership', 'Communication', 'UI/UX Design']
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
                                  {searchQuery && ['JavaScript', 'React', 'Python', 'Data Analysis', 'Project Management', 'Leadership', 'Communication', 'UI/UX Design']
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
                        <div className="bg-[#1e2327] rounded-lg border border-[#454446] p-6">
                          <h4 className="text-md font-semibold text-white mb-4">Popular Skills</h4>
                          <div className="flex flex-wrap gap-3">
                            {['JavaScript', 'React', 'Python', 'Data Analysis', 'Project Management', 'Leadership', 'Communication', 'UI/UX Design', 'Machine Learning', 'Product Management', 'Customer Success', 'Sales', 'Marketing', 'Design Thinking', 'Agile', 'Scrum', 'Data Science', 'Cloud Computing', 'DevOps', 'Cybersecurity'].slice(0, 32).map((skill, index) => (
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
                          <div className="h-[31px]"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Default content
            <div className="max-w-4xl">
              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Profile Tab</h2>
                <p className="text-gray-300">
                  This tab is under development.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}