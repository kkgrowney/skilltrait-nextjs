"use client";

import React, { useState } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import SideNavAuth from "./side_nav_auth";

export default function SideNavCollapsed() {
  const { currentView, setCurrentView } = useNavigation();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover Overlay - Expanded Navigation */}
      {isHovered && (
        <div className="absolute left-0 top-0 z-50">
          <SideNavAuth />
        </div>
      )}
      
      {/* Collapsed Navigation */}
      <aside className="bg-[#1F2327] w-[64px] h-screen fixed left-0 top-0 flex flex-col justify-between border-r border-[#454446]">
      {/* Top Section */}
      <div className="flex flex-col gap-2 p-3">
        {/* SkillTrait Icon */}
        <div className="h-[38px] relative flex justify-center items-center mb-2">
          <div className="flex justify-center items-center">
            <img
              src="/skilltrait_icon.svg"
              alt="SkillTrait"
              className="h-6 w-6"
            />
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-col gap-2">
          {/* Home - Active/Inactive State */}
          <div
            className={`flex items-center justify-center w-11 h-11 rounded-lg cursor-pointer transition-colors ${
              currentView === "home" 
                ? "bg-[#181d21]" 
                : "hover:bg-[#181d21] hover:bg-opacity-50"
            }`}
            onClick={() => setCurrentView("home")}
          >
            <div className="flex items-center justify-center w-full h-full">
              {/* Home Icon */}
              <img
                src="/profile.svg"
                alt="Profile"
                className="h-7 w-7"
                style={{
                  filter: currentView === "home" 
                    ? "brightness(0) saturate(100%) invert(84%) sepia(11%) saturate(6382%) hue-rotate(86deg) brightness(101%) contrast(107%)" // #00DF71
                    : "brightness(0) saturate(100%) invert(52%) sepia(8%) saturate(1234%) hue-rotate(202deg) brightness(94%) contrast(86%)" // #79828A
                }}
              />
            </div>
          </div>

          {/* Skills - Active/Inactive State */}
          <div
            className={`flex items-center justify-center w-11 h-11 rounded-lg cursor-pointer transition-colors ${
              currentView === "skills" 
                ? "bg-[#181d21]" 
                : "hover:bg-[#181d21] hover:bg-opacity-50"
            }`}
            onClick={() => setCurrentView("skills")}
          >
            <div className="flex items-center justify-center w-full h-full">
              {/* Skills Icon */}
              <img
                src="/skills.svg"
                alt="Skills"
                className="h-7 w-7 flex-shrink-0"
                style={{
                  filter: currentView === "skills" 
                    ? "brightness(0) saturate(100%) invert(84%) sepia(11%) saturate(6382%) hue-rotate(86deg) brightness(101%) contrast(107%)" // #00DF71
                    : "brightness(0) saturate(100%) invert(52%) sepia(8%) saturate(1234%) hue-rotate(202deg) brightness(94%) contrast(86%)" // #79828A
                }}
              />
            </div>
          </div>

          {/* Digital Awards - Active/Inactive State */}
          <div
            className={`flex items-center justify-center w-11 h-11 rounded-lg cursor-pointer transition-colors ${
              currentView === "digital-awards"
                ? "bg-[#181d21]"
                : "hover:bg-[#181d21] hover:bg-opacity-50"
            }`}
            onClick={() => setCurrentView("digital-awards")}
          >
            <div className="flex items-center justify-center w-full h-full">
              {/* Trophy Icon - Digital Awards */}
              <img
                src="/trophy_nav.svg"
                alt="Digital Awards"
                className="h-7 w-7 flex-shrink-0"
                style={{
                  filter: currentView === "digital-awards" 
                    ? "brightness(0) saturate(100%) invert(84%) sepia(11%) saturate(6382%) hue-rotate(86deg) brightness(101%) contrast(107%)" // #00DF71
                    : "brightness(0) saturate(100%) invert(52%) sepia(8%) saturate(1234%) hue-rotate(202deg) brightness(94%) contrast(86%)" // #79828A
                }}
              />
            </div>
          </div>

          {/* Team - Active/Inactive State */}
          <div
            className={`flex items-center justify-center w-11 h-11 rounded-lg cursor-pointer transition-colors ${
              currentView === "team"
                ? "bg-[#181d21]"
                : "hover:bg-[#181d21] hover:bg-opacity-50"
            }`}
            onClick={() => setCurrentView("team")}
          >
            <div className="flex items-center justify-center w-full h-full">
              {/* Team Icon */}
              <img
                src="/team.svg"
                alt="Team"
                className="h-7 w-7 flex-shrink-0"
                style={{
                  filter: currentView === "team" 
                    ? "brightness(0) saturate(100%) invert(84%) sepia(11%) saturate(6382%) hue-rotate(86deg) brightness(101%) contrast(107%)" // #00DF71
                    : "brightness(0) saturate(100%) invert(52%) sepia(8%) saturate(1234%) hue-rotate(202deg) brightness(94%) contrast(86%)" // #79828A
                }}
              />
            </div>
          </div>

          {/* Verifications - Hidden but functional */}
          <div
            className="hidden"
            onClick={() => setCurrentView("verifications")}
          >
            <div className="flex items-center justify-center w-full h-full">
              {/* Verifications Icon */}
              <img
                src="/verifications.svg"
                alt="Verifications"
                className="h-7 w-7 flex-shrink-0"
                style={{
                  filter: currentView === "verifications" 
                    ? "brightness(0) saturate(100%) invert(84%) sepia(11%) saturate(6382%) hue-rotate(86deg) brightness(101%) contrast(107%)" // #00DF71
                    : "brightness(0) saturate(100%) invert(52%) sepia(8%) saturate(1234%) hue-rotate(202deg) brightness(94%) contrast(86%)" // #79828A
                }}
              />
            </div>
          </div>

        </nav>
      </div>

      {/* Bottom CTA */}
      <div className="p-3 mt-auto mb-6">
        {/* Toggle button removed - navigation stays collapsed */}
      </div>
    </aside>
    </div>
  );
}
