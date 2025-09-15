"use client";

/**
 * Skills Page with Firebase Cloud Function Integration
 * 
 * NOTE: If you're getting "Failed to fetch" errors, this could be due to:
 * 1. Cloud function not deployed yet
 * 2. CORS configuration issues
 * 3. Network connectivity problems
 * 4. Cloud function URL being incorrect
 * 
 * The system will fallback to local Firebase storage if the cloud function fails.
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import SideNavigation, { useSideNavMargin } from '@/components/SideNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

function SkillsPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const sideNavMargin = useSideNavMargin();
  const searchParams = useSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedSkillDetail, setSelectedSkillDetail] = useState<string | null>(null);
  const [overviewText, setOverviewText] = useState('');
  const [originalOverviewText, setOriginalOverviewText] = useState('');
  const [selectedProficiencyLevel, setSelectedProficiencyLevel] = useState<string>('');
  const [selectedMotivationLevel, setSelectedMotivationLevel] = useState('');
  const [skillDocumentId, setSkillDocumentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [originalProficiencyLevel, setOriginalProficiencyLevel] = useState<string>('');
  const [originalMotivationLevel, setOriginalMotivationLevel] = useState<string>('');
  const [isSavingFromModal, setIsSavingFromModal] = useState(false);

  // Helper function to map proficiency level to integer (1-6)
  const mapProficiencyToInt = (level: string): number => {
    switch (level) {
      case 'Beginner': return 1;
      case 'Intermediate': return 2;
      case 'Advanced': return 3;
      case 'Expert': return 4;
      case 'Master': return 5;
      default: return 1;
    }
  };

  // Helper function to map motivation level to integer (1-5)
  const mapMotivationToInt = (level: string): number => {
    switch (level) {
      case 'Very Low': return 1;
      case 'Low': return 2;
      case 'Moderate': return 3;
      case 'High': return 4;
      case 'Very High': return 5;
      default: return 1;
    }
  };

  // Helper function to find existing skill document
  const findSkillDocument = async (skillName: string): Promise<string | null> => {
    if (!user?.uid) return null;
    
    try {
      // ✅ UPDATED: Query top-level skills collection with userRef filter
      const skillsRef = collection(db, 'skills');
      const q = query(
        skillsRef, 
        where('userRef', '==', doc(db, 'users', user.uid)),
        where('name', '==', skillName)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
      }
      return null;
    } catch (error) {
      console.error('Error finding skill document:', error);
      return null;
    }
  };

  // Helper function to call the cloud function via Next.js API route
  const callSaveSkillFunction = async (skillData: any) => {
    try {
      console.log('Calling Next.js API route with skill data');
      
      const response = await fetch('/api/save-skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skillData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API route error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('API route response:', result);
      return result;
    } catch (error) {
      console.error('Error calling API route:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Handle URL parameter for skill selection
  useEffect(() => {
    const selectParam = searchParams.get('select');
    if (selectParam && selectedSkills.includes(selectParam)) {
      // Auto-select the skill for detail view
      handleSkillSelect(selectParam);
    }
  }, [searchParams, selectedSkills]);

  // Track changes to determine if save button should be active
  useEffect(() => {
    if (selectedSkillDetail) {
      const hasChanges = 
        overviewText !== originalOverviewText ||
        selectedProficiencyLevel !== originalProficiencyLevel ||
        selectedMotivationLevel !== originalMotivationLevel;
      
      console.log('Change detection:', {
        overviewText,
        originalOverviewText,
        selectedProficiencyLevel,
        originalProficiencyLevel,
        selectedMotivationLevel,
        originalMotivationLevel,
        hasChanges
      });
      
      setHasUnsavedChanges(hasChanges);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [overviewText, originalOverviewText, selectedProficiencyLevel, originalProficiencyLevel, selectedMotivationLevel, originalMotivationLevel, selectedSkillDetail]);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    if (!user?.uid) return;
    
    setIsLoadingProfile(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile(data);
        setOverviewText(data.overview || '');
        setOriginalOverviewText(data.overview || '');
        setSelectedProficiencyLevel(data.proficiencyLevel || '');
        setSelectedMotivationLevel(data.motivationLevel || '');
        
        // ✅ UPDATED: Load skills from top-level skills collection with userRef filter
        try {
          const skillsRef = collection(db, 'skills');
          const q = query(skillsRef, where('userRef', '==', doc(db, 'users', user.uid)));
          const skillsSnapshot = await getDocs(q);
          
          const userSkills = skillsSnapshot.docs.map(doc => doc.data().name);
          setSelectedSkills(userSkills);
        } catch (error) {
          console.error('Error loading skills:', error);
          setSelectedSkills(data.skills || []);
        }
        
        console.log('User profile loaded:', data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Handle adding a skill
  const handleAddSkill = async (skill: string) => {
    if (!user?.uid || selectedSkills.includes(skill)) return;
    
    try {
      // ✅ UPDATED: Add to top-level skills collection with userRef
      const skillsRef = collection(db, 'skills');
      await addDoc(skillsRef, {
        name: skill,
        description: '',
        proficiency: 1,
        motivation: 1,
        userRef: doc(db, 'users', user.uid), // Add userRef field
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Update local state
      setSelectedSkills([...selectedSkills, skill]);
      
      // Update user document skills array
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        skills: [...selectedSkills, skill]
      });
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error('Failed to add skill.');
    }
  };

  // Handle removing a skill
  const handleRemoveSkill = async (skill: string) => {
    if (!user?.uid) return;
    
    try {
      // ✅ UPDATED: Find and delete from top-level skills collection
      const existingSkillId = await findSkillDocument(skill);
      if (existingSkillId) {
        await deleteDoc(doc(db, 'skills', existingSkillId));
      }
      
      // Update local state
      const newSkills = selectedSkills.filter(s => s !== skill);
      setSelectedSkills(newSkills);
      
      if (selectedSkillDetail === skill) {
        setSelectedSkillDetail(null);
        setSkillDocumentId(null);
      }
      
      // Update user document skills array
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        skills: newSkills
      });
    } catch (error) {
      console.error('Error removing skill:', error);
      toast.error('Failed to remove skill.');
    }
  };

  // Handle skill selection for detail view
  const handleSkillSelect = async (skill: string) => {
    if (selectedSkillDetail === skill) {
      // Check for unsaved changes before closing
      if (hasUnsavedChanges) {
        setPendingAction(() => () => {
          setSelectedSkillDetail(null);
          setSkillDocumentId(null);
          setHasUnsavedChanges(false);
        });
        setShowUnsavedChangesModal(true);
        return;
      }
      setSelectedSkillDetail(null);
      setSkillDocumentId(null);
      setHasUnsavedChanges(false);
    } else {
      // Check for unsaved changes before switching to a different skill
      if (hasUnsavedChanges) {
        setPendingAction(() => async () => {
          setSelectedSkillDetail(skill);
          // Load the new skill data
          const existingSkillId = await findSkillDocument(skill);
          setSkillDocumentId(existingSkillId);
          
          if (existingSkillId) {
            try {
              const skillDocRef = doc(db, 'skills', existingSkillId);
              const skillDoc = await getDoc(skillDocRef);
            
              if (skillDoc.exists()) {
                const skillData = skillDoc.data();
                setOverviewText(skillData.description || '');
                setOriginalOverviewText(skillData.description || '');
                
                // Map proficiency back from integer
                const proficiencyMap = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', 4: 'Expert', 5: 'Master' };
                const proficiencyLevel = proficiencyMap[skillData.proficiency as keyof typeof proficiencyMap] || '';
                setSelectedProficiencyLevel(proficiencyLevel);
                setOriginalProficiencyLevel(proficiencyLevel);
                
                // Map motivation back from integer
                const motivationMap = { 1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Very High' };
                const motivationLevel = motivationMap[skillData.motivation as keyof typeof motivationMap] || '';
                setSelectedMotivationLevel(motivationLevel);
                setOriginalMotivationLevel(motivationLevel);
              }
            } catch (error) {
              console.error('Error loading skill data:', error);
            }
          } else {
            // Reset form for new skill
            setOverviewText('');
            setOriginalOverviewText('');
            setSelectedProficiencyLevel('');
            setOriginalProficiencyLevel('');
            setSelectedMotivationLevel('');
            setOriginalMotivationLevel('');
          }
          setHasUnsavedChanges(false);
        });
        setShowUnsavedChangesModal(true);
        return;
      }
      setSelectedSkillDetail(skill);
      
              // Try to find existing skill document
        const existingSkillId = await findSkillDocument(skill);
        setSkillDocumentId(existingSkillId);
        
        // ✅ UPDATED: Load existing skill data from top-level skills collection
        if (existingSkillId) {
          try {
            const skillDocRef = doc(db, 'skills', existingSkillId);
            const skillDoc = await getDoc(skillDocRef);
          
          if (skillDoc.exists()) {
            const skillData = skillDoc.data();
            setOverviewText(skillData.description || '');
            setOriginalOverviewText(skillData.description || '');
            
            // Map proficiency back from integer
            const proficiencyMap = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', 4: 'Expert', 5: 'Master' };
            const proficiencyLevel = proficiencyMap[skillData.proficiency as keyof typeof proficiencyMap] || '';
            setSelectedProficiencyLevel(proficiencyLevel);
            setOriginalProficiencyLevel(proficiencyLevel);
            
            // Map motivation back from integer
            const motivationMap = { 1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Very High' };
            const motivationLevel = motivationMap[skillData.motivation as keyof typeof motivationMap] || '';
            setSelectedMotivationLevel(motivationLevel);
            setOriginalMotivationLevel(motivationLevel);
          }
        } catch (error) {
          console.error('Error loading skill data:', error);
        }
      } else {
        // Reset form for new skill
        setOverviewText('');
        setOriginalOverviewText('');
        setSelectedProficiencyLevel('');
        setOriginalProficiencyLevel('');
        setSelectedMotivationLevel('');
        setOriginalMotivationLevel('');
      }
    }
  };

  // Handle closing skill detail
  const handleCloseSkillDetail = () => {
    console.log('Closing skill detail, hasUnsavedChanges:', hasUnsavedChanges);
    // Check for unsaved changes before closing
    if (hasUnsavedChanges) {
      console.log('Showing unsaved changes modal');
      setPendingAction(() => () => {
        setSelectedSkillDetail(null);
        setSkillDocumentId(null);
        setOverviewText('');
        setOriginalOverviewText('');
        setSelectedProficiencyLevel('');
        setOriginalProficiencyLevel('');
        setSelectedMotivationLevel('');
        setOriginalMotivationLevel('');
        setHasUnsavedChanges(false);
      });
      setShowUnsavedChangesModal(true);
      console.log('Modal state set to true');
      return;
    }
    setSelectedSkillDetail(null);
    setSkillDocumentId(null);
    setOverviewText('');
    setOriginalOverviewText('');
    setSelectedProficiencyLevel('');
    setOriginalProficiencyLevel('');
    setSelectedMotivationLevel('');
    setOriginalMotivationLevel('');
    setHasUnsavedChanges(false);
  };

  // Handle unsaved changes modal actions
  const handleSaveAndContinue = async () => {
    setIsSavingFromModal(true);
    try {
      await handleSaveSkillDetails();
      // Don't close the skill detail view, just close the modal
      setShowUnsavedChangesModal(false);
      setPendingAction(null);
    } catch (error) {
      console.error('Error saving from modal:', error);
    } finally {
      setIsSavingFromModal(false);
    }
  };


  const handleCancelModal = () => {
    setPendingAction(null);
    setShowUnsavedChangesModal(false);
  };

  const handleSaveSkillDetails = async () => {
    if (!user?.uid || !selectedSkillDetail) return;
    
    setIsSaving(true);
    try {
      console.log('Saving skill details for:', selectedSkillDetail);
      
      // Find existing skill document or create new one
      let existingSkillId = await findSkillDocument(selectedSkillDetail);
      console.log('Existing Skill ID:', existingSkillId);
      
      // Prepare skill data for cloud function
      const skillData = {
        user: user.uid,
        skill: existingSkillId || null,
        name: selectedSkillDetail,
        desc: overviewText,
        prof: mapProficiencyToInt(selectedProficiencyLevel),
        mot: mapMotivationToInt(selectedMotivationLevel)
      };
      
      console.log('Skill data prepared:', skillData);
      
      // Try to call cloud function via API route
      let cloudFunctionResult = null;
      try {
        cloudFunctionResult = await callSaveSkillFunction(skillData);
      } catch (cloudError) {
        console.log('API route call failed, proceeding with local save only');
        cloudFunctionResult = { success: false, error: 'API route unavailable' };
      }
      
      // Always save to local Firebase for immediate UI updates
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { 
        overview: overviewText,
        proficiencyLevel: selectedProficiencyLevel,
        motivationLevel: selectedMotivationLevel
      });

      // Update local state
      setOriginalOverviewText(overviewText);
      
      // If API route was successful, handle the response
      if (cloudFunctionResult && cloudFunctionResult.success !== false) {
        // If this is a new skill, add it to the skills collection locally
        if (!existingSkillId && cloudFunctionResult.skillId) {
          setSkillDocumentId(cloudFunctionResult.skillId);
          
          // Also add to local skills array if not already there
          if (!selectedSkills.includes(selectedSkillDetail)) {
            setSelectedSkills([...selectedSkills, selectedSkillDetail]);
            
            // Update user document skills array
            await updateDoc(userDocRef, {
              skills: [...selectedSkills, selectedSkillDetail]
            });
          }
        }
        toast.success('Skill details saved successfully!');
        // Update original values to match current values after successful save
        setOriginalOverviewText(overviewText);
        setOriginalProficiencyLevel(selectedProficiencyLevel);
        setOriginalMotivationLevel(selectedMotivationLevel);
      } else {
        // API route failed but local save succeeded
        console.log('API route failed, but data saved locally');
        toast.success('Skill details saved locally. Cloud function unavailable.');
        // Update original values to match current values after successful save
        setOriginalOverviewText(overviewText);
        setOriginalProficiencyLevel(selectedProficiencyLevel);
        setOriginalMotivationLevel(selectedMotivationLevel);
      }
      
    } catch (error) {
      console.error('Error saving skill details:', error);
      toast.error('Failed to save skill details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSkillDetails = () => {
    setOverviewText(originalOverviewText);
    setSelectedProficiencyLevel(userProfile?.proficiencyLevel || '');
    setSelectedMotivationLevel(userProfile?.motivationLevel || '');
  };

  const handleProficiencyLevelSelect = (level: string) => {
    let newLevel = '';
    if (selectedProficiencyLevel === level) {
      // If clicking the same level, deselect it
      newLevel = '';
    } else {
      // Select the new level (automatically deselects the previous one)
      newLevel = level;
    }
    
    setSelectedProficiencyLevel(newLevel);
  };

  const handleMotivationLevelSelect = (motivation: string) => {
    let newMotivation = '';
    if (selectedMotivationLevel === motivation) {
      // If clicking the same motivation, deselect it
      newMotivation = '';
    } else {
      // Select the new motivation (automatically deselects the previous one)
      newMotivation = motivation;
    }
    
    setSelectedMotivationLevel(newMotivation);
  };

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1B1D21" }}>
      <SideNavigation />
      
      <div className={`${sideNavMargin} h-full flex flex-col`}>
        {/* Fixed Header Container */}
        <div className="flex-shrink-0 z-20">
          {/* ViewTitle Container */}
          <div className="w-full bg-[#1e2327] flex items-center h-16 border-b border-[#454446]" style={{ height: "64px !important", minHeight: "64px", maxHeight: "64px", paddingLeft: "32px" }}>
            {/* Title text */}
            <div className="font-semibold text-[#ffffff] text-[18px] whitespace-nowrap md:ml-0 ml-9 flex items-center">
              Skills
            </div>
          </div>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="max-w-6xl">
            <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-6">My Skills</h2>
              
              {/* Responsive two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - My Skills */}
                <div>
                  {selectedSkills.length === 0 ? (
                    // Show Getting Started when no skills
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Getting Started</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Start by adding your core competencies and areas of specialization. 
                        You can organize skills by category, add proficiency levels, and include 
                        relevant certifications or achievements.
                      </p>
                    </div>
                  ) : (
                    // Show Your Skills when skills exist
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {selectedSkills.map((skill, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-2 border rounded-full px-3 py-2 transition-colors group cursor-pointer ${
                              selectedSkillDetail === skill
                                ? 'bg-[#00DF71] border-[#00DF71]'
                                : 'bg-[#2a2e32] border-[#454446] hover:bg-[#3a3e42]'
                            }`}
                            onClick={() => handleSkillSelect(skill)}
                          >
                            <span className={`text-sm whitespace-nowrap ${
                              selectedSkillDetail === skill
                                ? 'text-[#212327] font-medium'
                                : 'text-gray-300 group-hover:text-white group-hover:underline'
                            }`}>
                              {skill}
                            </span>
                            <button
                              className={`flex items-center justify-center w-5 h-5 border rounded-full transition-colors text-xs font-bold ${
                                selectedSkillDetail === skill
                                  ? 'border-[#212327] text-[#212327] hover:bg-[#212327] hover:text-[#00DF71]'
                                  : 'border-[#454446] text-white hover:border-[#00DF71] hover:text-[#00DF71]'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSkill(skill);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Right Column - Conditional Content */}
                <div className="h-full">
                  {selectedSkillDetail ? (
                    /* Skill Detail Container */
                    <div className="bg-[#1e2327] rounded-lg border border-[#454446] h-full p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-semibold text-white">{selectedSkillDetail}</h4>
                        <button
                          onClick={handleCloseSkillDetail}
                          className="flex items-center justify-center w-8 h-8 border border-[#454446] hover:border-[#00DF71] text-white hover:text-[#00DF71] rounded-full transition-colors text-lg font-bold"
                        >
                          ×
                        </button>
                      </div>
                      
                      {/* Skill Detail Content */}
                      <div className="space-y-6">
                        <div className="bg-[#212327] rounded-lg border border-[#454446] p-4">
                          <h5 className="text-md font-semibold text-white mb-3">Overview</h5>
                          
                          <div className="space-y-3">
                            <textarea
                              id="overviewTextarea"
                              placeholder="Enter your overview here..."
                              maxLength={160}
                              rows={4}
                              className="w-full bg-[#1A1D21] border border-[#454446] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors resize-none"
                              value={overviewText}
                              onChange={(e) => setOverviewText(e.target.value)}
                            />
                            
                            <div className="text-sm text-gray-400">
                              <span className={overviewText.length > 160 ? 'text-red-400 font-semibold' : ''}>
                                {overviewText.length > 160 ? `${overviewText.length - 160} over limit` : `${160 - overviewText.length} characters remaining`}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-[#212327] rounded-lg border border-[#454446] p-4">
                          <h5 className="text-md font-semibold text-white mb-3">Proficiency Level</h5>
                          <div className="flex gap-2">
                            {['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'].map((level, index) => (
                              <button
                                key={index}
                                className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                                  selectedProficiencyLevel === level
                                    ? 'bg-[#00DF71] border-[#00DF71] text-[#212327] font-medium'
                                    : 'bg-[#2a2e32] border-[#454446] text-gray-300 hover:border-[#00DF71] hover:text-[#00DF71]'
                                }`}
                                onClick={() => handleProficiencyLevelSelect(level)}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-[#212327] rounded-lg border border-[#454446] p-4">
                          <h5 className="text-md font-semibold text-white mb-3">Skill Growth</h5>
                          <p className="text-gray-300 text-sm mb-4">
                            How motivated are you to build this skill
                          </p>
                          <div className="flex gap-2">
                            {['Very Low', 'Low', 'Moderate', 'High', 'Very High'].map((motivation, index) => (
                              <button
                                key={index}
                                className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                                  selectedMotivationLevel === motivation
                                    ? 'bg-[#00DF71] border-[#00DF71] text-[#212327] font-medium'
                                    : 'bg-[#2a2e32] border-[#454446] text-gray-300 hover:border-[#00DF71] hover:text-[#00DF71]'
                                }`}
                                onClick={() => handleMotivationLevelSelect(motivation)}
                              >
                                {motivation}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Save/Cancel Section at Bottom */}
                        <div className="flex justify-end gap-2 pt-4">
                          <button
                            onClick={handleCancelSkillDetails}
                            className="px-4 py-2 text-sm border border-[#454446] text-gray-300 rounded-lg font-medium hover:border-[#00DF71] hover:text-[#00DF71] transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveSkillDetails}
                            disabled={overviewText.length > 160 || isSaving || !hasUnsavedChanges}
                            className="px-4 py-2 text-sm bg-[#00DF71] text-[#212327] rounded-lg font-medium hover:bg-[#0AFB84] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSaving ? 'Saving...' : 'Save All Changes'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Search and Popular Skills when no skill is selected */
                    <div className="space-y-6">
                      {/* Search Section */}
                      <div className="bg-[#1e2327] rounded-lg border border-[#454446] p-4">
                        <h4 className="text-md font-semibold text-white mb-3">Search Skills</h4>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search for skills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && searchQuery.trim()) {
                                const trimmedSkill = searchQuery.trim();
                                if (!selectedSkills.includes(trimmedSkill)) {
                                  handleAddSkill(trimmedSkill);
                                  setSearchQuery('');
                                  setShowSearchDropdown(false);
                                }
                              }
                            }}
                            className="w-full bg-[#212327] border border-[#454446] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors"
                            onFocus={() => setShowSearchDropdown(true)}
                            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          
                          {/* Search Dropdown */}
                          {showSearchDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[#212327] border border-[#454446] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                              <div className="p-2">
                                <div className="text-xs text-gray-400 font-medium mb-2 px-2">
                                  {searchQuery ? 'Search Results' : 'Popular Skills'}
                                </div>
                                {['JavaScript', 'React', 'Python', 'Data Analysis', 'Project Management', 'Leadership', 'Communication', 'UI/UX Design']
                                  .filter(skill => 
                                    skill.toLowerCase().includes(searchQuery.toLowerCase())
                                  )
                                  .map((skill, index) => (
                                    <button
                                      key={index}
                                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#2a2e32] rounded-md transition-colors"
                                      onClick={() => {
                                        handleAddSkill(skill);
                                        setSearchQuery(skill);
                                        setShowSearchDropdown(false);
                                      }}
                                    >
                                      {skill}
                                    </button>
                                  ))}
                                {searchQuery && ['JavaScript', 'React', 'Python', 'Data Analysis', 'Project Management', 'Leadership', 'Communication', 'UI/UX Design']
                                  .filter(skill => 
                                    skill.toLowerCase().includes(searchQuery.toLowerCase())
                                  ).length === 0 && (
                                    <div className="px-3 py-2 text-sm text-gray-400">
                                      No skills found matching "{searchQuery}"
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Popular Skills Section */}
                      <div className="bg-[#1e2327] rounded-lg border border-[#454446] p-6">
                        <h4 className="text-md font-semibold text-white mb-4">Popular Skills</h4>
                        <div className="flex flex-wrap gap-3">
                          {['JavaScript', 'React', 'Python', 'Data Analysis', 'Project Management', 'Leadership', 'Communication', 'UI/UX Design', 'Machine Learning', 'Product Management', 'Customer Success', 'Sales', 'Marketing', 'Design Thinking', 'Agile', 'Scrum', 'Data Science', 'Cloud Computing', 'DevOps', 'Cybersecurity'].slice(0, 32).map((skill, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-[#2a2e32] hover:bg-[#3a3e42] border border-[#454446] rounded-full px-3 py-2 transition-colors group cursor-pointer"
                              onClick={() => handleAddSkill(skill)}
                            >
                              <span className="text-sm text-gray-300 group-hover:text-white whitespace-nowrap">
                                {skill}
                              </span>
                              <button
                                className="flex items-center justify-center w-5 h-5 bg-[#00DF71] hover:bg-[#0AFB84] text-[#212327] rounded-full transition-colors text-xs font-bold"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddSkill(skill);
                                }}
                              >
                                +
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="h-[31px]"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      {showUnsavedChangesModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-[#212327] border border-[#454446] rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-medium text-white mb-4">
              Unsaved Changes
            </h3>
            <p className="text-gray-300 mb-6">
              You have unsaved changes. Do you want to save them before continuing?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleCancelModal}
                disabled={isSavingFromModal}
                className="flex-1 px-4 py-2 text-sm font-medium transition-colors border rounded text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: "#454446" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAndContinue}
                disabled={isSavingFromModal}
                className="flex-1 px-4 py-2 text-sm font-medium transition-colors bg-[#00DF71] text-[#212327] rounded hover:bg-[#0AFB84] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSavingFromModal ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#212327]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SkillsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen" style={{ backgroundColor: "#1B1D21" }}>
        <SideNavigation />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    }>
      <SkillsPageContent />
    </Suspense>
  );
}
