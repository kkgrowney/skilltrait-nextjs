"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AwardsStep,
  CompanyStep,
  BackgroundStep,
  PropsDetailsStep,
  ShareStep,
} from "@/components/digital-awards";
import CompanyButtonOverlay from "@/components/CompanyButtonOverlay";
import { companyNames } from "@/lib/companyNames";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DigitalAwardsLayout from "@/components/DigitalAwardsLayout";
import { StepType } from "@/components/DigitalAwardsSideNav";

export default function DigitalAwardsPage() {
  const searchParams = useSearchParams();
  // Function to get consistent company name based on template index
  const getCompanyName = (templateIndex: number) => {
    return companyNames[templateIndex % companyNames.length];
  };
  const [currentStep, setCurrentStep] = useState<StepType>(() => {
    // Try to get the current step from localStorage first
    if (typeof window !== "undefined") {
      const savedStep = localStorage.getItem("digital-awards-current-step");
      if (
        savedStep &&
        ["awards", "company", "background", "props-details", "share"].includes(
          savedStep
        )
      ) {
        return savedStep as StepType;
      }
    }
    return "awards";
  });
  const [activeTab, setActiveTab] = useState<"props" | "achievements">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("digital-awards-active-tab");
      return saved === "achievements" ? "achievements" : "props";
    }
    return "props";
  });
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("digital-awards-selected-template");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [showTemplateDetail, setShowTemplateDetail] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("digital-awards-show-template-detail");
      return saved === "true";
    }
    return false;
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [logoVisible, setLogoVisible] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("digital-awards-logo-visible");
      return saved !== "false"; // Default to true
    }
    return true;
  });
  const [uploadedLogoFile, setUploadedLogoFile] = useState<File | null>(null);
  const [propsTemplates, setPropsTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);
  const [companyNameText, setCompanyNameText] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("digital-awards-company-name") || "";
    }
    return "";
  });
  const [backgroundVisible, setBackgroundVisible] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("digital-awards-background-visible");
      return saved !== "false"; // Default to true
    }
    return true;
  });
  const [uploadedBackgroundFile, setUploadedBackgroundFile] =
    useState<File | null>(null);
  const [backgroundNameText, setBackgroundNameText] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("digital-awards-background-name") || "";
    }
    return "";
  });
  const [propsTitle, setPropsTitle] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("digital-awards-props-title") || "";
    }
    return "";
  });
  const [propsRecipients, setPropsRecipients] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("digital-awards-props-recipients");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [fromName, setFromName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("digital-awards-from-name") || "";
    }
    return "";
  });
  const [fromDate, setFromDate] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("digital-awards-from-date") || "";
    }
    return "";
  });
  const [fromMessage, setFromMessage] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("digital-awards-from-message") || "";
    }
    return "";
  });
  const [filters, setFilters] = useState<{ [tag: string]: boolean }>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("digital-awards-filters");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("digital-awards-search-query") || "";
    }
    return "";
  });
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [isStepsSidebarOpen, setIsStepsSidebarOpen] = useState(false);
  const [selectedSidebarStep, setSelectedSidebarStep] =
    useState<StepType | null>(null);

  // Helper function to save all form state to localStorage
  const saveFormStateToLocalStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("digital-awards-active-tab", activeTab);
      localStorage.setItem(
        "digital-awards-selected-template",
        JSON.stringify(selectedTemplate)
      );
      localStorage.setItem(
        "digital-awards-show-template-detail",
        showTemplateDetail.toString()
      );
      localStorage.setItem(
        "digital-awards-logo-visible",
        logoVisible.toString()
      );
      localStorage.setItem("digital-awards-company-name", companyNameText);
      localStorage.setItem(
        "digital-awards-background-visible",
        backgroundVisible.toString()
      );
      localStorage.setItem(
        "digital-awards-background-name",
        backgroundNameText
      );
      localStorage.setItem("digital-awards-props-title", propsTitle);
      localStorage.setItem(
        "digital-awards-props-recipients",
        JSON.stringify(propsRecipients)
      );
      localStorage.setItem("digital-awards-from-name", fromName);
      localStorage.setItem("digital-awards-from-date", fromDate);
      localStorage.setItem("digital-awards-from-message", fromMessage);
      localStorage.setItem("digital-awards-filters", JSON.stringify(filters));
      localStorage.setItem("digital-awards-search-query", searchQuery);
    }
  };

  // Save form state to localStorage whenever any form value changes
  useEffect(() => {
    saveFormStateToLocalStorage();
  }, [
    activeTab,
    selectedTemplate,
    showTemplateDetail,
    logoVisible,
    companyNameText,
    backgroundVisible,
    backgroundNameText,
    propsTitle,
    propsRecipients,
    fromName,
    fromDate,
    fromMessage,
    filters,
    searchQuery,
  ]);

  // Prefill from query params (logo/bg/company/base, step)
  useEffect(() => {
    if (!searchParams) return;
    const step = searchParams.get("step");
    const logo = searchParams.get("logo");
    const bg = searchParams.get("bg");
    const company = searchParams.get("company");
    const base = searchParams.get("base");

    if (company) setCompanyNameText(decodeURIComponent(company));

    // If we have a base props URL or bg/logo, synthesize a minimal selectedTemplate
    if (base || bg || logo || company) {
      setSelectedTemplate({
        achievement: {
          props: base ? decodeURIComponent(base) : undefined,
          logoImage: logo ? decodeURIComponent(logo) : undefined,
          backgroundImage: bg ? decodeURIComponent(bg) : undefined,
          company: company ? decodeURIComponent(company) : undefined,
          tags: [],
        },
      });
      setShowTemplateDetail(true);
      setLogoVisible(true);
      setBackgroundVisible(true);
    }

    if (step === "props-details") {
      setCurrentStep("props-details");
      // Save the current step to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("digital-awards-current-step", "props-details");
      }
    }
  }, [searchParams]);

  const handleStepChange = (step: StepType) => {
    // Check if user can navigate to this step
    if (step === "company" && !selectedTemplate) {
      setAlertMessage(
        "You must first select an award template in order to proceed."
      );
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 4000); // Hide after 4 seconds
      return;
    }

    if (step === "background" && !selectedTemplate) {
      setAlertMessage(
        "You must first select an award template in order to proceed."
      );
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 4000);
      return;
    }

    if (step === "props-details" && !selectedTemplate) {
      setAlertMessage(
        "You must first select an award template in order to proceed."
      );
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 4000);
      return;
    }

    if (step === "share" && !selectedTemplate) {
      setAlertMessage(
        "You must first select an award template in order to proceed."
      );
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 4000);
      return;
    }

    setCurrentStep(step);
    // Save the current step to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("digital-awards-current-step", step);
    }
  };

  const handleNext = () => {
    const steps: StepType[] = [
      "awards",
      "company",
      "background",
      "props-details",
      "share",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);
      // Save the current step to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("digital-awards-current-step", nextStep);
      }
    }
  };

  const handlePrevious = () => {
    const steps: StepType[] = [
      "awards",
      "company",
      "background",
      "props-details",
      "share",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      setCurrentStep(prevStep);
      // Save the current step to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("digital-awards-current-step", prevStep);
      }
    }
  };

  const handleTemplateSelect = (templateObj: any) => {
    setSelectedTemplate(templateObj);
    setShowTemplateDetail(true);
    setLogoVisible(true); // Reset logo visibility for new template
    setUploadedLogoFile(null); // Reset uploaded logo for new template
    setCompanyNameText(""); // Reset company name for new template
    // Clear form data when new template is selected
    setPropsTitle("");
    setPropsRecipients([]);
    setFromName("");
    setFromDate("");
    setFromMessage("");
    setBackgroundNameText("");
    setUploadedBackgroundFile(null);
  };

  // Function to clear all localStorage data
  const clearAllLocalStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("digital-awards-current-step");
      localStorage.removeItem("digital-awards-active-tab");
      localStorage.removeItem("digital-awards-selected-template");
      localStorage.removeItem("digital-awards-show-template-detail");
      localStorage.removeItem("digital-awards-logo-visible");
      localStorage.removeItem("digital-awards-company-name");
      localStorage.removeItem("digital-awards-background-visible");
      localStorage.removeItem("digital-awards-background-name");
      localStorage.removeItem("digital-awards-props-title");
      localStorage.removeItem("digital-awards-props-recipients");
      localStorage.removeItem("digital-awards-from-name");
      localStorage.removeItem("digital-awards-from-date");
      localStorage.removeItem("digital-awards-from-message");
      localStorage.removeItem("digital-awards-filters");
      localStorage.removeItem("digital-awards-search-query");
    }
  };

  const handleBackToTemplates = () => {
    setShowTemplateDetail(false);
    setSelectedTemplate(null);
    // Reset to first step when going back to templates
    setCurrentStep("awards");
    // Clear all localStorage data
    clearAllLocalStorage();
  };

  // Function to start over completely (reset all state and go back to first step)
  const handleStartOver = () => {
    setCurrentStep("awards");
    setSelectedTemplate(null);
    setShowTemplateDetail(false);
    setLogoVisible(true);
    setUploadedLogoFile(null);
    setCompanyNameText("");
    setBackgroundVisible(true);
    setUploadedBackgroundFile(null);
    setBackgroundNameText("");
    setPropsTitle("");
    setPropsRecipients([]);
    setFromName("");
    setFromDate("");
    setFromMessage("");
    setActiveTab("props");
    setFilters({});
    setSearchQuery("");
    // Clear all localStorage data
    clearAllLocalStorage();
  };

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const openStepsSidebar = () => {
    console.log("openStepsSidebar called, setting isStepsSidebarOpen to true");
    setIsStepsSidebarOpen(true);
    setSelectedSidebarStep(null); // Reset to steps list view
  };

  const handleSidebarStepSelect = (step: StepType) => {
    setSelectedSidebarStep(step);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "awards":
        return (
          <AwardsStep
            searchQuery={searchQuery}
            handleChangeSearch={handleChangeSearch}
            setFilters={setFilters}
            filters={filters}
            onTabChange={setActiveTab}
            showTemplateDetail={showTemplateDetail}
            setShowAchievementsModal={setShowAchievementsModal}
            selectedTemplate={selectedTemplate}
            onStepChange={handleStepChange}
            currentStep={currentStep}
            isStepsSidebarOpen={isStepsSidebarOpen}
            setIsStepsSidebarOpen={setIsStepsSidebarOpen}
          />
        );
      case "company":
        return (
          <CompanyStep
            onNext={handleNext}
            onPrevious={handlePrevious}
            selectedTemplate={selectedTemplate}
            templateType={activeTab}
            logoVisible={logoVisible}
            setLogoVisible={setLogoVisible}
            uploadedLogoFile={uploadedLogoFile}
            setUploadedLogoFile={setUploadedLogoFile}
            companyNameText={companyNameText}
            setCompanyNameText={setCompanyNameText}
            defaultLogoUrl={selectedTemplate?.achievement?.logoImage}
          />
        );
      case "background":
        return (
          <BackgroundStep
            onNext={handleNext}
            onPrevious={handlePrevious}
            selectedTemplate={selectedTemplate}
            templateType={activeTab}
            backgroundVisible={backgroundVisible}
            setBackgroundVisible={setBackgroundVisible}
            uploadedBackgroundFile={uploadedBackgroundFile}
            setUploadedBackgroundFile={setUploadedBackgroundFile}
            backgroundNameText={backgroundNameText}
            setBackgroundNameText={setBackgroundNameText}
            defaultBackgroundUrl={
              selectedTemplate?.achievement?.backgroundImage
            }
          />
        );
      case "props-details":
        return (
          <PropsDetailsStep
            onNext={handleNext}
            onPrevious={handlePrevious}
            selectedTemplate={selectedTemplate}
            templateType={activeTab}
            propsTitle={propsTitle}
            setPropsTitle={setPropsTitle}
            propsRecipients={propsRecipients}
            setPropsRecipients={setPropsRecipients}
            fromName={fromName}
            setFromName={setFromName}
            fromDate={fromDate}
            setFromDate={setFromDate}
            fromMessage={fromMessage}
            setFromMessage={setFromMessage}
          />
        );
      case "share":
        return (
          <ShareStep
            onPrevious={handlePrevious}
            onAuthSuccess={() => setCurrentStep("share")}
            selectedTemplate={selectedTemplate}
            companyNameText={companyNameText}
            uploadedLogoFile={uploadedLogoFile}
            backgroundNameText={backgroundNameText}
            uploadedBackgroundFile={uploadedBackgroundFile}
            propsTitle={propsTitle}
            propsRecipients={propsRecipients}
            fromName={fromName}
            fromDate={fromDate}
            fromMessage={fromMessage}
          />
        );
      default:
        return (
          <AwardsStep
            searchQuery={searchQuery}
            handleChangeSearch={handleChangeSearch}
            setFilters={setFilters}
            filters={filters}
            onTabChange={setActiveTab}
            showTemplateDetail={showTemplateDetail}
            setShowAchievementsModal={setShowAchievementsModal}
            selectedTemplate={selectedTemplate}
            onStepChange={handleStepChange}
            currentStep={currentStep}
            isStepsSidebarOpen={isStepsSidebarOpen}
            setIsStepsSidebarOpen={setIsStepsSidebarOpen}
          />
        );
    }
  };

  // Fetch templates from Firestore - try both collection names
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        // Try the new collection name first (Kevin's approach)
        let templatesRef = collection(db, "template");
        let q = query(templatesRef);
        let querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // If empty, try the old collection name (your approach)
          templatesRef = collection(db, "template");
          q = query(templatesRef);
          querySnapshot = await getDocs(q);
        }

        const templates = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter templates with props (your approach)
        const templatesWithProps = templates.filter(
          (t: any) => t.achievement && t.achievement.props
        );

        setPropsTemplates(templatesWithProps);
        setFilteredTemplates(templatesWithProps);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // Filter templates based on search query and filters
  useEffect(() => {
    const activeTags = Object.entries(filters)
      .filter(([_, isActive]) => isActive)
      .map(([tag]) => tag.toLowerCase());

    const filtered = propsTemplates?.filter((template: any) => {
      const tags = (template.achievement?.tags || []).map((tag: string) =>
        tag.toLowerCase()
      );

      const matchesSelectedFilters =
        activeTags.length === 0 ||
        tags.some((tag: string) => activeTags.includes(tag));

      const matchesSearchQuery =
        searchQuery === "" ||
        tags.some((tag: string) => tag.includes(searchQuery));

      return matchesSelectedFilters && matchesSearchQuery;
    });

    setFilteredTemplates(filtered);
  }, [filters, propsTemplates, searchQuery]);

  // Create left content
  const leftContent =
    showTemplateDetail && currentStep === "awards" ? (
      <AwardsStep
        searchQuery={searchQuery}
        handleChangeSearch={handleChangeSearch}
        setFilters={setFilters}
        filters={filters}
        onTabChange={setActiveTab}
        showTemplateDetail={showTemplateDetail}
        setShowAchievementsModal={setShowAchievementsModal}
        selectedTemplate={selectedTemplate}
        onStepChange={handleStepChange}
        currentStep={currentStep}
        isStepsSidebarOpen={isStepsSidebarOpen}
        setIsStepsSidebarOpen={setIsStepsSidebarOpen}
      />
    ) : (
      renderCurrentStep()
    );

  // Create right content with detailed template preview
  const rightContent = (
    <>
      {showTemplateDetail ||
      (currentStep === "company" && selectedTemplate) ||
      (currentStep === "background" && selectedTemplate) ? (
        /* Template Detail View */
        <div className="h-full flex flex-col items-center justify-start pt-6">
          {/* Back Button */}
          <div className="w-full mb-6">
            <button
              onClick={handleBackToTemplates}
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              Back to Templates
            </button>
          </div>

          {/* Selected Template Display with Detailed Preview */}
          {selectedTemplate && (
            <div className="w-full flex justify-center">
              <div
                className="relative bg-white rounded"
                style={{
                  borderRadius: "4px",
                  width: "100%",
                  maxWidth: "600px",
                  aspectRatio: "5 / 4",
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 bg-white border-b-2 border-gray-200"
                  style={{
                    height: "80px",
                    zIndex: 50,
                    borderRadius: "8px 8px 0 0",
                  }}
                >
                  {(logoVisible || companyNameText) && (
                    <div
                      className="absolute flex items-center"
                      style={{
                        height: "40px",
                        width: "250px",
                        maxWidth: "250px",
                        left: "20px",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      {companyNameText ? (
                        <div
                          className="text-black font-poppins"
                          style={{
                            fontFamily: "Poppins",
                            fontSize: "25px",
                            maxWidth: "250px",
                            color: "black",
                          }}
                        >
                          {companyNameText}
                        </div>
                      ) : (
                        <img
                          src={
                            uploadedLogoFile
                              ? URL.createObjectURL(uploadedLogoFile)
                              : selectedTemplate?.achievement?.logoImage || ""
                          }
                          alt="Logo"
                          className="h-full max-h-[40px] w-auto object-contain"
                          style={{ maxHeight: "40px" }}
                        />
                      )}
                    </div>
                  )}

                  {propsTitle && (
                    <div
                      className="absolute flex items-center justify-end"
                      style={{
                        height: "40px",
                        width: "250px",
                        maxWidth: "250px",
                        right: "20px",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <div
                        className="text-black font-poppins text-right"
                        style={{
                          fontFamily: "Poppins",
                          fontSize: "20px",
                          maxWidth: "250px",
                          color: "black",
                          textAlign: "right",
                        }}
                      >
                        {propsTitle}
                      </div>
                    </div>
                  )}
                </div>
                {(backgroundVisible || uploadedBackgroundFile) && (
                  <div
                    className="absolute inset-0 z-10 overflow-hidden"
                    style={{
                      borderRadius: "4px",
                    }}
                  >
                    <img
                      src={
                        uploadedBackgroundFile
                          ? URL.createObjectURL(uploadedBackgroundFile)
                          : selectedTemplate?.achievement?.backgroundImage || ""
                      }
                      alt="Background"
                      className="w-full h-full object-cover rounded"
                      style={{
                        borderRadius: "4px",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                )}
                <img
                  src={selectedTemplate?.achievement?.props || ""}
                  alt="Selected Template"
                  className="object-contain rounded relative z-20 w-full h-full"
                  style={{
                    borderRadius: "4px",
                    width: "100%",
                    height: "100%",
                    objectPosition: "bottom",
                  }}
                />

                {propsRecipients && propsRecipients.length > 0 && (
                  <div
                    className="absolute mb-7 z-30 bg-gradient-to-r from-[#ADAFBE] via-[#4F7295] to-[#ADAFBE] opacity-80 rounded-lg p-2"
                    style={{
                      left: "20px",
                      top: "92px",
                      maxWidth: "280px",
                      minHeight: "60px",
                    }}
                  >
                    <p
                      className="text-white text-sm font-medium mb-1"
                      style={{ color: "white", opacity: 1 }}
                    >
                      Props recipients:
                    </p>
                    <p
                      className="text-white text-base font-medium"
                      style={{
                        lineHeight: "1.2",
                        color: "white",
                        opacity: 1,
                      }}
                    >
                      {propsRecipients.join(", ")}
                    </p>
                  </div>
                )}

                {(fromName || fromDate || fromMessage) && (
                  <div
                    className="absolute z-30 bg-gradient-to-r from-[#ADAFBE] via-[#4F7295] to-[#ADAFBE] opacity-80 rounded-lg p-2"
                    style={{
                      left: "20px",
                      top:
                        propsRecipients && propsRecipients.length > 0
                          ? "calc(92px + 60px + 12px)"
                          : "92px",
                      maxWidth: "280px",
                      minHeight: "60px",
                    }}
                  >
                    {fromName && (
                      <div className="flex justify-between items-center mb-2">
                        <p
                          className="text-white text-sm font-medium"
                          style={{ color: "white", opacity: 1 }}
                        >
                          From: {fromName}
                        </p>
                        {fromDate && (
                          <p
                            className="text-white text-sm font-medium"
                            style={{ color: "white", opacity: 1 }}
                          >
                            {(() => {
                              const [year, month, day] = fromDate.split("-");
                              return `${month}/${day}/${year.slice(2)}`;
                            })()}
                          </p>
                        )}
                      </div>
                    )}
                    {fromMessage && (
                      <p
                        className="text-white text-base mb-2"
                        style={{
                          lineHeight: "1.2",
                          color: "white",
                          opacity: 1,
                        }}
                      >
                        {fromMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div
            className="w-full flex gap-4 justify-center"
            style={{ marginTop: "24px" }}
          >
            {currentStep === "awards" ? (
              <>
                <button
                  onClick={handleBackToTemplates}
                  className="px-6 py-3 text-sm font-medium transition-colors border rounded text-gray-300 hover:text-white whitespace-nowrap"
                  style={{ borderColor: "#454446", width: "150px" }}
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    // Handle template selection - move to Company step but keep template detail visible
                    setCurrentStep("company");
                    // Don't set showTemplateDetail to false - keep template visible in right container
                  }}
                  className="px-6 py-3 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84] whitespace-nowrap"
                  style={{ width: "150px" }}
                >
                  Select Template
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    // Return to template grid
                    setShowTemplateDetail(false);
                    setSelectedTemplate(null);
                    setCurrentStep("awards");
                  }}
                  className="px-6 py-3 text-sm font-medium transition-colors border rounded text-gray-300 hover:text-white whitespace-nowrap"
                  style={{ borderColor: "#454446", width: "150px" }}
                >
                  Change Template
                </button>
                <button
                  onClick={openStepsSidebar}
                  className="lg:hidden px-3 py-3 text-sm font-medium transition-colors bg-[#00DF71] text-[#212327] rounded hover:bg-opacity-90 whitespace-nowrap"
                  style={{ width: "150px" }}
                >
                  Open Steps Sidebar
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Template Grid View */
        <>
          {/* Header and Description */}
          <div className="mb-6" style={{ paddingTop: "20px" }}>
            <h1 className="text-[30px] font-bold text-white mb-4">
              {activeTab === "props"
                ? "Props Templates"
                : "Achievement Templates"}
            </h1>
            <p className="text-md text-gray-300 mb-6">
              Choose a template for your achievement. You can update this later
              in saved awards.
            </p>
          </div>

          {/* Template Grid */}
          {activeTab === "props" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-start pb-6 h-full">
              {filteredTemplates?.map((temp, index) => (
                <div
                  key={`props-template-${index}`}
                  className="w-full cursor-pointer hover:opacity-80 transition-opacity bg-white rounded"
                  style={{
                    borderRadius: "4px",
                    aspectRatio: "600/400",
                  }}
                >
                  <div
                    onClick={() => handleTemplateSelect(temp)}
                    className="relative w-full h-full"
                  >
                    <img
                      src={temp.achievement.props}
                      alt="Props Template 1"
                      className="w-full h-full object-cover"
                      style={{ borderRadius: "4px" }}
                    />
                    <div
                      className="absolute top-0 left-0 right-0 bg-white border-b-2 border-gray-200"
                      style={{
                        height: "20%",
                        zIndex: 50,
                        borderRadius: "4px 4px 0 0",
                      }}
                    >
                      <div
                        className="absolute flex items-center"
                        style={{
                          height: "60%",
                          width: "60%",
                          maxWidth: "60%",
                          left: "clamp(8px, 2vw, 20px)",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      >
                        <img
                          src={temp.achievement.logoImage}
                          alt="Instagram Logo"
                          className="h-full max-h-full w-auto object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === "achievements" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-start pb-6 h-full">
              {/* Achievement Template 1 */}
              <div
                className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-white rounded"
                style={{ borderRadius: "4px", aspectRatio: "600/447" }}
              >
                <img
                  src="/templates/achievements/achievements-1.png"
                  alt="Achievement Template 1"
                  className="w-full h-full object-contain"
                  style={{ borderRadius: "4px" }}
                  onClick={() => setShowAchievementsModal(true)}
                />
              </div>

              {/* Achievement Template 2 */}
              <div
                className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-white rounded"
                style={{ borderRadius: "4px", aspectRatio: "600/447" }}
              >
                <img
                  src="/templates/achievements/achievements-2.png"
                  alt="Achievement Template 2"
                  className="w-full h-full object-contain"
                  style={{ borderRadius: "4px" }}
                  onClick={() => setShowAchievementsModal(true)}
                />
              </div>

              {/* Achievement Template 3 */}
              <div
                className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-white rounded"
                style={{ borderRadius: "4px", aspectRatio: "600/447" }}
              >
                <img
                  src="/templates/achievements/achievements-3.png"
                  alt="Achievement Template 3"
                  className="w-full h-full object-contain"
                  style={{ borderRadius: "4px" }}
                  onClick={() => setShowAchievementsModal(true)}
                />
              </div>

              {/* Achievement Template 4 */}
              <div
                className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-white rounded"
                style={{ borderRadius: "4px", aspectRatio: "600/447" }}
              >
                <img
                  src="/templates/achievements/achievements-4.png"
                  alt="Achievement Template 4"
                  className="w-full h-full object-contain"
                  style={{ borderRadius: "4px" }}
                  onClick={() => setShowAchievementsModal(true)}
                />
              </div>

              {/* Achievement Template 5 */}
              <div
                className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-white rounded"
                style={{ borderRadius: "4px", aspectRatio: "600/447" }}
              >
                <img
                  src="/templates/achievements/achievements-5.png"
                  alt="Achievement Template 5"
                  className="w-full h-full object-contain"
                  style={{ borderRadius: "4px" }}
                  onClick={() => setShowAchievementsModal(true)}
                />
              </div>

              {/* Achievement Template 6 */}
              <div
                className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-white rounded"
                style={{ borderRadius: "4px", aspectRatio: "600/447" }}
              >
                <img
                  src="/templates/achievements/achievements-6.png"
                  alt="Achievement Template 6"
                  className="w-full h-full object-contain"
                  style={{ borderRadius: "4px" }}
                  onClick={() => setShowAchievementsModal(true)}
                />
              </div>

              {/* Achievement Template 7 */}
              <div
                className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-white rounded"
                style={{ borderRadius: "4px", aspectRatio: "600/447" }}
              >
                <img
                  src="/templates/achievements/achievements-7.png"
                  alt="Achievement Template 7"
                  className="w-full h-full object-contain"
                  style={{ borderRadius: "4px" }}
                  onClick={() => setShowAchievementsModal(true)}
                />
              </div>

              {/* Achievement Template 8 */}
              <div
                className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-white rounded"
                style={{ borderRadius: "4px", aspectRatio: "600/447" }}
              >
                <img
                  src="/templates/achievements/achievements-8.png"
                  alt="Achievement Template 8"
                  className="w-full h-full object-contain"
                  style={{ borderRadius: "4px" }}
                  onClick={() => setShowAchievementsModal(true)}
                />
              </div>

              {/* Achievement Template 9 */}
              <div
                className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-white rounded"
                style={{ borderRadius: "4px", aspectRatio: "600/447" }}
              >
                <img
                  src="/templates/achievements/achievements-9.png"
                  alt="Achievement Template 9"
                  className="w-full h-full object-contain"
                  style={{ borderRadius: "4px" }}
                  onClick={() => setShowAchievementsModal(true)}
                />
              </div>

              {/* Achievement Template 10 */}
              <div
                className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-white rounded"
                style={{ borderRadius: "4px", aspectRatio: "600/447" }}
              >
                <img
                  src="/templates/achievements/achievements-10.png"
                  alt="Achievement Template 10"
                  className="w-full h-full object-contain"
                  style={{ borderRadius: "4px" }}
                  onClick={() =>
                    handleTemplateSelect(
                      "/templates/achievements/achievements-10.png"
                    )
                  }
                />
              </div>

              {/* Achievement Template 11 */}
              <div
                className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-white rounded"
                style={{ borderRadius: "4px", aspectRatio: "600/447" }}
              >
                <img
                  src="/templates/achievements/achievements-11.png"
                  alt="Achievement Template 11"
                  className="w-full h-full object-contain"
                  style={{ borderRadius: "4px" }}
                  onClick={() =>
                    handleTemplateSelect(
                      "/templates/achievements/achievements-11.png"
                    )
                  }
                />
              </div>

              {/* Achievement Template 12 */}
              <div
                className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-white rounded"
                style={{ borderRadius: "4px", aspectRatio: "600/447" }}
              >
                <img
                  src="/templates/achievements/achievements-12.png"
                  alt="Achievement Template 12"
                  className="w-full h-full object-contain"
                  style={{ borderRadius: "4px" }}
                  onClick={() =>
                    handleTemplateSelect(
                      "/templates/achievements/achievements-12.png"
                    )
                  }
                />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      <DigitalAwardsLayout
        currentStep={currentStep}
        onStepChange={handleStepChange}
        leftContent={leftContent}
        rightContent={rightContent}
        showViewTitle={false}
        viewTitleText=""
        isStandalone={false}
      />

      {/* Steps Sidebar - Always accessible from main layout */}
      {isStepsSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
          onClick={() => setIsStepsSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full bg-[#212327] z-[70] transform transition-transform duration-300 ease-in-out ${
          isStepsSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto p-4">
          {/* Desktop Message */}
          <div className=" mb-6 p-4 bg-[#00DF71] bg-opacity-10 border border-[#00DF71] border-opacity-30 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-[#00DF71]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-white font-medium">
                SkillTrait Awards Generator is best used on desktop.
              </span>
            </div>
          </div>

          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => {
                if (selectedSidebarStep) {
                  setSelectedSidebarStep(null); // Go back to steps list
                } else {
                  setIsStepsSidebarOpen(false); // Close sidebar
                }
              }}
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              {selectedSidebarStep ? "Back to Steps" : "Back to Main View"}
            </button>
          </div>

          {!selectedSidebarStep ? (
            // Steps List View
            <>
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
                  {
                    step: "background" as const,
                    label: "Background",
                    icon: "🖼️",
                  },
                  {
                    step: "props-details" as const,
                    label: "Details",
                    icon: "📝",
                  },
                  { step: "share" as const, label: "Share", icon: "📤" },
                ].map(({ step, label, icon }) => (
                  <button
                    key={step}
                    onClick={() => handleSidebarStepSelect(step)}
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
            </>
          ) : (
            // Step Content View
            <>
              <div className="text-center mb-6">
                <h1 className="text-[24px] font-bold text-white mb-4">
                  {selectedSidebarStep === "awards" && "🏆 Awards"}
                  {selectedSidebarStep === "company" && "🏢 Company"}
                  {selectedSidebarStep === "background" && "🖼️ Background"}
                  {selectedSidebarStep === "props-details" && "📝 Details"}
                  {selectedSidebarStep === "share" && "📤 Share"}
                </h1>
                <p className="text-md text-gray-300 mb-0">
                  {selectedSidebarStep === "awards" &&
                    "Select and customize award templates"}
                  {selectedSidebarStep === "company" &&
                    "Configure company branding and logo"}
                  {selectedSidebarStep === "background" &&
                    "Choose and customize background images"}
                  {selectedSidebarStep === "props-details" &&
                    "Add recipient details and personal message"}
                  {selectedSidebarStep === "share" &&
                    "Generate and share your digital award"}
                </p>
              </div>

              {/* Step-specific content */}
              <div className="space-y-4">
                {selectedSidebarStep === "awards" && (
                  <div className="bg-[#1B1D21] p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-3">
                      Award Templates
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Choose from our collection of professional award
                      templates.
                    </p>
                    <button
                      onClick={() => {
                        handleStepChange("awards");
                        setIsStepsSidebarOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-opacity-90 transition-colors"
                    >
                      Go to Awards
                    </button>
                  </div>
                )}

                {selectedSidebarStep === "company" && (
                  <div className="bg-[#1B1D21] p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-3">
                      Company Setup
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Configure your company branding and upload logos.
                    </p>
                    <button
                      onClick={() => {
                        handleStepChange("company");
                        setIsStepsSidebarOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-opacity-90 transition-colors"
                    >
                      Go to Company
                    </button>
                  </div>
                )}

                {selectedSidebarStep === "background" && (
                  <div className="bg-[#1B1D21] p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-3">
                      Background Selection
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Choose and customize background images for your awards.
                    </p>
                    <button
                      onClick={() => {
                        handleStepChange("background");
                        setIsStepsSidebarOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-opacity-90 transition-colors"
                    >
                      Go to Background
                    </button>
                  </div>
                )}

                {selectedSidebarStep === "props-details" && (
                  <div className="bg-[#1B1D21] p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-3">
                      Recipient Details
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Add recipient information and personal messages.
                    </p>
                    <button
                      onClick={() => {
                        handleStepChange("props-details");
                        setIsStepsSidebarOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-opacity-90 transition-colors"
                    >
                      Go to Details
                    </button>
                  </div>
                )}

                {selectedSidebarStep === "share" && (
                  <div className="bg-[#1B1D21] p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-3">
                      Share Award
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Generate and share your completed digital award.
                    </p>
                    <button
                      onClick={() => {
                        handleStepChange("share");
                        setIsStepsSidebarOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-opacity-90 transition-colors"
                    >
                      Go to Share
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showAlert && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50">
          <div
            className="text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-up"
            style={{ backgroundColor: "#ED6568" }}
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="font-medium">{alertMessage}</span>
          </div>
        </div>
      )}
      {showAchievementsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-50">
          <div className="bg-[#212327] border border-gray-600 rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl text-center">
            <h2 className="text-lg font-medium text-white mb-4">
              Achievements Coming Soon
            </h2>
            <p className="text-gray-300 mb-6">
              To send Achievements, please use our legacy web app.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                className="flex-1 px-4 py-2 text-sm font-medium transition-colors border rounded text-gray-300 hover:text-white"
                style={{ borderColor: "#454446" }}
                onClick={() => setShowAchievementsModal(false)}
              >
                Cancel
              </button>
              <a
                href="https://legacy.skilltrait.com" // TODO: Replace with actual legacy app link
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84] text-center"
              >
                Achievements
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
