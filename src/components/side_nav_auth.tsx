"use client";

import React from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { useRouter } from "next/navigation";

interface SideNavAuthProps {
  onNavigationClick?: () => void;
  isMobileOpen?: boolean;
}

export default function SideNavAuth({
  onNavigationClick,
  isMobileOpen,
}: SideNavAuthProps) {
  const { currentView, setCurrentView } = useNavigation();
  const router = useRouter();

  const handleNavigationClick = (view: string) => {
    setCurrentView(view as any);

    // Use Next.js routing for navigation
    if (view === "home") {
      router.push("/profile");
    } else if (view === "skills") {
      router.push("/skills");
    } else if (view === "digital-awards") {
      router.push("/digital-awards-generator");
    } else if (view === "team") {
      router.push("/team");
    }

    onNavigationClick?.();
  };

  return (
    <aside
      className={`bg-[#1F2327] w-60 h-screen fixed left-0 top-0 flex flex-col justify-between ${
        isMobileOpen ? "" : "border-r border-[#454446]"
      }`}
    >
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
              currentView === "home" ? "bg-[#181d21]" : "hover:bg-[#2a2e32]"
            }`}
            onClick={() => handleNavigationClick("home")}
          >
            <div className="flex items-center gap-3 pl-2">
              {/* Home Icon */}
              <img
                src="/home_nav.svg"
                alt="Home"
                className="h-7 w-7 flex-shrink-0"
                style={{
                  filter:
                    currentView === "home"
                      ? "brightness(0) saturate(100%) invert(84%) sepia(11%) saturate(6382%) hue-rotate(86deg) brightness(101%) contrast(107%)" // #00DF71
                      : "brightness(0) saturate(100%) invert(52%) sepia(8%) saturate(1234%) hue-rotate(202deg) brightness(94%) contrast(86%)", // #79828A
                }}
              />
              <span
                className={`font-medium text-base leading-none ${
                  currentView === "home" ? "text-[#00df71]" : "text-[#79828a]"
                }`}
              >
                Home
              </span>
            </div>
          </div>

          {/* Skills - Active/Inactive State */}
          <div
            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
              currentView === "skills" ? "bg-[#181d21]" : "hover:bg-[#2a2e32]"
            }`}
            onClick={() => handleNavigationClick("skills")}
          >
            <div className="flex items-center gap-3 pl-2">
              {/* Skills Icon - Placeholder */}
              <div className="h-7 w-7 flex-shrink-0 bg-[#454446] rounded flex items-center justify-center">
                <svg 
                  className="h-4 w-4 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                  />
                </svg>
              </div>
              <span
                className={`font-medium text-base leading-none ${
                  currentView === "skills" ? "text-[#00df71]" : "text-[#79828a]"
                }`}
              >
                Skills
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
            onClick={() => handleNavigationClick("digital-awards")}
          >
            <div className="flex items-center gap-3 pl-2">
              {/* Trophy Icon - Digital Awards */}
              <img
                src="/trophy_nav.svg"
                alt="Digital Awards"
                className="h-7 w-7 flex-shrink-0"
                style={{
                  filter:
                    currentView === "digital-awards"
                      ? "brightness(0) saturate(100%) invert(84%) sepia(11%) saturate(6382%) hue-rotate(86deg) brightness(101%) contrast(107%)" // #00DF71
                      : "brightness(0) saturate(100%) invert(52%) sepia(8%) saturate(1234%) hue-rotate(202deg) brightness(94%) contrast(86%)", // #79828A
                }}
              />
              <span
                className={`font-medium text-base leading-none ${
                  currentView === "digital-awards"
                    ? "text-[#00df71]"
                    : "text-[#79828a]"
                }`}
              >
                Digital Awards
              </span>
            </div>
          </div>

          {/* Team - Active/Inactive State */}
          <div
            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
              currentView === "team" ? "bg-[#181d21]" : "hover:bg-[#2a2e32]"
            }`}
            onClick={() => handleNavigationClick("team")}
          >
            <div className="flex items-center gap-3 pl-2">
              {/* Team Icon */}
              <img
                src="/team.svg"
                alt="Team"
                className="h-7 w-7 flex-shrink-0"
                style={{
                  filter:
                    currentView === "team"
                      ? "brightness(0) saturate(100%) invert(84%) sepia(11%) saturate(6382%) hue-rotate(86deg) brightness(101%) contrast(107%)" // #00DF71
                      : "brightness(0) saturate(100%) invert(52%) sepia(8%) saturate(1234%) hue-rotate(202deg) brightness(94%) contrast(86%)", // #79828A
                }}
              />
              <span
                className={`font-medium text-base leading-none ${
                  currentView === "team" ? "text-[#00df71]" : "text-[#79828a]"
                }`}
              >
                Team
              </span>
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 mt-auto">
        {/* Premium CTA */}
        <button className="w-full bg-[#00dc79] text-[#2b2a2d] font-medium text-xs rounded-lg py-2">
          Try Premium for 30 days
        </button>
      </div>
    </aside>
  );
}
