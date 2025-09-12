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
    } else if (view === "verifications") {
      router.push("/verifications");
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
                src="/profile.svg"
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
                Profile
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
              {/* Skills Icon */}
              <img
                src="/skills.svg"
                alt="Skills"
                className="h-7 w-7 flex-shrink-0"
                style={{
                  filter:
                    currentView === "skills"
                      ? "brightness(0) saturate(100%) invert(84%) sepia(11%) saturate(6382%) hue-rotate(86deg) brightness(101%) contrast(107%)" // #00DF71
                      : "brightness(0) saturate(100%) invert(52%) sepia(8%) saturate(1234%) hue-rotate(202deg) brightness(94%) contrast(86%)", // #79828A
                }}
              />
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

          {/* Verifications - Active/Inactive State */}
          <div
            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
              currentView === "verifications" ? "bg-[#181d21]" : "hover:bg-[#2a2e32]"
            }`}
            onClick={() => handleNavigationClick("verifications")}
          >
            <div className="flex items-center gap-3 pl-2">
              {/* Verifications Icon */}
              <img
                src="/verifications.svg"
                alt="Verifications"
                className="h-7 w-7 flex-shrink-0"
                style={{
                  filter:
                    currentView === "verifications"
                      ? "brightness(0) saturate(100%) invert(84%) sepia(11%) saturate(6382%) hue-rotate(86deg) brightness(101%) contrast(107%)" // #00DF71
                      : "brightness(0) saturate(100%) invert(52%) sepia(8%) saturate(1234%) hue-rotate(202deg) brightness(94%) contrast(86%)", // #79828A
                }}
              />
              <span
                className={`font-medium text-base leading-none ${
                  currentView === "verifications" ? "text-[#00df71]" : "text-[#79828a]"
                }`}
              >
                Verifications
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
