"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import SideNavigation from "@/components/SideNavigation";
import { useEffect, useState, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export default function TeamEdit() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [teamName, setTeamName] = useState("");
  const [website, setWebsite] = useState("");
  const [teamPhoto, setTeamPhoto] = useState<File | null>(null);
  const [teamPhotoPreview, setTeamPhotoPreview] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [existingTeam, setExistingTeam] = useState(false);

  // Fetch existing team data
  const fetchTeamData = async (uid: string) => {
    try {
      const teamDocRef = doc(db, "teams", uid);
      const teamDoc = await getDoc(teamDocRef);

      if (teamDoc.exists()) {
        const data = teamDoc.data();
        setTeamName(data.teamName || "");
        setWebsite(data.website || "");
        setTeamPhotoPreview(data.teamPhoto || "");
        setExistingTeam(true);
      } else {
        // Set default values if no team exists
        setTeamName("");
        setWebsite("");
        setExistingTeam(false);
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      setExistingTeam(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchTeamData(user.uid);
    }
  }, [user?.uid]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleAvatarSelect(files[0]);
    }
  };

  const handleAvatarSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setTeamPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setTeamPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      let photoUrl = teamPhotoPreview; // Keep existing photo if no new photo

      // Upload new team photo if selected
      if (teamPhoto) {
        const photoRef = ref(storage, `teams/${user?.uid}/team-photo`);
        const snapshot = await uploadBytes(photoRef, teamPhoto);
        photoUrl = await getDownloadURL(snapshot.ref);
      }

      // Update or create team document in Firestore
      const teamDocRef = doc(db, "teams", user?.uid || "");
      await setDoc(
        teamDocRef,
        {
          teamName: teamName,
          website: website,
          teamPhoto: photoUrl,
          updated_time: new Date(),
          created_time: existingTeam ? undefined : new Date(),
        },
        { merge: true }
      );

      console.log(existingTeam ? "Team updated successfully" : "Team created successfully");
      router.push("/team");
    } catch (error) {
      console.error("Error saving team:", error);
    } finally {
      setIsUpdating(false);
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

  if (!user) {
    router.push("/signin");
    return null;
  }

  const pageTitle = existingTeam ? "Edit Team" : "Create Team";
  const submitButtonText = isUpdating 
    ? (existingTeam ? "Updating..." : "Creating...") 
    : (existingTeam ? "Save Changes" : "Create Team");
  const description = existingTeam 
    ? "Update your team information" 
    : "Set up your team profile to get started";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1A1D21" }}>
      <SideNavigation />

      <div className=" h-full flex flex-col">
        {/* ViewTitle Container */}
        <div
          className="w-full bg-[#1e2327] flex items-center border-b border-[#454446] h-16"
          style={{
            height: "64px !important",
            minHeight: "64px",
            maxHeight: "64px",
            paddingLeft: "32px",
          }}
        >
          {/* Back Button */}
          <button
            onClick={() => router.push("/team")}
            className="mr-4 p-2 text-white hover:bg-[#2a2e32] rounded-lg transition-colors"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          {/* Title text */}
          <div className="font-semibold text-[#ffffff] text-[18px] whitespace-nowrap md:ml-0 ml-9 flex items-center">
            {pageTitle}
          </div>
        </div>

        {/* Content Area - Centered Form */}
        <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Form Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">{pageTitle}</h1>
              <p className="text-gray-400">{description}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Team Photo Upload */}
              <div className="text-center">
                <div
                  className="w-24 h-24 mx-auto rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-[#00DF71] transition-colors"
                  onDrop={handleAvatarDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={handleAvatarClick}
                >
                  {teamPhotoPreview ? (
                    <img
                      src={teamPhotoPreview}
                      alt="Team photo"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">Add Image</div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] && handleAvatarSelect(e.target.files[0])
                  }
                  className="hidden"
                />
              </div>

              {/* Team Name Field */}
              <div>
                <label
                  htmlFor="teamName"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Team Name *
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#212327] border border-[#454446] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors"
                  placeholder="Enter team name"
                />
              </div>

              {/* Website Field */}
              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-3 bg-[#212327] border border-[#454446] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors"
                  placeholder="https://www.example.com"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-[#00DF71] text-[#212327] font-medium py-3 px-4 rounded-lg hover:bg-[#0AFB84] transition-colors disabled:opacity-50"
              >
                {submitButtonText}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
