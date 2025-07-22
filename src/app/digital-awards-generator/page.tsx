"use client";

import { useEffect, useState } from "react";
import DigitalAwardsSideNav, {
  StepType,
} from "@/components/DigitalAwardsSideNav";
import {
  AwardsStep,
  CompanyStep,
  BackgroundStep,
  DetailsStep,
  ShareStep,
} from "@/components/digital-awards";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../lib/firebase"; // adjust path if needed

export default function DigitalAwardsPage() {
  const [currentStep, setCurrentStep] = useState<StepType>("awards");
  const [activeTab, setActiveTab] = useState<"props" | "achievements">("props");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplateDetail, setShowTemplateDetail] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [propsTemplates, setPropsTemplates] = useState<string[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

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

  const handleTemplateSelect = (templateSrc: string) => {
    setSelectedTemplate(templateSrc);
    setShowTemplateDetail(true);
    // Don't change the current step - stay on Awards
  };

  const handleBackToTemplates = () => {
    setShowTemplateDetail(false);
    setSelectedTemplate(null);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "awards":
        return <AwardsStep onTabChange={setActiveTab} />;
      case "company":
        return (
          <CompanyStep
            onNext={handleNext}
            onPrevious={handlePrevious}
            selectedTemplate={selectedTemplate}
          />
        );
      case "background":
        return (
          <BackgroundStep onNext={handleNext} onPrevious={handlePrevious} />
        );
      case "details":
        return <DetailsStep onNext={handleNext} onPrevious={handlePrevious} />;
      case "share":
        return <ShareStep onPrevious={handlePrevious} />;
      default:
        return <AwardsStep onTabChange={setActiveTab} />;
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

        // Filter templates that have 'achievement.props'
        const templatesWithProps = templates.filter(
          (t) => t.achievement && t.achievement.props
        );

        // Extract props image URLs
        const propsImages = templatesWithProps.map((t) => t.achievement.props);

        setPropsTemplates(propsImages);
        // You may also want to store propsImages in a separate state:
        // setPropsImages(propsImages);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

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
                (currentStep === "company" && selectedTemplate)
                  ? "Template Detail"
                  : activeTab === "props"
                  ? "Props Templates"
                  : "Achievement Templates"}
              </h1>
              {!(
                showTemplateDetail ||
                (currentStep === "company" && selectedTemplate)
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
              (currentStep === "company" && selectedTemplate) ? (
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
                      <img
                        src={selectedTemplate}
                        alt="Selected Template"
                        className="max-w-full max-h-auto object-contain rounded"
                        style={{ borderRadius: "4px" }}
                      />
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
                      {loadingTemplates ? (
                        <p className="text-white">Loading templates...</p>
                      ) : (
                        propsTemplates.map((template, index) => (
                          <div
                            key={index}
                            className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-white rounded"
                            style={{
                              borderRadius: "4px",
                              aspectRatio: "600/400",
                            }}
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <img
                              src={template}
                              alt={`Props Template ${index + 1}`}
                              className="w-full h-full object-contain"
                              style={{ borderRadius: "4px" }}
                            />
                          </div>
                        ))
                      )}
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
