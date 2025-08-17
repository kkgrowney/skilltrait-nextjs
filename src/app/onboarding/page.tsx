'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';

export default function OnboardingPage() {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [workTitle, setWorkTitle] = useState('');
  const [bio, setBio] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Check if user is authenticated
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // Redirect to signup if not authenticated
        router.push('/signup');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleAvatarSelect(files[0]);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateLinkedInUrl = (url: string): boolean => {
    if (!url.trim()) return true; // LinkedIn is optional
    return url.includes('www.linkedin.com/in/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim() || !username.trim()) {
      console.error('Name and Username are required');
      setLoading(false);
      return;
    }

    if (!validateLinkedInUrl(linkedin)) {
      console.error('LinkedIn URL must include www.linkedin.com/in/');
      setLoading(false);
      return;
    }

    try {
      if (userId) {
        let photoURL = '';
        
        // Upload avatar if selected
        if (avatar) {
          const avatarRef = ref(storage, `users/${userId}/avatar`);
          await uploadBytes(avatarRef, avatar);
          photoURL = await getDownloadURL(avatarRef);
        }

        // Save user profile data to Firestore
        await setDoc(doc(db, 'users', userId), {
          display_name: name,
          userName: username,
          currentRole: workTitle,
          about: bio,
          linkedInLink: linkedin,
          photo_url: photoURL,
          created_time: new Date(),
          didInitProfile: true,
        }, { merge: true });

        // Check if user needs email verification
        const currentUser = auth.currentUser;
        if (currentUser && !currentUser.emailVerified && currentUser.providerData[0]?.providerId === 'password') {
          setShowEmailVerificationModal(true);
        } else {
                  // Redirect to home
        router.push('/home');
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex flex-row items-center justify-start h-[calc(100vh-64px)] overflow-hidden" style={{backgroundColor: '#1B1D21'}}>
        <div className="hidden md:flex basis-0 grow h-full min-w-px relative shrink-0 justify-center items-center" style={{backgroundColor: '#1B1D21'}}>
          <div className="flex flex-col items-center justify-center relative size-full max-w-md">
            <div className="flex flex-col items-center justify-center px-6 py-24 relative w-full">
              <div className="flex flex-col gap-6 items-start justify-start max-w-[360px] p-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-center w-full">
                  <div className="font-bold relative shrink-0 text-[30px] text-white w-full">
                    <p className="block leading-[36px]">Complete your profile</p>
                  </div>
                  <div className="font-normal relative shrink-0 text-[14px] text-gray-300 w-full">
                    <p className="block leading-[20px]">Tell us a bit about yourself to get started.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="md:hidden relative size-full h-[calc(100vh-64px)]" style={{backgroundColor: '#1B1D21'}}>
          <div className="flex flex-col items-center justify-center relative size-full">
            <div className="flex flex-col gap-2.5 items-center justify-center px-6 py-24 relative size-full">
              <div className="flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-center w-full">
                  <div className="font-bold relative shrink-0 text-[24px] text-white w-full">
                    <p className="block leading-[32px]">Complete your profile</p>
                  </div>
                  <div className="font-normal relative shrink-0 text-[14px] text-gray-300 w-full">
                    <p className="block leading-[20px]">Tell us a bit about yourself to get started.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:block basis-0 bg-center bg-cover bg-no-repeat grow h-full min-w-px shrink-0" style={{backgroundImage: 'url(\'/hero_image1x.jpg\')'}}></div>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center justify-start h-[calc(100vh-64px)] overflow-hidden" style={{backgroundColor: '#1B1D21'}}>
      {/* Desktop View */}
      <div className="hidden md:flex flex-1 h-full min-h-screen min-w-px relative shrink-0 justify-center items-center" style={{backgroundColor: '#1B1D21'}}>
        <div className="flex flex-col items-center justify-center relative size-full max-w-md">
          <div className="flex flex-col items-center justify-center px-6 py-24 relative w-full">
            <div className="flex flex-col gap-6 items-start justify-start max-w-[360px] p-0 relative shrink-0 w-full">
              <div className="flex flex-col gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-center w-full">
                <div className="font-bold relative shrink-0 text-[30px] text-white w-full">
                  <p className="block leading-[36px]">Complete your profile</p>
                </div>
                <div className="font-normal relative shrink-0 text-[14px] text-gray-300 w-full">
                  <p className="block leading-[20px]">Tell us a bit about yourself to get started.</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
                {/* Avatar Upload */}
                <div className="flex flex-col gap-2 items-center justify-start p-0 relative shrink-0 w-full">
                  <div 
                    className="relative w-24 h-24 rounded-full border-2 border-dashed cursor-pointer flex items-center justify-center transition-colors hover:border-[#00DF71]"
                    style={{borderColor: '#454446'}}
                    onClick={handleAvatarClick}
                    onDrop={handleAvatarDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs text-gray-400 mt-1">Add Image</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleAvatarSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>
                
                {/* Name Field */}
                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <input
                    type="text"
                    placeholder="Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{backgroundColor: '#212327', borderColor: '#454446'}}
                  />
                </div>
                
                {/* Username Field */}
                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <input
                    type="text"
                    placeholder="Username *"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{backgroundColor: '#212327', borderColor: '#454446'}}
                  />
                </div>
                
                {/* Work Title Field */}
                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <input
                    type="text"
                    placeholder="Work Title"
                    value={workTitle}
                    onChange={(e) => setWorkTitle(e.target.value)}
                    className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{backgroundColor: '#212327', borderColor: '#454446'}}
                  />
                </div>
                
                {/* Bio Field */}
                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <textarea
                    placeholder="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-2 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                    style={{backgroundColor: '#212327', borderColor: '#454446'}}
                  />
                </div>
                
                {/* LinkedIn Field */}
                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <input
                    type="text"
                    placeholder="https://www.linkedin.com/in/..."
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{backgroundColor: '#212327', borderColor: '#454446'}}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full transition-colors disabled:opacity-50 bg-[#00DF71] hover:bg-[#0AFB84]"
                >
                  <div className="flex flex-row items-center justify-center relative size-full">
                    <div className="flex flex-row gap-2 h-9 items-center justify-center px-4 py-2 relative w-full">
                      <div className="font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-left text-nowrap" style={{color: '#212327'}}>
                        <p className="block leading-[20px] whitespace-pre">Continue</p>
                      </div>
                    </div>
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile View */}
      <div className="md:hidden relative size-full h-[calc(100vh-64px)]" style={{backgroundColor: '#1B1D21'}}>
        <div className="flex flex-col items-center justify-center relative size-full">
          <div className="flex flex-col gap-2.5 items-center justify-center px-6 py-24 relative size-full">
            <div className="flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full">
              <div className="flex flex-col gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-center w-full">
                <div className="font-bold relative shrink-0 text-[24px] text-white w-full">
                  <p className="block leading-[32px]">Complete your profile</p>
                </div>
                <div className="font-normal relative shrink-0 text-[14px] text-gray-300 w-full">
                  <p className="block leading-[20px]">Tell us a bit about yourself to get started.</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
                {/* Avatar Upload */}
                <div className="flex flex-col gap-2 items-center justify-start p-0 relative shrink-0 w-full">
                  <div 
                    className="relative w-24 h-24 rounded-full border-2 border-dashed cursor-pointer flex items-center justify-center transition-colors hover:border-[#00DF71]"
                    style={{borderColor: '#454446'}}
                    onClick={handleAvatarClick}
                    onDrop={handleAvatarDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs text-gray-400 mt-1">Add Image</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleAvatarSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>
                
                {/* Name Field */}
                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <input
                    type="text"
                    placeholder="Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{backgroundColor: '#212327', borderColor: '#454446'}}
                  />
                </div>
                
                {/* Username Field */}
                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <input
                    type="text"
                    placeholder="Username *"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{backgroundColor: '#212327', borderColor: '#454446'}}
                  />
                </div>
                
                {/* Work Title Field */}
                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <input
                    type="text"
                    placeholder="Work Title"
                    value={workTitle}
                    onChange={(e) => setWorkTitle(e.target.value)}
                    className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{backgroundColor: '#212327', borderColor: '#454446'}}
                  />
                </div>
                
                {/* Bio Field */}
                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <textarea
                    placeholder="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-2 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                    style={{backgroundColor: '#212327', borderColor: '#454446'}}
                  />
                </div>
                
                {/* LinkedIn Field */}
                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <input
                    type="text"
                    placeholder="https://www.linkedin.com/in/..."
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{backgroundColor: '#212327', borderColor: '#454446'}}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full transition-colors disabled:opacity-50 bg-[#00DF71] hover:bg-[#0AFB84]"
                >
                  <div className="flex flex-row items-center justify-center relative size-full">
                    <div className="flex flex-row gap-2 h-9 items-center justify-center px-4 py-2 relative w-full">
                      <div className="font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-left text-nowrap" style={{color: '#212327'}}>
                        <p className="block leading-[20px] whitespace-pre">Continue</p>
                      </div>
                    </div>
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden md:block w-[900px] bg-center bg-cover bg-no-repeat h-full min-w-px shrink-0 signup-image" style={{backgroundImage: 'url(\'/hero_image1x.jpg\')'}}></div>
      
      {/* Email Verification Modal */}
      {showEmailVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#212327] rounded-lg p-6 max-w-md mx-4 border border-[#454446]">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">
                Please confirm your email
              </h3>
              <p className="text-gray-300 mb-6">
                Please confirm your email by clicking the verification link. Check your spam folder if you didn't receive it.
              </p>
              <button
                onClick={() => {
                  setShowEmailVerificationModal(false);
                  router.push('/home');
                }}
                className="h-9 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full transition-colors bg-[#00DF71] hover:bg-[#0AFB84]"
              >
                <div className="flex flex-row items-center justify-center relative size-full">
                  <div className="flex flex-row gap-2 h-9 items-center justify-center px-4 py-2 relative w-full">
                    <div className="font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-left text-nowrap" style={{color: '#212327'}}>
                      <p className="block leading-[20px] whitespace-pre">Continue</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 