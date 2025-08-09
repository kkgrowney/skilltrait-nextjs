"use client";

import { useAuth } from "@/contexts/AuthContext";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SideNavigation, { useSideNavMargin } from "@/components/SideNavigation";
import { useNavigation } from "@/contexts/NavigationContext";

import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";



export default function Home() {
  const { user, loading, logout, isLoggingOut } = useAuth();
  const router = useRouter();
  const sideNavMargin = useSideNavMargin();
  const { currentView, setCurrentView } = useNavigation();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [carouselPosition, setCarouselPosition] = useState(0);
  const [templatesCarouselPosition, setTemplatesCarouselPosition] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [recentProps, setRecentProps] = useState<any[]>([]);
  const [isLoadingRecentProps, setIsLoadingRecentProps] = useState<boolean>(true);
  const [recentTemplates, setRecentTemplates] = useState<any[]>([]);
  const [isLoadingRecentTemplates, setIsLoadingRecentTemplates] = useState<boolean>(true);



  // Fetch user profile data from Firebase
  const fetchUserProfile = async () => {
    if (!user?.uid) return;

    setIsLoadingProfile(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile(data);
        console.log("User profile loaded:", data);
        console.log("Photo URL fields:", {
          photo_url: data.photo_url,
          photoURL: data.photoURL,
          photo: data.photo,
          profilePicture: data.profilePicture,
        });
      } else {
        console.log("No user profile found");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Set current view to home when component mounts
  useEffect(() => {
    setCurrentView("home");
  }, [setCurrentView]);

  // Fetch user profile data from Firebase
  useEffect(() => {
    if (user?.uid) {
      fetchUserProfile();
    }
  }, [user?.uid]);

  // Subscribe to user's recent props
  useEffect(() => {
    if (!user?.uid) return;
    setIsLoadingRecentProps(true);
    const propsRef = collection(db, "users", user.uid, "props");
    const q = query(propsRef, orderBy("createdAt", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({ id: doc.id, ...data });
      });
      setRecentProps(items);
      setIsLoadingRecentProps(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  // Subscribe to user's recent saved template assets
  useEffect(() => {
    if (!user?.uid) return;
    setIsLoadingRecentTemplates(true);
    const templatesRef = collection(db, "users", user.uid, "templates");
    const q = query(templatesRef, orderBy("createdAt", "desc"), limit(12));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({ id: doc.id, ...data });
      });
      setRecentTemplates(items);
      setIsLoadingRecentTemplates(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  // Check if user has completed onboarding
  useEffect(() => {
    if (userProfile && !userProfile.didInitProfile) {
      router.push("/onboarding");
    }
  }, [userProfile, router]);

  // Test logout button functionality
  const testLogoutButton = () => {
    console.log("=== LOGOUT BUTTON TEST ===");
    console.log("1. Testing logout button click...");
    console.log("2. Current user:", user?.email);
    console.log("3. isLoggingOut state:", isLoggingOut);
    console.log("4. logout function available:", !!logout);
    console.log("5. Router available:", !!router);
    console.log("=== END TEST ===");
  };

  const handleSignOut = async () => {
    console.log("=== LOGOUT PROCESS STARTED ===");
    console.log("1. Logout button clicked");
    console.log("2. Current user:", user?.email);
    
    try {
      console.log("3. Calling logout function...");
      const success = await logout();
      console.log("4. Logout result:", success);
      
      if (success) {
        console.log("5. Successfully signed out");
        console.log("6. Redirecting to signin page");
        router.push("/signin");
      } else {
        console.error("5. Failed to sign out");
        alert("Failed to sign out. Please try again.");
      }
    } catch (error) {
      console.error("5. Logout error:", error);
      alert("An error occurred during logout. Please try again.");
    }
    
    console.log("=== LOGOUT PROCESS ENDED ===");
  };

  const openLogoutModal = () => {
    console.log("Opening logout modal");
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    console.log("Closing logout modal");
    setShowLogoutModal(false);
  };

  const confirmLogout = async () => {
    console.log("User confirmed logout");
    closeLogoutModal();
    await handleSignOut();
  };

  const handleCarouselScroll = (direction: "left" | "right") => {
    const container = document.querySelector(".carousel-container");
    if (container) {
      const cardWidth = container.scrollWidth / 4; // 4 cards total
      const currentScroll = container.scrollLeft;

      if (direction === "left") {
        container.scrollTo({
          left: currentScroll - cardWidth,
          behavior: "smooth",
        });
        setCarouselPosition(Math.max(0, carouselPosition - 1));
      } else {
        container.scrollTo({
          left: currentScroll + cardWidth,
          behavior: "smooth",
        });
        setCarouselPosition(Math.min(1, carouselPosition + 1));
      }
    }
  };

  const handleTemplatesCarouselScroll = (direction: "left" | "right") => {
    const container = document.querySelector(".templates-carousel-container");
    if (container) {
      const cardWidth = container.scrollWidth / 4; // 4 cards total
      const currentScroll = container.scrollLeft;

      if (direction === "left") {
        container.scrollTo({
          left: currentScroll - cardWidth,
          behavior: "smooth",
        });
        setTemplatesCarouselPosition(
          Math.max(0, templatesCarouselPosition - 1)
        );
      } else {
        container.scrollTo({
          left: currentScroll + cardWidth,
          behavior: "smooth",
        });
        setTemplatesCarouselPosition(
          Math.min(1, templatesCarouselPosition + 1)
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 mx-auto"></div>
          <p className="mt-2 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle authentication redirect in useEffect to avoid setState during render
  useEffect(() => {
    if (!loading && !user) {
      console.log("Redirecting to signin - no user");
      router.push("/signin");
    }
  }, [user, loading, router]);

  if (!user) {
    console.log("No user, returning null");
    return null;
  }

  // Render Home view (default)
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1A1D21" }}>
      <SideNavigation />

      <div className="md:ml-60 ml-0 md:ml-[66px] h-full flex flex-col">
        {/* ViewTitle Container */}
        <div
          className="w-full bg-[#1e2327] flex items-center justify-between border-b border-[#454446] h-16"
          style={{
            height: "64px !important",
            minHeight: "64px",
            maxHeight: "64px",
            paddingLeft: "32px",
            paddingRight: "32px",
          }}
        >
          {/* Title text */}
          <div className="font-semibold text-[#ffffff] text-[18px] whitespace-nowrap md:ml-0 ml-9 flex items-center">
            Home
          </div>
          
          {/* Logout Button */}
          <button
            onClick={(e) => {
              console.log("Home header logout button clicked");
              testLogoutButton();
              openLogoutModal();
            }}
            disabled={isLoggingOut}
            className="px-4 py-2 text-sm font-medium transition-colors bg-gray-600 text-white rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? "Signing out..." : "Logout"}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
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
                <div className="flex gap-4 overflow-x-auto scrollbar-hide px-8 carousel-container">
                  {isLoadingRecentProps && (
                    <div className="text-gray-400 text-sm">Loading...</div>
                  )}
                  {!isLoadingRecentProps && recentProps.length === 0 && (
                    <div className="text-gray-400 text-sm">No props yet</div>
                  )}
                  {recentProps.map((prop) => (
                    <Link key={prop.id} href={`/props/${prop.id}`} className="bg-[#1e2327] rounded-lg overflow-hidden border border-[#454446] hover:border-[#00DF71] transition-colors flex-shrink-0 w-full md:w-[calc(33.333%-8px)]">
                      <div className="relative">
                        <img
                          src={prop.fullPropImage || "/liquid_death_props.png"}
                          alt={prop.propsTitle || "Recent Prop"}
                          className="w-full object-cover"
                          style={{ aspectRatio: "5/4" }}
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-white font-semibold text-sm truncate" title={prop.propsTitle || "Prop"}>
                            {prop.propsTitle || "Prop"}
                          </h3>
                        </div>
                        <p className="text-gray-400 text-xs">
                          {prop.createdAt?.toDate ? new Date(prop.createdAt.toDate()).toLocaleDateString() : new Date(prop.createdAt).toLocaleDateString()}
                        </p>
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
                <div className="flex gap-4 overflow-x-auto scrollbar-hide px-8 templates-carousel-container">
                  {isLoadingRecentTemplates && (
                    <div className="text-gray-400 text-sm">Loading...</div>
                  )}
                  {!isLoadingRecentTemplates && recentTemplates.length === 0 && (
                    <div className="text-gray-400 text-sm">No templates yet</div>
                  )}
                  {recentTemplates.map((t) => (
                    <Link key={t.id} href={`/templates/${t.id}`} className="bg-[#1e2327] rounded-lg overflow-hidden border border-[#454446] hover:border-[#00DF71] transition-colors flex-shrink-0 w-full md:w-[calc(33.333%-8px)]">
                      <div className="relative" style={{ aspectRatio: "5/4" }}>
                        <img
                          src={t.backgroundUrl || "/liquid_death_props.png"}
                          alt={t.company || "Saved Template"}
                          className="w-full h-full object-cover"
                        />
                        {/* Top bar with logo and company */}
                        <div className="absolute top-0 left-0 right-0 bg-white border-b-2 border-gray-200" style={{ height: "20%", zIndex: 50, borderRadius: "4px 4px 0 0" }}>
                          <div className="absolute flex items-center gap-2 px-3" style={{ height: "60%", width: "100%", left: 0, top: "50%", transform: "translateY(-50%)" }}>
                            {t.logoUrl ? (
                              <img src={t.logoUrl} alt="Logo" className="h-full max-h-full w-auto object-contain" />
                            ) : (
                              <div className="text-xs text-gray-700">No Logo</div>
                            )}
                            <div className="text-black font-medium truncate" style={{ maxWidth: "70%" }}>{t.company || "Template"}</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#212327] rounded-lg p-6 max-w-md w-full mx-4 border border-[#454446]">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">
                Sign Out
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to sign out? You will need to sign in again to access your account.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={closeLogoutModal}
                  className="px-4 py-2 text-sm font-medium transition-colors bg-gray-600 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-2 text-sm font-medium transition-colors bg-red-600 text-white rounded hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
