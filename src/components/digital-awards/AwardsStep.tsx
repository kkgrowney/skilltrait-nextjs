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
  selectedTemplate?: any;
  onStepChange?: (
    step: "awards" | "company" | "background" | "props-details" | "share"
  ) => void;
  currentStep?: "awards" | "company" | "background" | "props-details" | "share";
  isStepsSidebarOpen?: boolean;
  setIsStepsSidebarOpen?: (open: boolean) => void;
}

export default function AwardsStep({
  onTabChange,
  filters,
  setFilters,
  handleChangeSearch,
  searchQuery,
  showTemplateDetail = false,
  setShowAchievementsModal,
  selectedTemplate,
  onStepChange,
  currentStep,
  isStepsSidebarOpen,
  setIsStepsSidebarOpen,
}: AwardsStepProps) {
  const [awardType, setAwardType] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [achievement, setAchievement] = useState("");
  const [activeTab, setActiveTab] = useState<"props" | "achievements">("props");
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          filtersObj,
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
      filtered = filtered.filter(
        (template) =>
          template.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.achievement?.props
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Apply tag filters
    const activeFilters = Object.keys(filters).filter((key) => filters[key]);
    if (activeFilters.length > 0) {
      filtered = filtered.filter((template) => {
        // Check if template has any of the active filter tags
        return activeFilters.some(
          (tag) =>
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleStepsSidebar = () => {
    if (setIsStepsSidebarOpen && isStepsSidebarOpen !== undefined) {
      setIsStepsSidebarOpen(!isStepsSidebarOpen);
    }
  };

  const handleStepClick = (
    step: "awards" | "company" | "background" | "props-details" | "share"
  ) => {
    if (onStepChange) {
      onStepChange(step);
    }
    if (setIsStepsSidebarOpen) {
      setIsStepsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button - Only visible on mobile/tablet */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 bg-[#212327] rounded-md text-white hover:bg-[#454446] transition-colors"
          aria-label="Toggle mobile menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Change Template and Generate Award Buttons - Only visible when template is selected on mobile */}
      {selectedTemplate && (
        <div className="lg:hidden fixed top-4 right-4 z-50 flex flex-col space-y-2">
          <button
            onClick={toggleStepsSidebar}
            className="px-4 py-2 bg-[var(--primary-dark)] text-[#212327] rounded-md font-medium hover:bg-opacity-90 transition-colors"
          >
            Change Template
          </button>
          <button
            onClick={() => {
              // This will trigger the award generation process
              // You can add your logic here or pass a callback prop
              console.log("Generate Award clicked");
            }}
            className="px-4 py-2 bg-[#00DF71] text-[#212327] rounded-md font-medium hover:bg-opacity-90 transition-colors"
          >
            Generate Award
          </button>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Steps Sidebar Overlay */}
      {isStepsSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            if (setIsStepsSidebarOpen) {
              setIsStepsSidebarOpen(false);
            }
          }}
        />
      )}

      {/* Mobile Menu Content - Contains Awards Step Content */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-80 bg-[#212327] z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto p-4">
          <div className="text-center mb-6">
            <h1 className="text-[24px] font-bold text-white mb-4">Awards</h1>
            <p className="text-md text-gray-300 mb-0">
              Create professional digital awards and certificates to recognize
              achievements and milestones.
            </p>
          </div>

          {/* Tab Component */}
          <div className="mb-4">
            <div
              className="flex border-b justify-center"
              style={{ borderColor: "#454446" }}
            >
              <button
                onClick={() => {
                  setActiveTab("props");
                  onTabChange("props");
                }}
                className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === "props"
                    ? "text-white border-b-2"
                    : "text-gray-300 hover:text-white"
                }`}
                style={{
                  borderBottomColor:
                    activeTab === "props"
                      ? "var(--primary-dark)"
                      : "transparent",
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
                    setTimeout(() => setShowComingSoon(false), 1000);
                  }
                }}
                className={`px-3 py-2 text-sm font-medium transition-colors relative ${
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
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery || ""}
                onChange={handleChangeSearch}
                placeholder="Search templates..."
                className="w-full px-3 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
                style={{ borderColor: "#454446" }}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-4 w-4 text-gray-400"
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
          <div>
            <h3 className="text-sm font-medium text-white mb-3 px-1">
              Filters
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {filters &&
                Object.keys(filters).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleFilter(tag)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
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
      </div>

      {/* Steps Sidebar - Shows company, background, details, share steps */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#212327] z-50 transform transition-transform duration-300 ease-in-out ${
          isStepsSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto p-4">
          <div className="text-center mb-6">
            <h1 className="text-[24px] font-bold text-white mb-4">Steps</h1>
            <p className="text-md text-gray-300 mb-0">
              Navigate through the award creation process
            </p>
          </div>

          {/* Steps Navigation */}
          <div className="space-y-3">
            {[
              { step: "awards" as const, label: "Awards", icon: "🏆" },
              { step: "company" as const, label: "Company", icon: "🏢" },
              { step: "background" as const, label: "Background", icon: "🖼️" },
              { step: "props-details" as const, label: "Details", icon: "📝" },
              { step: "share" as const, label: "Share", icon: "📤" },
            ].map(({ step, label, icon }) => (
              <button
                key={step}
                onClick={() => handleStepClick(step)}
                className={`w-full p-4 text-left rounded-lg transition-colors ${
                  currentStep === step
                    ? "bg-[var(--primary-dark)] text-[#212327]"
                    : "bg-[#1B1D21] text-white hover:bg-[#454446]"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{icon}</span>
                  <span className="font-medium">{label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Content - Hidden on mobile/tablet */}
      <div
        className="h-full flex flex-col w-full hidden lg:flex"
        style={{
          overflow: "hidden",
          padding: "16px",
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

          /* Desktop responsive adjustments */
          @media (min-width: 641px) {
            .awards-container {
              min-width: 266px;
            }
          }
        `}</style>

        <div
          className="text-center mb-6 awards-container"
          style={{
            paddingTop: "0px",
            flexShrink: 0,
            marginTop: "16px",
          }}
        >
          <h1 className="awards-title text-[30px] font-bold text-white mb-4">
            Awards
          </h1>
          <p className="awards-description text-md text-gray-300 mb-0">
            Create professional digital awards and certificates to recognize
            achievements and milestones.
          </p>
        </div>

        {/* Tab Component */}
        <div className="mb-4 tab-container" style={{ flexShrink: 0 }}>
          <div
            className="flex border-b justify-start"
            style={{ borderColor: "#454446" }}
          >
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
        <div className="mb-4 search-container" style={{ flexShrink: 0 }}>
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
        <div className="filter-container" style={{ flexShrink: 0 }}>
          <h3 className="text-sm font-medium text-white mb-3 px-1">Filters</h3>
          <div className="flex flex-wrap gap-2 justify-start filter-buttons">
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

      {/* Coming Soon Notification */}
      {showComingSoon && (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex justify-center">
          <div
            className="bg-[#00DF71] text-[#212327] px-4 md:px-6 py-2 md:py-3 rounded-b-lg shadow-lg transform transition-transform duration-300 ease-out"
            style={{
              animation: "slideDown 0.3s ease-out",
            }}
          >
            <span className="text-xs md:text-sm font-semibold">
              Coming soon!
            </span>
          </div>
        </div>
      )}
    </>
  );
}
