"use client";

import { useAuth } from "@/contexts/AuthContext";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SideNavigation, { useSideNavMargin } from "@/components/SideNavigation";
import { useNavigation } from "@/contexts/NavigationContext";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
} from "firebase/firestore";

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
  const [isLoadingRecentProps, setIsLoadingRecentProps] =
    useState<boolean>(true);
  const [recentTemplates, setRecentTemplates] = useState<any[]>([]);
  const [isLoadingRecentTemplates, setIsLoadingRecentTemplates] =
    useState<boolean>(true);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [showCompanyDebugModal, setShowCompanyDebugModal] = useState(false);
  const [debugCompanyData, setDebugCompanyData] = useState<any>(null);

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

  // Fetch company information from connectedCompanies collection
  const fetchCompanyInfo = async () => {
    if (!user?.uid) return;

    console.log("🚀 fetchCompanyInfo called for user:", user.uid);

    try {
      console.log("🔍 Starting fetchCompanyInfo for user:", user.uid);

      // ✅ EFFICIENT: Query with filters to get only the user's active and verified company connection
      const userConnectionsQuery = query(
        collection(db, "connectedCompanies"),
        where("userRef", "==", doc(db, "users", user.uid)),
        where("active", "==", true),
        where("verified", "==", true)
      );

      console.log(
        "📁 Querying with filters: userRef, active=true, verified=true"
      );
      const userConnectionsSnapshot = await getDocs(userConnectionsQuery);
      console.log(
        "📊 User connections snapshot size:",
        userConnectionsSnapshot.size
      );

      // Store debug data for modal
      const allConnectedCompanies = userConnectionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (!userConnectionsSnapshot.empty) {
        console.log("✅ Found active and verified company connection for user");

        // Get the first (and should be only) connection
        const userConnection = userConnectionsSnapshot.docs[0];
        const companyData = userConnection.data();

        console.log("🔗 Company Connection Data:");
        console.log("  📄 Document ID:", userConnection.id);
        console.log("  🔍 Key Fields:");
        console.log("    - active:", companyData.active);
        console.log("    - verified:", companyData.verified);
        console.log("    - companyReference:", companyData.companyReference);
        console.log("    - userRef:", companyData.userRef);
        console.log("    - isAdmin:", companyData.isAdmin || false);
        console.log("    - role:", companyData.role || "Employee");

        const activeCompanyConnection = {
          id: userConnection.id,
          ...(companyData as object),
        };
        console.log(
          "🎯 Active company connection found:",
          JSON.stringify(activeCompanyConnection, null, 2)
        );

        if (
          activeCompanyConnection &&
          (activeCompanyConnection as any).companyReference
        ) {
          console.log(
            "\n🏢 Company reference found, fetching company details..."
          );

          // Fetch the actual company details from the companies collection
          try {
            // Handle both string IDs and Firestore document references
            let companyDocRef: any;
            if (
              typeof (activeCompanyConnection as any).companyReference ===
              "string"
            ) {
              // If it's a string ID
              companyDocRef = doc(
                db,
                "companies",
                (activeCompanyConnection as any).companyReference
              );
              console.log(
                "📁 Using string ID, created doc ref:",
                `companies/${(activeCompanyConnection as any).companyReference}`
              );
            } else if (
              (activeCompanyConnection as any).companyReference &&
              typeof (activeCompanyConnection as any).companyReference ===
                "object" &&
              "path" in (activeCompanyConnection as any).companyReference
            ) {
              // If it's a Firestore document reference, use it directly
              companyDocRef = (activeCompanyConnection as any).companyReference;
              console.log(
                "📁 Using Firestore doc reference, path:",
                (activeCompanyConnection as any).companyReference.path
              );
            } else {
              console.log(
                "❌ Invalid companyReference format:",
                (activeCompanyConnection as any).companyReference
              );
              setCompanyInfo(activeCompanyConnection); // Fallback to connection data only
              return;
            }

            console.log("📖 Fetching company document...");
            const companyDoc = await getDoc(companyDocRef);

            if (companyDoc.exists()) {
              const companyDetails = companyDoc.data();
              console.log("✅ Company document found!");
              console.log(
                "📋 Company details:",
                JSON.stringify(companyDetails, null, 2)
              );

              // Combine connection data with company details
              const fullCompanyInfo = {
                ...activeCompanyConnection,
                ...(companyDetails as object),
              };
              console.log(
                "🔗 Combined full company info:",
                JSON.stringify(fullCompanyInfo, null, 2)
              );

              setCompanyInfo(fullCompanyInfo);
              console.log("✅ Company info state updated successfully");
              console.log("📊 New companyInfo state:", fullCompanyInfo);
              console.log(
                "🔍 Company name from fullCompanyInfo:",
                (fullCompanyInfo as any).companyName
              );

              // Store debug data for modal
              setDebugCompanyData({
                allConnectedCompanies,
                activeCompanyConnection,
                companyInfo: fullCompanyInfo,
                userUid: user.uid,
                timestamp: new Date().toISOString(),
              });
            } else {
              console.log(
                "❌ Company document not found for reference:",
                (activeCompanyConnection as any).companyReference
              );
              setCompanyInfo(activeCompanyConnection); // Fallback to connection data only
            }
          } catch (companyError) {
            console.error("❌ Error fetching company details:", companyError);
            setCompanyInfo(activeCompanyConnection); // Fallback to connection data only
          }
        } else {
          console.log(
            "\n❌ No active and verified company connections found, or missing companyReference"
          );
          setCompanyInfo(null);
          console.log("📊 Company info set to null");
        }
      } else {
        console.log("❌ No connected companies found for user");
        setCompanyInfo(null);
      }
    } catch (error) {
      console.error("❌ Error fetching connected companies:", error);
      setCompanyInfo(null);
    } finally {
      console.log("🏁 fetchCompanyInfo completed");
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

  // Fetch company information from Firebase
  useEffect(() => {
    if (user?.uid) {
      console.log("🔄 useEffect triggered for company info, user:", user.uid);
      fetchCompanyInfo();
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
    const templatesRef = collection(db, "users", user.uid, "template");
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
                  {/* Company Information */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-xs uppercase tracking-wide">
                        Company
                      </span>
                      <button
                        onClick={() => setShowCompanyDebugModal(true)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Debug Data
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm md:text-base">
                      {companyInfo?.companyName ||
                        companyInfo?.name ||
                        companyInfo?.company ||
                        companyInfo?.title ||
                        "No company information available"}
                    </p>
                    {/* Debug Info */}
                    <p className="text-xs text-gray-500 mt-1">
                      Debug: companyInfo ={" "}
                      {JSON.stringify(companyInfo, null, 2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      companyInfo type: {typeof companyInfo},
                      companyInfo?.companyName: {companyInfo?.companyName},
                      companyInfo?.companyName type:{" "}
                      {typeof companyInfo?.companyName}
                    </p>
                  </div>
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
                <Link
                  href="/props"
                  className="px-3 py-1 text-xs bg-[#00DF71] text-[#212327] rounded-full hover:bg-[#0AFB84] transition-colors"
                >
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
                <div
                  className="flex gap-4 overflow-x-auto scrollbar-hide px-8 carousel-container"
                  style={{ paddingLeft: "44px" }}
                >
                  {isLoadingRecentProps && (
                    <div className="text-gray-400 text-sm">Loading...</div>
                  )}
                  {!isLoadingRecentProps && recentProps.length === 0 && (
                    <div className="text-gray-400 text-sm">No props yet</div>
                  )}
                  {recentProps.map((prop) => (
                    <Link
                      key={prop.id}
                      href={`/props/${prop.id}`}
                      className="rounded overflow-hidden border border-[#454446] hover:border-[#00DF71] transition-colors flex-shrink-0 w-full md:w-[calc(33.333%-8px)]"
                      style={{ borderRadius: "4px" }}
                    >
                      <div
                        className="relative"
                        style={{ aspectRatio: "5 / 4" }}
                      >
                        {/* Use the saved Cloudinary preview image if available, otherwise fallback to base64 */}
                        {prop.previewImageUrl ? (
                          <img
                            src={prop.previewImageUrl}
                            alt={prop.propsTitle || "Recent Prop"}
                            className="object-contain relative z-20 w-full h-full"
                            style={{
                              borderRadius: "4px",
                              width: "100%",
                              height: "100%",
                              objectPosition: "bottom",
                            }}
                          />
                        ) : prop.previewImageBase64 ? (
                          <img
                            src={prop.previewImageBase64}
                            alt={prop.propsTitle || "Recent Prop"}
                            className="object-contain relative z-20 w-full h-full"
                            style={{
                              borderRadius: "4px",
                              width: "100%",
                              height: "100%",
                              objectPosition: "bottom",
                            }}
                          />
                        ) : (
                          /* Fallback: Try to reconstruct from template data */
                          <div className="w-full h-full relative">
                            {/* Background layer */}
                            {prop.achievement?.backgroundImage && (
                              <img
                                src={prop.achievement.backgroundImage}
                                alt="Background"
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{ borderRadius: "4px" }}
                              />
                            )}
                            {/* Props/illustration layer */}
                            {prop.achievement?.props && (
                              <img
                                src={prop.achievement.props}
                                alt="Props"
                                className="absolute inset-0 w-full h-full object-contain"
                                style={{ borderRadius: "4px" }}
                              />
                            )}
                            {/* Logo overlay in top-left */}
                            {prop.achievement?.logoImage && (
                              <div className="absolute top-2 left-2 z-30">
                                <img
                                  src={prop.achievement.logoImage}
                                  alt="Logo"
                                  className="h-8 w-auto object-contain"
                                />
                              </div>
                            )}
                            {/* Title overlay in top-right */}
                            {prop.achievement?.propsTitle && (
                              <div className="absolute top-2 right-2 z-30">
                                <span className="text-black text-xs font-medium bg-white px-2 py-1 rounded">
                                  {prop.achievement.propsTitle}
                                </span>
                              </div>
                            )}
                            {/* Message overlay */}
                            {(prop.achievement?.fromName ||
                              prop.achievement?.fromMessage) && (
                              <div className="absolute bottom-2 left-2 z-30">
                                <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                  {prop.achievement?.fromName &&
                                    `From: ${prop.achievement.fromName}`}
                                  {prop.achievement?.fromMessage && (
                                    <div className="mt-1">
                                      {prop.achievement.fromMessage}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
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
                <Link
                  href="/templates"
                  className="px-3 py-1 text-xs bg-[#00DF71] text-[#212327] rounded-full hover:bg-[#0AFB84] transition-colors"
                >
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
                <div
                  className="flex gap-4 overflow-x-auto scrollbar-hide px-8 templates-carousel-container"
                  style={{ paddingLeft: "44px" }}
                >
                  {isLoadingRecentTemplates && (
                    <div className="text-gray-400 text-sm">Loading...</div>
                  )}
                  {!isLoadingRecentTemplates &&
                    recentTemplates.length === 0 && (
                      <div className="text-gray-400 text-sm">
                        No templates yet
                      </div>
                    )}
                  {recentTemplates.map((t) => (
                    <Link
                      key={t.id}
                      href={`/templates/${t.id}`}
                      className="rounded overflow-hidden border border-[#454446] hover:border-[#00DF71] transition-colors flex-shrink-0 w-full md:w-[calc(33.333%-8px)]"
                      style={{ borderRadius: "4px" }}
                    >
                      <div
                        className="relative"
                        style={{ aspectRatio: "5 / 4" }}
                      >
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
                            style={{
                              borderRadius: "4px",
                              objectFit: "cover",
                              objectPosition: "center",
                            }}
                          />
                        </div>
                        {/* Foreground props image */}
                        <img
                          src={t.basePropsUrl || ""}
                          alt={t.company || ""}
                          className="object-contain relative z-20 w-full h-full"
                          style={{
                            borderRadius: "4px",
                            width: "100%",
                            height: "100%",
                            objectPosition: "bottom",
                          }}
                        />
                        {/* White header with logo/company (scaled proportionally) */}
                        <div
                          className="absolute top-0 left-0 right-0 bg-white border-b-2 border-gray-200 z-30"
                          style={{
                            height: "33px",
                            borderRadius: "4px 4px 0 0",
                          }}
                        >
                          <div
                            className="absolute flex items-center gap-1 px-2"
                            style={{
                              height: "60%",
                              width: "100%",
                              left: 0,
                              top: "50%",
                              transform: "translateY(-50%)",
                            }}
                          >
                            {t.logoUrl ? (
                              <img
                                src={t.logoUrl}
                                alt="Logo"
                                className="object-contain relative z-20"
                                style={{
                                  borderRadius: "4px",
                                  height: "17px",
                                  width: "auto",
                                  objectPosition: "left",
                                }}
                              />
                            ) : null}
                            <div
                              className="text-black font-medium truncate text-xs"
                              style={{ maxWidth: "70%" }}
                            >
                              {t.company || ""}
                            </div>
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
                Are you sure you want to sign out? You will need to sign in
                again to access your account.
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

      {/* Company Debug Modal */}
      {showCompanyDebugModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#212327] rounded-lg p-6 max-w-4xl w-full mx-4 border border-[#454446] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Company Debug Information
              </h3>
              <button
                onClick={() => setShowCompanyDebugModal(false)}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
            </div>

            {debugCompanyData ? (
              <div className="space-y-4">
                {/* User Info */}
                <div className="bg-[#1e2327] rounded-lg p-4 border border-[#454446]">
                  <h4 className="text-md font-semibold text-white mb-2">
                    User Information
                  </h4>
                  <p className="text-gray-300 text-sm">
                    User UID: {debugCompanyData.userUid}
                  </p>
                  <p className="text-gray-300 text-sm">
                    Timestamp: {debugCompanyData.timestamp}
                  </p>
                </div>

                {/* All Connected Companies */}
                <div className="bg-[#1e2327] rounded-lg p-4 border border-[#454446]">
                  <h4 className="text-md font-semibold text-white mb-2">
                    All Connected Companies (
                    {debugCompanyData.allConnectedCompanies?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {debugCompanyData.allConnectedCompanies?.map(
                      (company: any, index: number) => (
                        <div
                          key={index}
                          className="bg-[#2a2e32] rounded p-3 border border-[#454446]"
                        >
                          <p className="text-white text-sm font-medium">
                            Document ID: {company.id}
                          </p>
                          <pre className="text-xs text-gray-300 mt-2 overflow-x-auto">
                            {JSON.stringify(company, null, 2)}
                          </pre>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Active Company Connection */}
                <div className="bg-[#1e2327] rounded-lg p-4 border border-[#454446]">
                  <h4 className="text-md font-semibold text-white mb-2">
                    Active Company Connection
                  </h4>
                  {debugCompanyData.activeCompanyConnection ? (
                    <pre className="text-xs text-gray-300 overflow-x-auto">
                      {JSON.stringify(
                        debugCompanyData.activeCompanyConnection,
                        null,
                        2
                      )}
                    </pre>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      No active company connection found
                    </p>
                  )}
                </div>

                {/* Final Company Info */}
                <div className="bg-[#1e2327] rounded-lg p-4 border border-[#454446]">
                  <h4 className="text-md font-semibold text-white mb-2">
                    Final Company Info (State)
                  </h4>
                  {debugCompanyData.companyInfo ? (
                    <pre className="text-xs text-gray-300 overflow-x-auto">
                      {JSON.stringify(debugCompanyData.companyInfo, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      No company info in state
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p>No debug data available. Try refreshing the page.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
