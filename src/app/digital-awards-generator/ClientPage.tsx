"use client";

import { useEffect, useState } from "react";
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
  // Function to get consistent company name based on template index
  const getCompanyName = (templateIndex: number) => {
    return companyNames[templateIndex % companyNames.length];
  };
  const [currentStep, setCurrentStep] = useState<StepType>("awards");
  const [activeTab, setActiveTab] = useState<"props" | "achievements">("props");
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [showTemplateDetail, setShowTemplateDetail] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [logoVisible, setLogoVisible] = useState(true);
  const [uploadedLogoFile, setUploadedLogoFile] = useState<File | null>(null);
  const [propsTemplates, setPropsTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);
  const [companyNameText, setCompanyNameText] = useState<string>("");
  const [backgroundVisible, setBackgroundVisible] = useState(true);
  const [uploadedBackgroundFile, setUploadedBackgroundFile] =
    useState<File | null>(null);
  const [backgroundNameText, setBackgroundNameText] = useState<string>("");
  const [propsTitle, setPropsTitle] = useState<string>("");
  const [propsRecipients, setPropsRecipients] = useState<string[]>([]);
  const [fromName, setFromName] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [fromMessage, setFromMessage] = useState<string>("");
  const [filters, setFilters] = useState<{ [tag: string]: boolean }>({});
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

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
      setCurrentStep(steps[currentIndex + 1]);
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
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleTemplateSelect = (templateObj: any) => {
    setSelectedTemplate(templateObj);
    setShowTemplateDetail(true);
  };

  const handleBackToTemplates = () => {
    setShowTemplateDetail(false);
    setSelectedTemplate(null);
  };

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
          />
        );
      case "company":
        return (
          <CompanyStep
            logoVisible={logoVisible}
            setLogoVisible={setLogoVisible}
            uploadedLogoFile={uploadedLogoFile}
            setUploadedLogoFile={setUploadedLogoFile}
            companyNameText={companyNameText}
            setCompanyNameText={setCompanyNameText}
            selectedTemplate={selectedTemplate}
            getCompanyName={getCompanyName}
          />
        );
      case "background":
        return (
          <BackgroundStep
            backgroundVisible={backgroundVisible}
            setBackgroundVisible={setBackgroundVisible}
            uploadedBackgroundFile={uploadedBackgroundFile}
            setUploadedBackgroundFile={setUploadedBackgroundFile}
            backgroundNameText={backgroundNameText}
            setBackgroundNameText={setBackgroundNameText}
            selectedTemplate={selectedTemplate}
          />
        );
      case "props-details":
        return (
          <PropsDetailsStep
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
            selectedTemplate={selectedTemplate}
          />
        );
      case "share":
        return (
          <ShareStep
            selectedTemplate={selectedTemplate}
            logoVisible={logoVisible}
            uploadedLogoFile={uploadedLogoFile}
            companyNameText={companyNameText}
            backgroundVisible={backgroundVisible}
            uploadedBackgroundFile={uploadedBackgroundFile}
            propsTitle={propsTitle}
            propsRecipients={propsRecipients}
            fromName={fromName}
            fromDate={fromDate}
            fromMessage={fromMessage}
          />
        );
      default:
        return null;
    }
  };

  // Fetch templates from Firestore
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const templatesRef = collection(db, "templates");
        const q = query(templatesRef);
        const querySnapshot = await getDocs(q);
        const templates = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPropsTemplates(templates);
        setFilteredTemplates(templates);
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

    const filtered = propsTemplates?.filter((template) => {
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

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#1B1D21" }}>
      {/* Fixed Side Navigation */}
      <DigitalAwardsSideNav
        currentStep={currentStep}
        onStepChange={handleStepChange}
      />

      {/* Main Content with Sticky Nav */}
      <div className="h-screen w-full">
        <div className="flex h-full">
          {/* Side Navigation - Fixed width of 94px */}
          {/* <div className="w-[94px] h-full flex-shrink-0">
          </div> */}
          
  // Create left content
  const leftContent = showTemplateDetail && currentStep === "awards" ? (
    <AwardsStep
      searchQuery={searchQuery}
      handleChangeSearch={handleChangeSearch}
      setFilters={setFilters}
      filters={filters}
      onTabChange={setActiveTab}
      showTemplateDetail={showTemplateDetail}
      setShowAchievementsModal={setShowAchievementsModal}
    />
  ) : (
    renderCurrentStep()
  );

  // Create right content
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

          {/* Selected Template Display */}
          {selectedTemplate && (
            <div className="w-full flex justify-center">
              <div
                className="relative bg-white rounded"
                style={{
                  borderRadius: "4px",
                  width: "600px",
                  height: "480px",
                }}
              >
                {/* Template content would go here */}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Template Grid View */
        <>
          {/* Header and Description */}
          <div className="mb-6" style={{ paddingTop: "20px" }}>
            <h1 className="text-[30px] font-bold text-white mb-4">
              {activeTab === "props" ? "Props Templates" : "Achievement Templates"}
            </h1>
            <p className="text-md text-gray-300 mb-6">
              Choose a template for your achievement. You can update this
              later in saved awards.
            </p>
          </div>
          
          {/* Template grid content would go here */}
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
        isStandalone={true}
      />

      {/* Alert Message */}
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
