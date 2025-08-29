"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SideNavigation, { useSideNavMargin } from "@/components/SideNavigation";
import ProfileViewTitleTab from "@/components/ProfileViewTitleTab";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

// Helper function to proxy image requests to avoid CORS issues
const getProxiedUrlForPreview = (imageUrl: string): string => {
  if (!imageUrl) return "";
  // Use the proxy API route to avoid CORS issues with Firebase Storage
  const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
  return proxiedUrl;
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("summary");
  const { user, logout, isLoggingOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();
  const sideNavMargin = useSideNavMargin();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [recentProps, setRecentProps] = useState<any[]>([]);
  const [recentTemplates, setRecentTemplates] = useState<any[]>([]);
  const [isLoadingRecentProps, setIsLoadingRecentProps] = useState(true);
  const [isLoadingRecentTemplates, setIsLoadingRecentTemplates] =
    useState(true);
  const [carouselPosition, setCarouselPosition] = useState(0);
  const [templatesCarouselPosition, setTemplatesCarouselPosition] = useState(0);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [overviewText, setOverviewText] = useState("");
  const [originalOverviewText, setOriginalOverviewText] = useState("");
  const [selectedProficiencyLevel, setSelectedProficiencyLevel] =
    useState<string>("");
  const [selectedMotivationLevel, setSelectedMotivationLevel] =
    useState<string>("");
  const [teamProfile, setTeamProfile] = useState<any>(null);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    if (!user?.uid) return;

    setIsLoadingProfile(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile(data);
        setOverviewText(data.overview || "");
        setOriginalOverviewText(data.overview || "");
        setSelectedProficiencyLevel(data.proficiencyLevel || "");
        setSelectedMotivationLevel(data.motivationLevel || "");
        console.log("User profile loaded:", data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
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
      console.error("Error fetching recent props:", error);
      setRecentProps([]);
      setIsLoadingRecentProps(false);
    }
  };

  // Fetch recent templates data
  const fetchRecentTemplates = async () => {
    if (!user?.uid) return;

    setIsLoadingRecentTemplates(true);
    try {
      const templatesRef = collection(db, "users", user.uid, "template");
      const q = query(templatesRef, orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setRecentTemplates(items);
        setIsLoadingRecentTemplates(false);
      });
      return () => unsub();
    } catch (error) {
      console.error("Error fetching recent templates:", error);
      setRecentTemplates([]);
      setIsLoadingRecentTemplates(false);
    }
  };

  // Logout functions
  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const confirmLogout = async () => {
    try {
      closeLogoutModal();
      await logout();
      router.push("/signin");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred during logout. Please try again.");
    }
  };

  // Fetch company information from connectedCompanies collection
  const fetchCompanyInfo = async () => {
    if (!user?.uid) return;

    console.log("🚀 fetchCompanyInfo called for user:", user.uid);
    setIsLoadingCompany(true);

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
      setIsLoadingCompany(false);
      console.log("🏁 fetchCompanyInfo completed");
    }
  };

  // ✅ EFFICIENT: Fetch team profile data from top-level connectedCompanies collection
  const fetchTeamProfile = async () => {
    if (!user?.uid) return;

    setIsLoadingTeam(true);
    try {
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
          // Fetch the actual company details from the companies collection
          try {
            console.log(
              "Company reference found:",
              (activeCompanyConnection as any).companyReference
            );

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
            } else if (
              (activeCompanyConnection as any).companyReference &&
              typeof (activeCompanyConnection as any).companyReference ===
                "object" &&
              "path" in (activeCompanyConnection as any).companyReference
            ) {
              // If it's a Firestore document reference, use it directly
              companyDocRef = (activeCompanyConnection as any).companyReference;
            } else {
              console.log(
                "Invalid companyReference format:",
                (activeCompanyConnection as any).companyReference
              );
              setTeamProfile(activeCompanyConnection); // Fallback to connection data only
              return;
            }

            const companyDoc = await getDoc(companyDocRef);

            if (companyDoc.exists()) {
              const companyDetails = companyDoc.data();
              // Combine connection data with company details
              const fullCompanyProfile = {
                ...(activeCompanyConnection as object),
                ...(companyDetails as object),
              };
              setTeamProfile(fullCompanyProfile);
              console.log("Full company profile loaded:", fullCompanyProfile);
            } else {
              console.log(
                "Company document not found for reference:",
                (activeCompanyConnection as any).companyReference
              );
              setTeamProfile(activeCompanyConnection); // Fallback to connection data only
            }
          } catch (companyError) {
            console.error("Error fetching company details:", companyError);
            setTeamProfile(activeCompanyConnection); // Fallback to connection data only
          }
        } else {
          console.log(
            "No active and verified company connections found, or missing companyReference"
          );
          console.log("activeCompanyConnection:", activeCompanyConnection);
          if (activeCompanyConnection) {
            console.log(
              "companyReference type:",
              typeof (activeCompanyConnection as any).companyReference
            );
            console.log(
              "companyReference value:",
              (activeCompanyConnection as any).companyReference
            );
          }
          setTeamProfile(null);
        }
      } else {
        console.log("No connected companies found for user");
        setTeamProfile(null);
      }
    } catch (error) {
      console.error("Error fetching connected companies:", error);
      setTeamProfile(null);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  // Carousel scroll handlers
  const handleCarouselScroll = (direction: "left" | "right") => {
    const itemsPerView = 3; // Assuming 3 items per view
    const maxPosition = Math.max(
      0,
      Math.ceil(recentProps.length / itemsPerView) - 1
    );

    if (direction === "left" && carouselPosition > 0) {
      setCarouselPosition(carouselPosition - 1);
    } else if (direction === "right" && carouselPosition < maxPosition) {
      setCarouselPosition(carouselPosition + 1);
    }
  };

  const handleTemplatesCarouselScroll = (direction: "left" | "right") => {
    const itemsPerView = 3; // Assuming 3 items per view
    const maxPosition = Math.max(
      0,
      Math.ceil(recentTemplates.length / itemsPerView) - 1
    );

    if (direction === "left" && templatesCarouselPosition > 0) {
      setTemplatesCarouselPosition(templatesCarouselPosition - 1);
    } else if (
      direction === "right" &&
      templatesCarouselPosition < maxPosition
    ) {
      setTemplatesCarouselPosition(templatesCarouselPosition + 1);
    }
  };

  const handleSaveOverview = async () => {
    if (!user?.uid) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { overview: overviewText });
      setOriginalOverviewText(overviewText);
    } catch (error) {
      console.error("Error saving overview:", error);
      alert("Failed to save overview.");
    }
  };

  const handleCancelOverview = () => {
    setOverviewText(originalOverviewText);
  };

  const handleProficiencyLevelSelect = async (level: string) => {
    if (!user?.uid) return;

    let newLevel = "";
    if (selectedProficiencyLevel === level) {
      // If clicking the same level, deselect it
      newLevel = "";
    } else {
      // Select the new level (automatically deselects the previous one)
      newLevel = level;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { proficiencyLevel: newLevel });
      setSelectedProficiencyLevel(newLevel);
    } catch (error) {
      console.error("Error saving proficiency level:", error);
      alert("Failed to save proficiency level.");
    }
  };

  const handleMotivationLevelSelect = async (motivation: string) => {
    if (!user?.uid) return;

    let newMotivation = "";
    if (selectedMotivationLevel === motivation) {
      // If clicking the same motivation, deselect it
      newMotivation = "";
    } else {
      // Select the new motivation (automatically deselects the previous one)
      newMotivation = motivation;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { motivationLevel: newMotivation });
      setSelectedMotivationLevel(newMotivation);
    } catch (error) {
      console.error("Error saving motivation level:", error);
      alert("Failed to save motivation level.");
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

  // Fetch team data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      fetchTeamProfile();
    }
  }, [userProfile]);

  // Fetch company information from Firebase
  useEffect(() => {
    if (user?.uid) {
      console.log("🔄 useEffect triggered for company info, user:", user.uid);
      fetchCompanyInfo();
    }
  }, [user?.uid]);

  console.log(
    "Profile Recent Props Data:",
    recentProps.map((prop) => ({
      id: prop.id,
      propsTitle: prop.propsTitle,
      hasPreviewImage: !!prop.previewImageBase64,
      achievement: prop.achievement,
      createdAt: prop.createdAt,
    }))
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1B1D21" }}>
      <SideNavigation />

      <div className={`${sideNavMargin} h-full flex flex-col`}>
        {/* Fixed Header Container */}
        <div className="flex-shrink-0 z-20">
          {/* ViewTitle Container */}
          <div
            className="w-full bg-[#1e2327] flex items-center justify-between h-16"
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
              Profile
            </div>

            {/* Logout Button */}
            <button
              onClick={openLogoutModal}
              disabled={isLoggingOut}
              className="px-4 py-2 text-sm font-medium transition-colors bg-gray-600 text-white rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? "Signing out..." : "Logout"}
            </button>
          </div>

          {/* ProfileViewTitleTab Component */}
          <ProfileViewTitleTab
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Scrollable Content Area */}
        <div
          className="flex-1 overflow-y-auto p-4 md:p-8"
          style={{ height: "calc(100vh - 64px - 48px - 48px)" }}
        >
          {activeTab === "summary" ? (
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
                            target.nextElementSibling?.classList.remove(
                              "hidden"
                            );
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

                {/* Company Section */}
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-2">
                    Company
                  </h3>
                  {isLoadingCompany ? (
                    <div className="text-gray-400 text-sm">
                      Loading company information...
                    </div>
                  ) : companyInfo ? (
                    <div className="flex items-center gap-3">
                      {companyInfo.logoUrl && (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#454446]">
                          <img
                            src={companyInfo.logoUrl}
                            alt="Company Logo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-[#00DF71] font-medium">
                          {companyInfo.companyName ||
                            companyInfo.name ||
                            companyInfo.company ||
                            companyInfo.title ||
                            "Company Member"}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {companyInfo.website ? (
                            <a
                              href={companyInfo.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-[#00DF71] transition-colors"
                            >
                              {companyInfo.website}
                            </a>
                          ) : (
                            "No website set"
                          )}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Active:{" "}
                          <span className="text-[#00DF71]">
                            {companyInfo.active ? "Yes" : "No"}
                          </span>{" "}
                          • Verified:{" "}
                          <span
                            className={
                              companyInfo.verified
                                ? "text-[#00DF71]"
                                : "text-yellow-400"
                            }
                          >
                            {companyInfo.verified ? "Yes" : "No"}
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      No company information available
                    </div>
                  )}
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
                    disabled={
                      carouselPosition >=
                      Math.max(0, Math.ceil(recentProps.length / 3) - 1)
                    }
                    className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#1e2327] border border-[#454446] rounded-full p-2 transition-colors ${
                      carouselPosition >=
                      Math.max(0, Math.ceil(recentProps.length / 3) - 1)
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
                    className="flex gap-4 overflow-hidden px-8 carousel-container"
                    style={{ paddingLeft: "44px" }}
                  >
                    <div
                      className="flex gap-4 transition-transform duration-300 ease-in-out"
                      style={{
                        transform: `translateX(-${carouselPosition * 100}%)`,
                      }}
                    >
                      {isLoadingRecentProps && (
                        <div className="text-gray-400 text-sm">Loading...</div>
                      )}
                      {!isLoadingRecentProps && recentProps.length === 0 && (
                        <div className="text-gray-400 text-sm">
                          No props yet
                        </div>
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
                            {/* White background fill */}
                            <div
                              className="absolute inset-0 z-5 bg-white"
                              style={{ borderRadius: "4px" }}
                            />

                            {/* Use the saved preview image if available, otherwise reconstruct from template data */}
                            {prop.previewImageBase64 ? (
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
                            ) : prop.achievement?.backgroundImage ||
                              prop.achievement?.props ? (
                              /* Fallback: Reconstruct from template data like in preview */
                              <>
                                {/* Background layer (props background 600x400) */}
                                <div
                                  className="absolute inset-0 z-10 overflow-hidden"
                                  style={{ borderRadius: "4px" }}
                                >
                                  <img
                                    src={getProxiedUrlForPreview(
                                      prop.achievement?.backgroundImage || ""
                                    )}
                                    alt={prop.propsTitle || ""}
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
                                  src={getProxiedUrlForPreview(
                                    prop.achievement?.props || ""
                                  )}
                                  alt={prop.propsTitle || ""}
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
                                    height: "35px",
                                    borderRadius: "4px 4px 0 0",
                                  }}
                                >
                                  <div
                                    className="absolute flex items-center gap-1 px-2 justify-between"
                                    style={{
                                      height: "60%",
                                      width: "100%",
                                      left: 0,
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                    }}
                                  >
                                    {prop.achievement?.logoImage ? (
                                      <img
                                        src={getProxiedUrlForPreview(
                                          prop.achievement.logoImage
                                        )}
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
                                      {prop.propsTitle || ""}
                                    </div>
                                  </div>
                                </div>
                                {/* Message overlay - positioned like preview (y=92) */}
                                {(prop.achievement?.fromName ||
                                  prop.achievement?.fromMessage ||
                                  prop.achievement?.fromDate) && (
                                  <div className="absolute top-10 left-2 z-30">
                                    <div className="bg-gradient-to-r from-[#ADAFBE] via-[#4F7295] to-[#ADAFBE] bg-opacity-80 text-white text-[0.5rem] px-3 py-2 rounded w-[80%]">
                                      {/* From name and date on same line with flex justify-between */}
                                      {(prop.achievement?.fromName ||
                                        prop.achievement?.fromDate) && (
                                        <div className="flex justify-between items-center mb-1">
                                          {prop.achievement?.fromName && (
                                            <div className="font-medium">
                                              From: {prop.achievement.fromName}
                                            </div>
                                          )}
                                          {prop.achievement?.fromDate && (
                                            <div>
                                              {(() => {
                                                const [year, month, day] =
                                                  prop.achievement.fromDate.split(
                                                    "-"
                                                  );
                                                return `${month}/${day}/${year.slice(
                                                  2
                                                )}`;
                                              })()}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      {prop.achievement?.fromMessage && (
                                        <div className="mt-1">
                                          {prop.achievement.fromMessage}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              /* Fallback: Show placeholder when no images available */
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <div className="text-gray-500 text-sm text-center">
                                  <div>No Preview Available</div>
                                  <div className="text-xs mt-1">
                                    {prop.propsTitle || "Recent Prop"}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
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
                    disabled={
                      templatesCarouselPosition >=
                      Math.max(0, Math.ceil(recentTemplates.length / 3) - 1)
                    }
                    className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#1e2327] border border-[#454446] rounded-full p-2 transition-colors ${
                      templatesCarouselPosition >=
                      Math.max(0, Math.ceil(recentTemplates.length / 3) - 1)
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
                    className="flex gap-4 overflow-hidden px-8 templates-carousel-container"
                    style={{ paddingLeft: "44px" }}
                  >
                    <div
                      className="flex gap-4 transition-transform duration-300 ease-in-out"
                      style={{
                        transform: `translateX(-${
                          templatesCarouselPosition * 100
                        }%)`,
                      }}
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
                            <img
                              src={t.backgroundUrl || "/liquid_death_props.png"}
                              alt={t.company || "Recent Template"}
                              className="object-cover w-full h-full"
                              style={{
                                borderRadius: "4px",
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "settings" ? (
            // Settings tab content
            <div className="max-w-4xl">
              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Profile Settings
                </h2>
                <p className="text-gray-300">
                  Profile settings and configuration options will be displayed
                  here.
                </p>
              </div>
            </div>
          ) : (
            // Default content
            <div className="max-w-4xl">
              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Profile Tab
                </h2>
                <p className="text-gray-300">This tab is under development.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#212327] rounded-lg p-6 max-w-md w-full mx-4 border border-[#454446]">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">
                Confirm Logout
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to log out?
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
                  className="px-4 py-2 text-sm font-medium text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ backgroundColor: "#ED6568" }}
                >
                  {isLoggingOut ? "Signing out..." : "Logout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
