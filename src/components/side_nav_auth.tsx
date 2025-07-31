"use client";

import React from "react";
import { useNavigation } from "@/contexts/NavigationContext";

export default function SideNavAuth() {
  const { toggleCollapsed, currentView, setCurrentView } = useNavigation();

  return (
    <aside className="bg-[#1F2327] w-60 h-screen fixed left-0 top-0 flex flex-col justify-between border-r border-[#454446]">
      {/* Top Section */}
      <div className="flex flex-col gap-2 p-3">
        {/* SkillTrait Logo */}
        <div className="h-[38px] relative flex justify-center items-center mb-2">
          <img
            src="/skilltrait_dark.svg"
            alt="SkillTrait"
            className="h-6 w-auto"
          />
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-col gap-2">
          {/* Home - Active/Inactive State */}
          <div
            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
              currentView === "home" 
                ? "bg-[#181d21]" 
                : "hover:bg-[#2a2e32]"
            }`}
            onClick={() => setCurrentView("home")}
          >
            <div className="flex items-center gap-3 pl-2">
              {/* Home Icon */}
              <img
                src="/home_nav.svg"
                alt="Home"
                className="h-7 w-7"
                style={{
                  filter: currentView === "home" 
                    ? "brightness(0) saturate(100%) invert(84%) sepia(11%) saturate(6382%) hue-rotate(86deg) brightness(101%) contrast(107%)" // #00DF71
                    : "brightness(0) saturate(100%) invert(52%) sepia(8%) saturate(1234%) hue-rotate(202deg) brightness(94%) contrast(86%)" // #79828A
                }}
              />
              <span
                className={`font-medium text-base ${
                  currentView === "home" ? "text-[#00df71]" : "text-[#79828a]"
                }`}
              >
                Home
              </span>
            </div>
          </div>

          {/* Digital Awards - Active/Inactive State */}
          <div
            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
              currentView === "digital-awards"
                ? "bg-[#181d21]"
                : "hover:bg-[#2a2e32]"
            }`}
            onClick={() => setCurrentView("digital-awards")}
          >
            <div className="flex items-center gap-3 pl-2">
              {/* Trophy Icon - Digital Awards */}
              <img
                src="/trophy_nav.svg"
                alt="Digital Awards"
                className="h-7 w-7"
                style={{
                  filter: currentView === "digital-awards" 
                    ? "brightness(0) saturate(100%) invert(84%) sepia(11%) saturate(6382%) hue-rotate(86deg) brightness(101%) contrast(107%)" // #00DF71
                    : "brightness(0) saturate(100%) invert(52%) sepia(8%) saturate(1234%) hue-rotate(202deg) brightness(94%) contrast(86%)" // #79828A
                }}
              />
              <span
                className={`font-medium text-base ${
                  currentView === "digital-awards"
                    ? "text-[#00df71]"
                    : "text-[#79828a]"
                }`}
              >
                Digital Awards
              </span>
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom CTA */}
      <div className="p-3 mt-auto mb-6">
        <button className="w-full bg-[#00dc79] text-[#2b2a2d] font-medium text-xs rounded-lg py-2">
          Try Premium for 30 days
        </button>
      </div>
    </aside>
  );
}
