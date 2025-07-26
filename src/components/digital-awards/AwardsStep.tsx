"use client";

import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { useEffect, useState } from "react";

interface AwardsStepProps {
  onTabChange: (tab: "props" | "achievements") => void;
  setFilters: (filters: { [key: string]: boolean }) => void;
  handleChangeSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filters: { [key: string]: boolean };
  searchQuery: string;
  showTemplateDetail?: boolean;
  setShowAchievementsModal?: (show: boolean) => void;
}

export default function AwardsStep({
  onTabChange,
  filters,
  setFilters,
  handleChangeSearch,
  searchQuery,
  showTemplateDetail = false,
  setShowAchievementsModal,
}: AwardsStepProps) {
  const [awardType, setAwardType] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [achievement, setAchievement] = useState("");
  const [activeTab, setActiveTab] = useState<"props" | "achievements">("props");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const q = query(collection(db, "template"));
        // @ts-ignore
        const snapshot = await getDocs(q);
        const templates: any[] = [];

        snapshot.forEach((doc: any) => {
          const data = doc.data();
          templates.push(data);
        });

        // Filter templates that have 'achievement.props'
        const templatesWithProps = templates.filter(
          (t) => t.achievement && t.achievement.props
        );

        // Merge all tags from all templatesWithProps into a unique array
        const allTagsSet = new Set<string>();
        templatesWithProps.forEach((t) => {
          if (Array.isArray(t.achievement.tags)) {
            t.achievement.tags.forEach((tag: string) => allTagsSet.add(tag));
          }
        });
        
        // Show all available filters
        const allTags = Array.from(allTagsSet);

        // Set filters with all tags as keys and default value of false
        const filtersObj: { [tag: string]: boolean } = {};
        allTags.forEach((tag) => {
          filtersObj[tag] = false;
        });
        setFilters(filtersObj);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  const toggleFilter = (filterName: keyof typeof filters) => {
    setFilters({
      ...filters,
      [filterName]: !filters[filterName],
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-[30px] font-bold text-white mb-4">Awards</h1>
        <p className="text-md text-gray-300 mb-0">
          Create professional digital awards and certificates to recognize
          achievements and milestones.
        </p>
      </div>

      {/* Tab Component */}
      <div className="mb-6">
        <div className="flex border-b" style={{ borderColor: "#454446" }}>
          <button
            onClick={() => {
              setActiveTab("props");
              onTabChange("props");
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === "props"
                ? "text-white border-b-2"
                : "text-gray-300 hover:text-white"
            }`}
            style={{
              borderBottomColor:
                activeTab === "props" ? "var(--primary-dark)" : "transparent",
            }}
          >
            Props
          </button>
          <button
            onClick={() => {
              if (showTemplateDetail && setShowAchievementsModal) {
                setShowAchievementsModal(true);
              } else {
                setActiveTab("achievements");
                onTabChange("achievements");
              }
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === "achievements"
                ? "text-white border-b-2"
                : showTemplateDetail
                ? "text-gray-500 cursor-not-allowed"
                : "text-gray-300 hover:text-white"
            }`}
            style={{
              borderBottomColor:
                activeTab === "achievements"
                  ? "var(--primary-dark)"
                  : "transparent",
            }}
            disabled={showTemplateDetail}
          >
            Achievements
          </button>
        </div>
      </div>

      {/* Search Box */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery || ""}
            onChange={handleChangeSearch}
            placeholder="Search templates..."
            className="w-full px-4 py-3 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
            style={{ borderColor: "#454446" }}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-white mb-3">Filters</h3>
        <div className="flex flex-wrap gap-2">
          {filters &&
            Object.keys(filters).map((tag) => (
              <button
                key={tag}
                onClick={() => toggleFilter(tag)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  filters[tag]
                    ? "bg-[var(--primary-dark)] text-[#212327]"
                    : "bg-[#1B1D21] border text-gray-300 hover:text-white"
                }`}
                style={{
                  borderColor: filters[tag] ? "transparent" : "#454446",
                }}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
