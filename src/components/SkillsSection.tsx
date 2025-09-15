'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SkillsSectionProps {
  userId: string;
}

export default function SkillsSection({ userId }: SkillsSectionProps) {
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // Helper function to get proficiency level number
  const getProficiencyNumber = (proficiency: string | number): number => {
    // If it's already a number, return it
    if (typeof proficiency === 'number') {
      return proficiency;
    }
    
    const proficiencyMap: { [key: string]: number } = {
      'Beginner': 1,
      'Intermediate': 2,
      'Advanced': 3,
      'Expert': 4,
      'Master': 5
    };
    return proficiencyMap[proficiency] || 0;
  };

  // Helper function to get motivation level number
  const getMotivationNumber = (motivation: string | number): number => {
    // If it's already a number, return it
    if (typeof motivation === 'number') {
      return motivation;
    }
    
    const motivationMap: { [key: string]: number } = {
      'Very Low': 1,
      'Low': 2,
      'Moderate': 3,
      'High': 4,
      'Very High': 5
    };
    return motivationMap[motivation] || 0;
  };

  // Helper function to get proficiency level text
  const getProficiencyText = (proficiency: string | number): string => {
    if (typeof proficiency === 'string') {
      return proficiency;
    }
    
    const proficiencyTextMap: { [key: number]: string } = {
      1: 'Beginner',
      2: 'Intermediate',
      3: 'Advanced',
      4: 'Expert',
      5: 'Master'
    };
    return proficiencyTextMap[proficiency] || 'Unknown';
  };

  // Helper function to get motivation level text
  const getMotivationText = (motivation: string | number): string => {
    if (typeof motivation === 'string') {
      return motivation;
    }
    
    const motivationTextMap: { [key: number]: string } = {
      1: 'Very Low',
      2: 'Low',
      3: 'Moderate',
      4: 'High',
      5: 'Very High'
    };
    return motivationTextMap[motivation] || 'Unknown';
  };

  // Fetch skills from top-level skills collection
  const fetchUserSkills = async (userId: string) => {
    if (!userId) return;
    
    setSkillsLoading(true);
    try {
      // Query skills collection where userRef matches the user ID
      const skillsQuery = query(
        collection(db, 'skills'),
        where('userRef', '==', doc(db, 'users', userId))
      );
      
      const skillsSnapshot = await getDocs(skillsQuery);
      const skillsData = skillsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Fetched skills for user:', userId, skillsData);
      setUserSkills(skillsData);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setSkillsLoading(false);
    }
  };

  // Fetch skills when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchUserSkills(userId);
    }
  }, [userId]);

  // Toggle skill expansion
  const toggleSkillExpansion = (skillId: string) => {
    setExpandedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillId)) {
        newSet.delete(skillId);
      } else {
        newSet.add(skillId);
      }
      return newSet;
    });
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-2">
        Skills
      </h3>
      
      {skillsLoading ? (
        <div className="text-gray-400 text-sm">
          Loading skills...
        </div>
      ) : userSkills && userSkills.length > 0 ? (
        <>
          {/* Skills buttons - left to right with wrapping */}
          <div className="flex flex-row flex-wrap gap-2 items-start justify-start w-full max-w-full overflow-hidden">
            {userSkills.map((skill, index) => {
              const skillId = skill.id || `skill-${index}`;
              const isExpanded = expandedSkills.has(skillId);
              const skillName = skill.name || skill.skill || 'Unknown Skill';
              const hasAnyExpanded = expandedSkills.size > 0;
              const shouldDim = hasAnyExpanded && !isExpanded;
              
              // Check if skill has detail information (proficiency, motivation, or description)
              const hasDetails = skill.proficiency || skill.motivation || skill.description;
              
              // Special case for "scrum" skill - always show as stroke button
              const isScrumSkill = skillName.toLowerCase().includes('scrum');
              
              if (!hasDetails || isScrumSkill) {
                // Green stroke button for skills without details
                return (
                  <div key={skillId} className="relative flex-shrink-0">
                    <button
                      className={`px-3 py-1 bg-[#1F2327] border border-[#00DF71] text-[#00DF71] text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0 max-w-full ${
                        shouldDim ? 'opacity-20' : 'opacity-100'
                      } ${isScrumSkill ? '' : 'hover:bg-[#00DF71] hover:text-[#1F2327]'}`}
                      onMouseEnter={() => setHoveredSkill(skillId)}
                      onMouseLeave={() => setHoveredSkill(null)}
                    >
                      <span>{skillName}</span>
                    </button>
                    
                    {/* Custom tooltip */}
                    {hoveredSkill === skillId && (
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-[9999]">
                        {isScrumSkill ? "No details available" : "No details"}
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800"></div>
                      </div>
                    )}
                  </div>
                );
              }
              
              // Green filled button for skills with details
              return (
                <button
                  key={skillId}
                  onClick={() => toggleSkillExpansion(skillId)}
                  className={`flex items-center gap-1 px-3 py-1 bg-[#00DF71] text-[#212327] text-xs font-medium rounded-full hover:bg-[#0AFB84] transition-all duration-200 whitespace-nowrap flex-shrink-0 max-w-full ${
                    shouldDim ? 'opacity-20' : 'opacity-100'
                  }`}
                >
                  <span>{skillName}</span>
                  <svg 
                    className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              );
            })}
          </div>
          
          {/* Expanded skill details - full width below skills */}
          {Array.from(expandedSkills).map(skillId => {
            const skill = userSkills.find(s => (s.id || `skill-${userSkills.indexOf(s)}`) === skillId);
            if (!skill) return null;
            
            const skillName = skill.name || skill.skill || 'Unknown Skill';
            
            return (
              <div 
                key={`${skillId}-${expandedSkills.size}`} 
                className="w-full mt-2 p-3 bg-[#1F2327] border border-[#454446] rounded-lg animate-in fade-in-0 slide-in-from-top-2 duration-300"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs">Skill:</span>
                    <button
                      onClick={() => {
                        // Navigate to skills page with this skill selected for detail view
                        window.location.href = `/skills?select=${encodeURIComponent(skillName)}`;
                      }}
                      className="text-[#00DF71] text-xs font-medium underline hover:text-[#0AFB84] transition-colors cursor-pointer"
                    >
                      {skillName}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs">Proficiency:</span>
                    <span className="text-[#00DF71] text-xs font-medium">
                      {skill.proficiency ? `${getProficiencyText(skill.proficiency)} (${getProficiencyNumber(skill.proficiency)})` : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs">Motivation:</span>
                    <span className="text-[#00DF71] text-xs font-medium">
                      {skill.motivation ? `${getMotivationText(skill.motivation)} (${getMotivationNumber(skill.motivation)})` : 'Not specified'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#454446]">
                    <p className="text-[#aeaeae] text-xs leading-relaxed">
                      {skill.description || 'No description available for this skill.'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div className="text-gray-400 text-sm">
          No skills listed
        </div>
      )}
    </div>
  );
}
