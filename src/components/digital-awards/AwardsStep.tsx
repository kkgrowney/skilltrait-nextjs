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
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);

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

        // Store all templates and set initial filtered list (no filtering)
        setTemplates(templates);
        setFilteredTemplates(templates);

        // Define the specific filters we want to show
        const allowedFilters = [
          "Free",
          "Creative",
          "Leadership",
          "Mentor",
          "Birthday",
          "Work Anniversary",
        ];

        // Set filters with only the allowed filters as keys and default value of false
        const filtersObj: { [tag: string]: boolean } = {};
        allowedFilters.forEach((tag) => {
          filtersObj[tag] = false;
        });

        console.log({ 
          totalTemplates: templates.length, 
          templates: templates,
          filtersObj 
        });
        setFilters(filtersObj);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  // Filter templates based on search query and filter selections
  useEffect(() => {
    let filtered = templates;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(template => 
        template.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.achievement?.props?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tag filters
    const activeFilters = Object.keys(filters).filter(key => filters[key]);
    if (activeFilters.length > 0) {
      filtered = filtered.filter(template => {
        // Check if template has any of the active filter tags
        return activeFilters.some(tag => 
          template.tags?.includes(tag) || 
          template.category === tag ||
          template.type === tag
        );
      });
    }

    setFilteredTemplates(filtered);
  }, [templates, searchQuery, filters]);

  const toggleFilter = (filterName: keyof typeof filters) => {
    setFilters({
      ...filters,
      [filterName]: !filters[filterName],
    });
  };

  return (
    <div
      className="h-full flex flex-col w-full"
      style={{
        overflow: "hidden",
        padding: "8px",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      <div
        className="text-center mb-6"
        style={{ paddingTop: "0px", flexShrink: 0, marginTop: "16px" }}
      >
        <h1 className="text-[30px] font-bold text-white mb-4">Awards</h1>
        <p className="text-md text-gray-300 mb-0">
          Create professional digital awards and certificates to recognize
          achievements and milestones.
        </p>
      </div>

      {/* Tab Component */}
      <div className="mb-4" style={{ flexShrink: 0 }}>
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
                setShowComingSoon(true);
                // Auto-hide notification after 1 second
                setTimeout(() => setShowComingSoon(false), 1000);
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
      <div className="mb-4" style={{ flexShrink: 0 }}>
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
      <div style={{ flexShrink: 0 }}>
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



      {/* Coming Soon Notification */}
      {showComingSoon && (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex justify-center">
          <div 
            className="bg-[#00DF71] text-[#212327] px-6 py-3 rounded-b-lg shadow-lg transform transition-transform duration-300 ease-out"
            style={{
              animation: 'slideDown 0.3s ease-out'
            }}
          >
            <span className="text-sm font-semibold">Coming soon!</span>
          </div>
        </div>
      )}
    </div>
  );
}
