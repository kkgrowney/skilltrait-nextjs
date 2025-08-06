"use client";

import React from "react";

export default function SlackAppPage() {
  return (
    <div className="min-h-screen bg-[#1B1D21] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Slack App
            </h1>
            <p className="text-xl text-gray-300">
              Integrate SkillTrait with your Slack workspace
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-[#212327] rounded-lg shadow-lg border border-[#454446] p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Features */}
              <div>
                <h2 className="text-2xl font-semibold text-white mb-6">
                  Features
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#00DF71] rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-4 h-4 text-[#212327]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300">
                      Real-time skill verification notifications
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#00DF71] rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-4 h-4 text-[#212327]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300">
                      Automated achievement sharing
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#00DF71] rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-4 h-4 text-[#212327]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300">
                      Team collaboration tools
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#00DF71] rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-4 h-4 text-[#212327]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300">
                      Custom slash commands
                    </span>
                  </li>
                </ul>
              </div>

              {/* Right Column - Installation */}
              <div>
                <h2 className="text-2xl font-semibold text-white mb-6">
                  Get Started
                </h2>
                <div className="space-y-4">
                  <div className="bg-[#1A1D21] rounded-lg p-4 border border-[#454446]">
                    <h3 className="text-lg font-medium text-white mb-2">
                      Install Slack App
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Add SkillTrait to your Slack workspace to start sharing achievements and verifying skills.
                    </p>
                    <button className="bg-[#00DF71] text-[#212327] px-6 py-2 rounded-lg font-medium hover:bg-[#0AFB84] transition-colors">
                      Add to Slack
                    </button>
                  </div>
                  
                  <div className="bg-[#1A1D21] rounded-lg p-4 border border-[#454446]">
                    <h3 className="text-lg font-medium text-white mb-2">
                      Documentation
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Learn how to use the Slack app features and configure your workspace.
                    </p>
                    <a 
                      href="#" 
                      className="text-[#00DF71] hover:text-[#0AFB84] font-medium transition-colors"
                    >
                      View Documentation →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-12 pt-8 border-t border-[#454446]">
              <h3 className="text-xl font-semibold text-white mb-4">
                How it Works
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#00DF71] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#212327] font-bold text-lg">1</span>
                  </div>
                  <h4 className="text-white font-medium mb-2">Install</h4>
                  <p className="text-gray-300 text-sm">
                    Add the SkillTrait app to your Slack workspace
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#00DF71] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#212327] font-bold text-lg">2</span>
                  </div>
                  <h4 className="text-white font-medium mb-2">Connect</h4>
                  <p className="text-gray-300 text-sm">
                    Link your SkillTrait account to Slack
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#00DF71] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#212327] font-bold text-lg">3</span>
                  </div>
                  <h4 className="text-white font-medium mb-2">Share</h4>
                  <p className="text-gray-300 text-sm">
                    Start sharing achievements and verifying skills
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 