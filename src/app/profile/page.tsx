"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SideNavigation, { useSideNavMargin } from '@/components/SideNavigation';
import ProfileViewTitleTab from '@/components/ProfileViewTitleTab';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
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
          ) : activeTab === 'preferences' ? (
            // Preferences tab content
            <div className="max-w-4xl">
              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">User Preferences</h2>
                <p className="text-gray-300">
                  User preferences and customization options will be displayed here.
                </p>
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