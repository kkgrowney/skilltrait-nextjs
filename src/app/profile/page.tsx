"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SideNavigation, { useSideNavMargin } from "@/components/SideNavigation";
import ProfileViewTitleTab from "@/components/ProfileViewTitleTab";
import SkillsSection from "@/components/SkillsSection";
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
import {
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  linkWithCredential,
  GoogleAuthProvider,
  deleteUser,
} from "firebase/auth";
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

  // Settings form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Enhanced error handling state
  const [settingsErrors, setSettingsErrors] = useState<{
    [key: string]: string;
  }>({});

  // Validation functions
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password.trim()) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const clearSettingsError = (field: string) => {
    setSettingsErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

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

  // Set password for Google users
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setSettingsErrors({}); // Clear previous errors

    const newErrors: { [key: string]: string } = {};

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // If there are validation errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setSettingsErrors(newErrors);
      return;
    }

    setIsUpdatingPassword(true);

    try {
      if (!user || !user.email) {
        throw new Error("User not authenticated");
      }

      // Create email/password credential and link it to the Google account
      const credential = EmailAuthProvider.credential(user.email, newPassword);
      await linkWithCredential(user, credential);

      setPasswordSuccess(
        "Password set successfully! You can now sign in with email and password."
      );
      setNewPassword("");
      setConfirmPassword("");
      setIsGoogleUser(false); // Update state since user now has password provider
    } catch (error: any) {
      console.error("Password set error:", error);
      if (error.code === "auth/email-already-in-use") {
        setPasswordError(
          "This email is already associated with another account"
        );
      } else if (error.code === "auth/weak-password") {
        setPasswordError("Password is too weak");
      } else {
        setPasswordError(error.message || "Failed to set password");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Password update function for users with existing password
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setSettingsErrors({}); // Clear previous errors

    const newErrors: { [key: string]: string } = {};

    // Validate current password
    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // If there are validation errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setSettingsErrors(newErrors);
      return;
    }

    setIsUpdatingPassword(true);

    try {
      if (!user || !user.email) {
        throw new Error("User not authenticated");
      }

      // Re-authenticate user before updating password
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setPasswordSuccess("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Password update error:", error);
      if (error.code === "auth/wrong-password") {
        setPasswordError("Current password is incorrect");
      } else if (error.code === "auth/weak-password") {
        setPasswordError("Password is too weak");
      } else {
        setPasswordError(error.message || "Failed to update password");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Email update function
  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");
    setSettingsErrors({}); // Clear previous errors

    const newErrors: { [key: string]: string } = {};

    // Validate email
    const emailError = validateEmail(newEmail);
    if (emailError) {
      newErrors.newEmail = emailError;
    }

    // If there are validation errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setSettingsErrors(newErrors);
      return;
    }

    setIsUpdatingEmail(true);

    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Update email
      await updateEmail(user, newEmail);

      setEmailSuccess(
        "Email updated successfully. Please check your new email for verification."
      );
      setNewEmail("");
    } catch (error: any) {
      console.error("Email update error:", error);
      if (error.code === "auth/email-already-in-use") {
        setEmailError("This email is already in use");
      } else if (error.code === "auth/invalid-email") {
        setEmailError("Invalid email address");
      } else {
        setEmailError(error.message || "Failed to update email");
      }
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  // Delete account function
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== "Delete Account") {
      alert("Please enter 'Delete Account' exactly as shown to confirm.");
      return;
    }

    setIsDeletingAccount(true);

    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Delete user from Firebase Auth
      await deleteUser(user);

      setDeleteSuccess(true);
      setShowDeleteModal(false);

      // Redirect to signup page after a short delay
      setTimeout(() => {
        router.push("/signup");
      }, 2000);
    } catch (error: any) {
      console.error("Account deletion error:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeletingAccount(false);
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

  // Check if user is a Google user
  useEffect(() => {
    if (user) {
      // Check if user has password provider (not just Google)
      const hasPasswordProvider = user.providerData.some(
        (provider) => provider.providerId === "password"
      );
      setIsGoogleUser(!hasPasswordProvider);
    }
  }, [user]);

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

                {/* Skills Section */}
                {user?.uid && <SkillsSection userId={user.uid} />}

                {/* Company Section - Only show if user has company information */}
                {companyInfo && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-2">
                      Company
                    </h3>
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
                  </div>
                )}
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
                          className="rounded overflow-hidden border border-[#454446] hover:border-[#00DF71] transition-colors flex-shrink-0"
                          style={{
                            borderRadius: "4px",
                            width: "200px",
                            flexShrink: 0,
                          }}
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

                            {/* Use the saved Cloudinary preview image - this should match exactly what was generated in ShareStep */}
                            {prop.previewImageUrl ? (
                              <img
                                src={prop.previewImageUrl}
                                alt={prop.propsTitle || "Recent Prop"}
                                className="relative z-20 w-full h-full"
                                style={{
                                  borderRadius: "4px",
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  objectPosition: "center",
                                }}
                              />
                            ) : prop.previewImageBase64 ? (
                              <img
                                src={prop.previewImageBase64}
                                alt={prop.propsTitle || "Recent Prop"}
                                className="relative z-20 w-full h-full"
                                style={{
                                  borderRadius: "4px",
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  objectPosition: "center",
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
                                      // objectPosition: "center",
                                    }}
                                  />
                                </div>
                                {/* Foreground props image */}
                                <img
                                  src={getProxiedUrlForPreview(
                                    prop.achievement?.props || ""
                                  )}
                                  alt={prop.propsTitle || ""}
                                  className="relative z-20 w-full h-full"
                                  style={{
                                    borderRadius: "4px",
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    // objectPosition: "center",
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
                                          // objectPosition: "left",
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
                      {recentTemplates.map((template) => (
                        <Link
                          key={template.id}
                          href={`/templates/${template.id}`}
                          className="rounded overflow-hidden border border-[#454446] hover:border-[#00DF71] transition-colors flex-shrink-0"
                          style={{
                            borderRadius: "4px",
                            width: "200px",
                            flexShrink: 0,
                          }}
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
                            {template.previewImageBase64 ? (
                              <img
                                src={template.previewImageBase64}
                                alt={
                                  template.achievement?.company ||
                                  "Recent Template"
                                }
                                className="relative z-20 w-full h-full"
                                style={{
                                  borderRadius: "4px",
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  // objectPosition: "center",
                                }}
                              />
                            ) : template.achievement?.backgroundImage ||
                              template.achievement?.props ? (
                              /* Fallback: Reconstruct from template data like in preview */
                              <>
                                {/* Background layer */}
                                <div
                                  className="absolute inset-0 z-10 overflow-hidden"
                                  style={{ borderRadius: "4px" }}
                                >
                                  <img
                                    src={getProxiedUrlForPreview(
                                      template.achievement?.backgroundImage ||
                                        ""
                                    )}
                                    alt={template.achievement?.company || ""}
                                    className="w-full h-full object-cover"
                                    style={{
                                      borderRadius: "4px",
                                      objectFit: "cover",
                                      // objectPosition: "center",
                                    }}
                                  />
                                </div>
                                {/* Foreground props image */}
                                <img
                                  src={getProxiedUrlForPreview(
                                    template.achievement?.props || ""
                                  )}
                                  alt={template.achievement?.company || ""}
                                  className="relative z-20 w-full h-full"
                                  style={{
                                    borderRadius: "4px",
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    // objectPosition: "center",
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
                                    {template.achievement?.logoImage ? (
                                      <img
                                        src={getProxiedUrlForPreview(
                                          template.achievement.logoImage
                                        )}
                                        alt="Logo"
                                        className="object-contain relative z-20"
                                        style={{
                                          borderRadius: "4px",
                                          height: "17px",
                                          width: "auto",
                                          // objectPosition: "left",
                                        }}
                                      />
                                    ) : null}
                                    <div
                                      className="text-black font-medium truncate text-xs"
                                      style={{ maxWidth: "70%" }}
                                    >
                                      {template.achievement?.company || ""}
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              /* Fallback: Show placeholder when no images available */
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <div className="text-gray-500 text-sm text-center">
                                  <div>No Preview Available</div>
                                  <div className="text-xs mt-1">
                                    {template.achievement?.company ||
                                      "Recent Template"}
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
            </div>
          ) : activeTab === "settings" ? (
            // Settings tab content
            <div className="max-w-4xl space-y-6">
              {/* Account Information */}
              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Account Information
                </h2>

                {/* Current Email Display */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Email
                  </label>
                  <div className="bg-[#1A1D21] border border-[#454446] rounded-lg px-3 py-2 text-gray-300">
                    {user?.email || "No email available"}
                  </div>
                </div>

                {/* Email Update Form */}
                <form onSubmit={handleEmailUpdate} className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Update Email
                  </h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => {
                        setNewEmail(e.target.value);
                        clearSettingsError("newEmail");
                      }}
                      className={`w-full bg-[#1A1D21] border rounded-lg px-3 py-2 text-white focus:outline-none ${
                        settingsErrors.newEmail
                          ? "border-red-500"
                          : "border-[#454446] focus:border-[#00DF71]"
                      }`}
                      placeholder="Enter new email address"
                      required
                    />
                    {settingsErrors.newEmail && (
                      <p className="text-red-500 text-xs mt-1">
                        {settingsErrors.newEmail}
                      </p>
                    )}
                  </div>
                  {emailError && (
                    <div className="text-red-400 text-sm mb-2">
                      {emailError}
                    </div>
                  )}
                  {emailSuccess && (
                    <div className="text-green-400 text-sm mb-2">
                      {emailSuccess}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isUpdatingEmail}
                    className="px-4 py-2 bg-[#00DF71] text-[#212327] rounded-lg hover:bg-[#0AFB84] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingEmail ? "Updating..." : "Update Email"}
                  </button>
                </form>
              </div>

              {/* Password Management */}
              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  {isGoogleUser ? "Set Password" : "Change Password"}
                </h2>

                {isGoogleUser ? (
                  <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm">
                      You signed up with Google. Set a password to also sign in
                      with your email and password.
                    </p>
                  </div>
                ) : null}

                <form
                  onSubmit={
                    isGoogleUser ? handleSetPassword : handlePasswordUpdate
                  }
                >
                  <div className="space-y-4">
                    {!isGoogleUser && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => {
                              setCurrentPassword(e.target.value);
                              clearSettingsError("currentPassword");
                            }}
                            className={`w-full bg-[#1A1D21] border rounded-lg px-3 py-2 pr-10 text-white focus:outline-none ${
                              settingsErrors.currentPassword
                                ? "border-red-500"
                                : "border-[#454446] focus:border-[#00DF71]"
                            }`}
                            placeholder="Enter current password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                          >
                            {showCurrentPassword ? (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                        {settingsErrors.currentPassword && (
                          <p className="text-red-500 text-xs mt-1">
                            {settingsErrors.currentPassword}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {isGoogleUser ? "New Password" : "New Password"}
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            clearSettingsError("newPassword");
                          }}
                          className={`w-full bg-[#1A1D21] border rounded-lg px-3 py-2 pr-10 text-white focus:outline-none ${
                            settingsErrors.newPassword
                              ? "border-red-500"
                              : "border-[#454446] focus:border-[#00DF71]"
                          }`}
                          placeholder={
                            isGoogleUser
                              ? "Enter new password"
                              : "Enter new password"
                          }
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showNewPassword ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {settingsErrors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {settingsErrors.newPassword}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {isGoogleUser
                          ? "Confirm Password"
                          : "Confirm New Password"}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            clearSettingsError("confirmPassword");
                          }}
                          className={`w-full bg-[#1A1D21] border rounded-lg px-3 py-2 pr-10 text-white focus:outline-none ${
                            settingsErrors.confirmPassword
                              ? "border-red-500"
                              : "border-[#454446] focus:border-[#00DF71]"
                          }`}
                          placeholder={
                            isGoogleUser
                              ? "Confirm new password"
                              : "Confirm new password"
                          }
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {settingsErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {settingsErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  {passwordError && (
                    <div className="text-red-400 text-sm mt-2">
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="text-green-400 text-sm mt-2">
                      {passwordSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="mt-4 px-4 py-2 bg-[#00DF71] text-[#212327] rounded-lg hover:bg-[#0AFB84] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingPassword
                      ? isGoogleUser
                        ? "Setting..."
                        : "Updating..."
                      : isGoogleUser
                      ? "Set Password"
                      : "Update Password"}
                  </button>
                </form>
              </div>

              {/* Delete Account Section */}
              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Delete Account
                </h2>

                <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm">
                    <strong>Warning:</strong> This action cannot be undone.
                    Deleting your account will permanently remove all your data,
                    including props, templates, and profile information.
                  </p>
                </div>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
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

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#212327] rounded-lg p-6 max-w-md w-full mx-4 border border-[#454446]">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">
                Delete Account
              </h3>
              <p className="text-gray-300 mb-4">
                You are deleting your account and all user data. Enter "Delete
                Account" below to confirm.
              </p>

              <div className="mb-4">
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  className="w-full bg-[#1A1D21] border border-[#454446] rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                  placeholder="Type 'Delete Account' here"
                />
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmationText("");
                  }}
                  className="px-4 py-2 text-sm font-medium transition-colors bg-gray-600 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={
                    isDeletingAccount ||
                    deleteConfirmationText !== "Delete Account"
                  }
                  className="px-4 py-2 text-sm font-medium text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ backgroundColor: "#DC2626" }}
                >
                  {isDeletingAccount ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Deleted Success Modal */}
      {deleteSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#212327] rounded-lg p-6 max-w-md w-full mx-4 border border-[#454446]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Account Deleted
              </h3>
              <p className="text-gray-300">
                Your account has been successfully deleted. You will be
                redirected to the signup page.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
