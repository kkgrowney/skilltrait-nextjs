'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SideNavigation, { useSideNavMargin } from '@/components/SideNavigation';
import { useNavigation } from '@/contexts/NavigationContext';
import DigitalAwardsView from '@/components/DigitalAwardsView';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const sideNavMargin = useSideNavMargin();
  const { currentView } = useNavigation();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Fetch user profile data from Firebase
  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const userDocRef = doc(db, 'users', 'zIMIiaMN8DfFjoyZ16JOZKxFVrZ2');
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile(data);
        console.log('User profile loaded:', data);
        console.log('Photo URL fields:', {
          photoURL: data.photoURL,
          photo: data.photo,
          profilePicture: data.profilePicture
        });
      } else {
        console.log('No user profile found');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch user profile data from Firebase
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 mx-auto"></div>
          <p className="mt-2 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/signin');
    return null;
  }

  // Render Digital Awards view
  if (currentView === 'digital-awards') {
    return (
      <div className="min-h-screen" style={{backgroundColor: '#1A1D21'}}>
        <SideNavigation />
        
        <div className="md:ml-60 ml-0 md:ml-[66px] h-full flex flex-col">
          {/* ViewTitle Container */}
          <div className="w-full bg-[#1e2327] flex items-center border-b border-[#454446] h-16" style={{ height: "64px !important", minHeight: "64px", maxHeight: "64px", paddingLeft: "32px" }}>
            {/* Title text */}
            <div className="font-semibold text-[#ffffff] text-[18px] whitespace-nowrap">
              Awards Generator
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <DigitalAwardsView />
          </div>
        </div>
      </div>
    );
  }

  // Render Home view (default)
  return (
    <div className="min-h-screen" style={{backgroundColor: '#1A1D21'}}>
      <SideNavigation />
      
      <div className="md:ml-60 ml-0 md:ml-[66px] h-full flex flex-col">
        {/* ViewTitle Container */}
        <div className="w-full bg-[#1e2327] flex items-center border-b border-[#454446] h-16" style={{ height: "64px !important", minHeight: "64px", maxHeight: "64px", paddingLeft: "32px" }}>
          {/* Title text */}
          <div className="font-semibold text-[#ffffff] text-[18px] whitespace-nowrap">
            Home
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl">
            {/* Profile Card Container */}
            <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 mb-6">
              {/* Profile Title */}
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-bold text-white">Profile</h2>
                <button className="ml-3 px-3 py-1 text-xs bg-[#00DF71] text-[#212327] rounded-full hover:bg-[#0AFB84] transition-colors">
                  Edit
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  {userProfile?.photo_url || userProfile?.photoURL || userProfile?.photo || userProfile?.profilePicture ? (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-[#454446]">
                      <img 
                        src={userProfile?.photo_url || userProfile?.photoURL || userProfile?.photo || userProfile?.profilePicture} 
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initial if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#454446] flex items-center justify-center hidden border-2 border-[#454446]">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#1e2327] flex items-center justify-center">
                          <span className="text-white text-lg md:text-xl font-semibold">
                            {userProfile?.display_name?.charAt(0) || userProfile?.displayName?.charAt(0) || userProfile?.name?.charAt(0) || userProfile?.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#454446] flex items-center justify-center border-2 border-[#454446]">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#1e2327] flex items-center justify-center">
                        <span className="text-white text-lg md:text-xl font-semibold">
                          {userProfile?.display_name?.charAt(0) || userProfile?.displayName?.charAt(0) || userProfile?.name?.charAt(0) || userProfile?.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-end gap-3 mb-1">
                    <h2 className="text-xl md:text-2xl font-bold text-[#00DF71]">
                      {userProfile?.display_name || userProfile?.displayName || userProfile?.name || 'Kevin Growney'}
                    </h2>
                    
                    {/* LinkedIn Icon */}
                    <div className="flex-shrink-0" style={{ marginTop: "12px" }}>
                      <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm md:text-base">
                    {userProfile?.currentRole || userProfile?.title || userProfile?.role || userProfile?.jobTitle || 'Principal UX Designer @ Universily'}
                  </p>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-[#454446] my-4"></div>

              {/* About Section */}
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-2">
                  About
                </h3>
                <p className="text-gray-300 text-sm md:text-base">
                  {userProfile?.about || userProfile?.bio || userProfile?.description || 'Stamping out user frustration, one pixel at a time.'}
                </p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-white mb-4">User Information</h2>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-300">Email:</span>
                    <span className="ml-2 text-white">{user.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-300">User ID:</span>
                    <span className="ml-2 text-white">{user.uid}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-300">Email Verified:</span>
                    <span className="ml-2 text-white">{user.emailVerified ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-300">Provider:</span>
                    <span className="ml-2 text-white">
                      {user.providerData[0]?.providerId || 'Email/Password'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-white mb-4">Account Actions</h2>
                <div className="space-y-3">
                  <Link
                    href="/profile"
                    className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/"
                    className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
                  >
                    Go to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>

            <div className="mt-6 p-4 bg-blue-900 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-100 mb-2">Welcome to SkillTrait!</h3>
              <p className="text-blue-200">
                You have successfully signed in. This dashboard shows your authentication status and provides quick access to your account features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 