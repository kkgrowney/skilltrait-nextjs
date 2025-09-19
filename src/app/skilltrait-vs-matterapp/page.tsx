'use client';

import React from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const features = [
  { name: "Digital Awards Creation", skilltrait: true, matter: false },
  { name: "Skill Verification", skilltrait: true, matter: true },
  { name: "Team Collaboration", skilltrait: true, matter: false },
  { name: "LinkedIn Integration", skilltrait: true, matter: true },
  { name: "Custom Templates", skilltrait: true, matter: false },
  { name: "Real-time Analytics", skilltrait: false, matter: true },
  { name: "Slack Integration", skilltrait: true, matter: false },
  { name: "Mobile App", skilltrait: false, matter: true },
  { name: "API Access", skilltrait: true, matter: true },
  { name: "Enterprise Features", skilltrait: true, matter: false },
];

export default function SkillTraitVsMatterApp() {
  return (
    <div className="min-h-screen bg-[#1A1D21] text-white">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 font-poppins">
          Quick comparison guide
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-poppins">
          SkillTrait offers a comprehensive all-in-one solution for digital awards, 
          skill verification, and team collaboration that goes beyond what Matter App provides.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* Desktop/Tablet Layout */}
        <div className="hidden md:block bg-[#212327] rounded-2xl shadow-2xl overflow-hidden border border-[#454446]">
          <div className="grid grid-cols-3 bg-[#2A2D32] border-b-2 border-[#454446]">
            <div className="p-6 text-left">
              <h3 className="text-xl font-bold text-white font-poppins">Features</h3>
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-[#00df71] font-poppins">SkillTrait</h3>
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-400 font-poppins">Matter App</h3>
            </div>
          </div>
          
          {features.map((feature, index) => (
            <div 
              key={feature.name}
              className={`grid grid-cols-3 border-b border-[#454446] ${
                index % 2 === 0 ? 'bg-[#212327]' : 'bg-[#2A2D32]'
              }`}
            >
              <div className="p-6 text-left">
                <span className="text-lg text-white font-poppins">{feature.name}</span>
              </div>
              <div className="p-6 text-center">
                {feature.skilltrait ? (
                  <CheckIcon className="h-8 w-8 text-[#00df71] mx-auto" />
                ) : (
                  <XMarkIcon className="h-8 w-8 text-red-400 mx-auto" />
                )}
              </div>
              <div className="p-6 text-center">
                {feature.matter ? (
                  <CheckIcon className="h-8 w-8 text-[#00df71] mx-auto" />
                ) : (
                  <XMarkIcon className="h-8 w-8 text-red-400 mx-auto" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          {features.map((feature, index) => (
            <div key={feature.name} className="bg-[#212327] rounded-xl shadow-lg overflow-hidden border border-[#454446]">
              <div className="p-4 border-b border-[#454446]">
                <h4 className="text-lg font-bold text-white font-poppins">{feature.name}</h4>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-4 text-center border-r border-[#454446]">
                  <div className="text-sm font-semibold text-[#00df71] mb-2 font-poppins">SkillTrait</div>
                  {feature.skilltrait ? (
                    <CheckIcon className="h-6 w-6 text-[#00df71] mx-auto" />
                  ) : (
                    <XMarkIcon className="h-6 w-6 text-red-400 mx-auto" />
                  )}
                </div>
                <div className="p-4 text-center">
                  <div className="text-sm font-semibold text-gray-400 mb-2 font-poppins">Matter App</div>
                  {feature.matter ? (
                    <CheckIcon className="h-6 w-6 text-[#00df71] mx-auto" />
                  ) : (
                    <XMarkIcon className="h-6 w-6 text-red-400 mx-auto" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call-to-Action Section */}
      <div className="max-w-4xl mx-auto px-4 pb-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
          Ready to get started with SkillTrait?
        </h2>
        <p className="text-xl text-gray-300 mb-8 font-poppins">
          Join thousands of teams who trust SkillTrait for their digital awards and skill verification needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/digital-awards-generator"
            className="bg-[#00df71] hover:bg-[#00c966] text-black font-bold py-4 px-8 rounded-full text-lg transition-colors duration-200 font-poppins"
          >
            Try SkillTrait Free
          </a>
          <a
            href="/pricing"
            className="border-2 border-[#00df71] text-[#00df71] hover:bg-[#00df71] hover:text-black font-bold py-4 px-8 rounded-full text-lg transition-colors duration-200 font-poppins"
          >
            View Pricing
          </a>
        </div>
      </div>
    </div>
  );
}
