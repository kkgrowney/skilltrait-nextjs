'use client';

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
import DigitalAwardsSideNav, { StepType } from "@/components/DigitalAwardsSideNav";

export default function DigitalAwardsView() {
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
    setLogoVisible(true); // Reset logo visibility for new template
    setUploadedLogoFile(null); // Reset uploaded logo for new template
    setCompanyNameText(""); // Reset company name for new template
  };

  const handleBackToTemplates = () => {
    setShowTemplateDetail(false);
    setSelectedTemplate(null);
  };

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
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
        return <ShareStep onPrevious={handlePrevious} />;
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
          />
        );
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const q = query(collection(db, "template"));
        const snapshot = await getDocs(q);
        const templates: any[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          templates.push(data);
        });

        const templatesWithProps = templates.filter(
          (t) => t.achievement && t.achievement.props
        );

        setPropsTemplates(templatesWithProps);
        setFilteredTemplates(templatesWithProps); // initialize with all
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    const activeTags = Object.entries(filters)
      .filter(([_, isActive]) => isActive)
      .map(([tag]) => tag.toLowerCase());

    const filtered = propsTemplates?.filter((template) => {
      const tags = (template.achievement?.tags || []).map((tag: string) =>
        tag.toLowerCase()
      );

      const matchesSelectedFilters =
        activeTags.length === 0 || tags.some((tag: string) => activeTags.includes(tag));

      const matchesSearchQuery =
        searchQuery === "" || tags.some((tag: string) => tag.includes(searchQuery));

      return matchesSelectedFilters && matchesSearchQuery;
    });

    setFilteredTemplates(filtered);
  }, [filters, propsTemplates, searchQuery]);

  return (
    <div className="h-screen" style={{ backgroundColor: "#1B1D21" }}>
      {/* Main Content Area */}
      <div className="h-full flex flex-col" style={{ marginLeft: "64px", width: "calc(100% - 64px)" }}>
        {/* ViewTitle Container */}
        <div className="w-full bg-[#1e2327] flex items-center border-b border-[#454446] h-16" style={{ marginLeft: "-64px", width: "calc(100vw - 64px)", height: "64px !important", minHeight: "64px", maxHeight: "64px", paddingLeft: "12px" }}>
          
          {/* Title text */}
          <div className="font-semibold text-[#ffffff] text-[18px] whitespace-nowrap">
            Awards Generator
          </div>
        </div>
        
        {/* Parent Container for Left and Right */}
        <div className="w-full flex" style={{ marginLeft: "-64px", width: "calc(100vw - 64px)" }}>
          {/* Left Container - Fixed Height (3 parts) */}
          <div className="w-3/12 h-full overflow-y-auto flex">
            {/* Awards Generator Side Navigation - Now inside left container */}
            <div className="w-[94px] h-full" style={{ marginTop: "20px" }}>
              <DigitalAwardsSideNav
                currentStep={currentStep}
                onStepChange={handleStepChange}
              />
            </div>
            
            {/* Content area */}
            <div
              className="flex-1"
              style={{ backgroundColor: "#212327", padding: "20px" }}
            >
              {showTemplateDetail && currentStep === "awards" ? (
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
              )}
            </div>
          </div>

          {/* Right Container - Fixed, Full Height (9 parts) */}
          <div className="w-9/12 h-full flex flex-col">
            {/* Content Area */}
            <div
              className="flex-1 overflow-y-auto px-6"
              style={{ backgroundColor: "#1B1D21" }}
            >
            {showTemplateDetail ||
            (currentStep === "company" && selectedTemplate) ||
            (currentStep === "background" && selectedTemplate) ? (
              /* Template Detail View */
              <div className="h-full flex flex-col items-center justify-start">
                {/* Template Detail Title */}
                <div className="w-full mb-6" style={{ marginTop: "20px" }}>
                  <h1 className="text-[30px] font-bold text-white mb-4">
                    Template Detail
                  </h1>
                </div>

                {/* Back Button */}
                <div className="w-full mb-6" style={{ marginTop: "-32px" }}>
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
                      {/* White Overlay with Stroke Line */}
                      <div
                        className="absolute top-0 left-0 right-0 bg-white border-b-2 border-gray-200"
                        style={{
                          height: "80px",
                          zIndex: 50,
                          borderRadius: "8px 8px 0 0",
                        }}
                      >
                        {/* Logo Container */}
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
                                    : selectedTemplate?.achievement
                                        ?.logoImage || ""
                                }
                                alt="Logo"
                                className="h-full max-h-[40px] w-auto object-contain"
                                style={{ maxHeight: "40px" }}
                              />
                            )}
                          </div>
                        )}

                        {/* Props Title Container */}
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
                      {/* Background Image Overlay */}
                      {(backgroundVisible || uploadedBackgroundFile) && (
                        <div
                          className="absolute inset-0 z-10 overflow-hidden"
                          style={{
                            borderRadius: "4px",
                            width: "600px",
                            height: "480px",
                          }}
                        >
                          <img
                            src={
                              uploadedBackgroundFile
                                ? URL.createObjectURL(uploadedBackgroundFile)
                                : selectedTemplate?.achievement
                                    ?.backgroundImage || ""
                            }
                            alt="Background"
                            className="w-full h-full object-cover rounded"
                            style={{
                              borderRadius: "4px",
                              minWidth: "600px",
                              minHeight: "480px",
                              objectFit: "cover",
                              objectPosition: "center",
                            }}
                          />
                        </div>
                      )}
                      <img
                        src={selectedTemplate?.achievement?.props || ""}
                        alt="Selected Template"
                        className="object-contain rounded relative z-20"
                        style={{
                          borderRadius: "4px",
                          width: "600px",
                          height: "480px",
                          objectPosition: "bottom",
                        }}
                      />

                      {/* Props Recipients Text Container */}
                      {propsRecipients && propsRecipients.length > 0 && (
                        <div
                          className="absolute z-30 bg-gradient-to-r from-[#ADAFBE] via-[#4F7295] to-[#ADAFBE] opacity-80 rounded-lg p-2"
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

                      {/* From Section Text Container - Independent */}
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
                                  {new Date(fromDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "2-digit",
                                      day: "2-digit",
                                      year: "2-digit",
                                    }
                                  )}
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
                  )}
                </div>
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
                    Choose a template for your achievement. You can update this later in saved awards.
                  </p>
                </div>
                
                {activeTab === "props" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-start pb-6 h-full">
                    {/* Props Template 1 */}
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
                          {/* White Overlay with Stroke Line */}
                          <div
                            className="absolute top-0 left-0 right-0 bg-white border-b-2 border-gray-200"
                            style={{
                              height: "20%",
                              zIndex: 50,
                              borderRadius: "4px 4px 0 0",
                            }}
                          >
                            {/* Logo Container */}
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
          </div>
        </div>
        </div>
      </div>

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
    </div>
  );
} 