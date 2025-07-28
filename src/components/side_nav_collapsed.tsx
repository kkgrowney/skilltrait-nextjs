"use client";

import React from "react";
import { useNavigation } from "@/contexts/NavigationContext";

export default function SideNavCollapsed() {
  const { toggleCollapsed } = useNavigation();

  return (
    <aside className="bg-[#1F2327] w-[54px] h-screen fixed left-0 top-0 flex flex-col justify-between border-r border-[#454446]">
      {/* Top Section */}
      <div className="flex flex-col gap-2 p-3">
        {/* SkillTrait Icon */}
        <div className="h-[38px] relative flex justify-center items-center mb-2">
          <div
            className="flex justify-center items-center cursor-pointer hover:opacity-80"
            onClick={toggleCollapsed}
          >
            <img
              src="/skilltrait_icon.svg"
              alt="SkillTrait"
              className="h-[18.849px] w-[21.559px]"
            />
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-col gap-2 items-center">
          {/* Home - Active State */}
          <div className="bg-[#181d21] flex items-center justify-center w-10 h-10 rounded-lg">
            <img
              src="/home.svg"
              alt="Home"
              className="h-5 w-5"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)",
              }}
            />
          </div>

          {/* Companies - Inactive with Hover */}
          <div className="group cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#181d21] transition-all">
            <img
              src="/company.svg"
              alt="Companies"
              className="h-5 w-5 transition-all group-hover:filter group-hover:invert group-hover:brightness-100"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(84%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(89%) contrast(86%)",
              }}
            />
          </div>
        </nav>
      </div>

      {/* Bottom CTA */}
      <div className="p-3 mt-auto mb-6">
        <button
          onClick={toggleCollapsed}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-[#202327] cursor-pointer group transition-all"
        >
          <img
            src="/chevron-double-left-outline.svg"
            alt="Expand"
            className="h-3 w-3 rotate-180 transition-all group-hover:filter group-hover:invert group-hover:brightness-100"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(84%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(89%) contrast(86%)",
            }}
          />
        </button>
      </div>
    </aside>
  );
}
