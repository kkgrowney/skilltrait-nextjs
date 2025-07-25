"use client";

import { useEffect, useState } from "react";
import DigitalAwardsSideNav, {
  StepType,
} from "@/components/DigitalAwardsSideNav";
import {
  AwardsStep,
  CompanyStep,
  BackgroundStep,
  PropsDetailsStep,
  DetailsStep,
  ShareStep,
} from "@/components/digital-awards";
import CompanyButtonOverlay from "@/components/CompanyButtonOverlay";
import { companyNames } from "@/lib/companyNames";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  const [uploadedBackgroundFile, setUploadedBackgroundFile] = useState<File | null>(null);
  const [backgroundNameText, setBackgroundNameText] = useState<string>("");
  const [propsTitle, setPropsTitle] = useState<string>("");
  const [propsRecipients, setPropsRecipients] = useState<string[]>([]);
  const [fromName, setFromName] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [fromMessage, setFromMessage] = useState<string>("");
  const [filters, setFilters] = useState<{ [tag: string]: boolean }>({});
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

    if (step === "details" && !selectedTemplate) {
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
      "details",
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
      "details",
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

  const handleChangeSearch = (e) => {
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
            defaultBackgroundUrl={selectedTemplate?.achievement?.backgroundImage}
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
      case "details":
        return <DetailsStep onNext={handleNext} onPrevious={handlePrevious} />;
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
        activeTags.length === 0 || tags.some((tag) => activeTags.includes(tag));

      const matchesSearchQuery =
        searchQuery === "" || tags.some((tag) => tag.includes(searchQuery));

      return matchesSelectedFilters && matchesSearchQuery;
    });

    setFilteredTemplates(filtered);
  }, [filters, propsTemplates, searchQuery]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1B1D21" }}>
      {/* Fixed Side Navigation */}
      <DigitalAwardsSideNav
        currentStep={currentStep}
        onStepChange={handleStepChange}
      />

      {/* Main Content with Sticky Nav */}
      <div className="h-screen">
        <div className="flex h-full">
          {/* Side Navigation - Fixed width of 94px */}
          <div className="w-[94px] h-full flex-shrink-0">
            {/* Fixed side nav is now positioned absolutely */}
          </div>

          {/* Left Container - Fixed Height (3 parts) */}
          <div className="w-3/12 h-full overflow-y-auto">
            <div
              className="h-full"
              style={{ backgroundColor: "#212327", padding: "20px" }}
            >
              {showTemplateDetail && currentStep === "awards" ? (
                <AwardsStep onTabChange={setActiveTab} />
              ) : (
                renderCurrentStep()
              )}
            </div>
          </div>

          {/* Right Container - Fixed, Full Height (9 parts) */}
          <div className="w-9/12 h-full flex flex-col">
            {/* Fixed Header */}
            <div
              className="flex-shrink-0 px-6 pt-5"
              style={{ backgroundColor: "#1B1D21" }}
            >
              <h1 className="text-[30px] font-bold text-white mb-4">
                {showTemplateDetail ||
                (currentStep === "company" && selectedTemplate) ||
                (currentStep === "background" && selectedTemplate)
                  ? "Template Detail"
                  : activeTab === "props"
                  ? "Props Templates"
                  : "Achievement Templates"}
              </h1>
              {!(
                showTemplateDetail ||
                (currentStep === "company" && selectedTemplate) ||
                (currentStep === "background" && selectedTemplate)
              ) && (
                <p className="text-md text-gray-300 mb-6">
                  Choose a template for your achievement. You can update this
                  later in saved awards.
                </p>
              )}
            </div>

            {/* Content Area */}
            <div
              className="flex-1 overflow-y-auto px-6"
              style={{ backgroundColor: "#1B1D21" }}
            >
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
                          height: "480px"
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
                                      : selectedTemplate.achievement.logoImage
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
                                  : selectedTemplate.achievement.backgroundImage
                              }
                              alt="Background"
                              className="w-full h-full object-cover rounded"
                              style={{ 
                                borderRadius: "4px",
                                minWidth: "600px",
                                minHeight: "480px",
                                objectFit: "cover",
                                objectPosition: "center"
                              }}
                            />
                          </div>
                        )}
                        <img
                          src={selectedTemplate.achievement.props}
                          alt="Selected Template"
                          className="object-contain rounded relative z-20"
                          style={{ 
                            borderRadius: "4px",
                            width: "600px",
                            height: "480px",
                            objectPosition: "bottom"
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
                              position: "absolute"
                            }}
                          >
                            <p className="text-white text-sm font-medium mb-1">Props recipients:</p>
                                                    <p className="text-white text-base font-medium" style={{ lineHeight: '1.2' }}>
                          {propsRecipients.join(', ')}
                        </p>
                            
                            {/* From Section Text Container - Child of Recipients Container */}
                            {(fromName || fromDate || fromMessage) && (
                              <div
                                className="absolute z-30 bg-gradient-to-r from-[#ADAFBE] via-[#4F7295] to-[#ADAFBE] opacity-80 rounded-lg p-2"
                                style={{
                                  left: "0px",
                                  top: "calc(100% + 12px)",
                                  maxWidth: "280px",
                                  minHeight: "60px"
                                }}
                              >
                                {fromName && (
                                  <div className="flex justify-between items-center mb-2">
                                    <p className="text-white text-sm font-medium">From: {fromName}</p>
                                    {fromDate && (
                                      <p className="text-white text-sm font-medium">
                                        {new Date(fromDate).toLocaleDateString('en-US', {
                                          month: '2-digit',
                                          day: '2-digit',
                                          year: '2-digit'
                                        })}
                                      </p>
                                    )}
                                  </div>
                                )}
                                {fromMessage && (
                                  <p className="text-white text-base mb-2" style={{ lineHeight: '1.2' }}>
                                    {fromMessage}
                                  </p>
                                )}

                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* From Section Text Container - When no recipients */}
                        {(!propsRecipients || propsRecipients.length === 0) && (fromName || fromDate || fromMessage) && (
                          <div
                            className="absolute z-30 bg-gradient-to-r from-[#ADAFBE] via-[#4F7295] to-[#ADAFBE] opacity-80 rounded-lg p-2"
                            style={{
                              left: "20px",
                              top: "92px",
                              maxWidth: "280px",
                              minHeight: "60px"
                            }}
                          >
                            {fromName && (
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-white text-sm font-medium">From: {fromName}</p>
                                {fromDate && (
                                  <p className="text-white text-sm font-medium">
                                    {new Date(fromDate).toLocaleDateString('en-US', {
                                      month: '2-digit',
                                      day: '2-digit',
                                      year: '2-digit'
                                    })}
                                  </p>
                                )}
                              </div>
                            )}
                            {fromMessage && (
                              <p className="text-white text-base mb-2" style={{ lineHeight: '1.2' }}>
                                {fromMessage}
                              </p>
                            )}

                          </div>
                        )}
                        {/* Button Overlay - Hidden */}
                        {/* <div
                          className="absolute inset-0 flex items-end justify-start pb-4"
                          style={{ paddingLeft: "24px" }}
                        >
                          <div
                            className="bg-black border border-white rounded-full px-3 py-1 flex items-center justify-center"
                            style={{
                              fontSize: "14px",
                              lineHeight: "1.5",
                              minHeight: "29px",
                              backgroundColor: "rgba(0, 0, 0, 0.5)",
                            }}
                          >
                            <span className="font-semibold text-white text-center whitespace-nowrap">
                              {getCompanyName(0)}
                            </span>
                          </div>
                        </div> */}
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
                  {activeTab === "props" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-start pb-6 h-full">
                      {/* Props Template 1 */}
                      {filteredTemplates?.map((temp) => (
                        <div
                          className="w-full cursor-pointer hover:opacity-80 transition-opacity bg-white rounded"
                          style={{
                            borderRadius: "4px",
                            aspectRatio: "600/400",
                          }}
                        >
                          <div
                            onClick={() =>
                              handleTemplateSelect(temp)
                            }
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
                            {/* Button Overlay - Hidden */}
                            {/* <div
                              className="absolute inset-0 flex items-end justify-start pb-4"
                              style={{ paddingLeft: "24px" }}
                            >
                              <div
                                className="bg-black border border-white rounded-full px-3 py-1 flex items-center justify-center"
                                style={{
                                  fontSize: "14px",
                                  lineHeight: "1.5",
                                  minHeight: "29px",
                                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                                }}
                              >
                                <span className="font-semibold text-white text-center whitespace-nowrap">
                                  {temp.achievement.name}
                                </span>
                              </div>
                            </div> */}
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
                          onClick={() =>
                            handleTemplateSelect(
                              "/templates/achievements/achievements-1.png"
                            )
                          }
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
                          onClick={() =>
                            handleTemplateSelect(
                              "/templates/achievements/achievements-2.png"
                            )
                          }
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
                          onClick={() =>
                            handleTemplateSelect(
                              "/templates/achievements/achievements-3.png"
                            )
                          }
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
                          onClick={() =>
                            handleTemplateSelect(
                              "/templates/achievements/achievements-4.png"
                            )
                          }
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
                          onClick={() =>
                            handleTemplateSelect(
                              "/templates/achievements/achievements-5.png"
                            )
                          }
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
                          onClick={() =>
                            handleTemplateSelect(
                              "/templates/achievements/achievements-6.png"
                            )
                          }
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
                          onClick={() =>
                            handleTemplateSelect(
                              "/templates/achievements/achievements-7.png"
                            )
                          }
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
                          onClick={() =>
                            handleTemplateSelect(
                              "/templates/achievements/achievements-8.png"
                            )
                          }
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
                          onClick={() =>
                            handleTemplateSelect(
                              "/templates/achievements/achievements-9.png"
                            )
                          }
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
    </div>
  );
}
