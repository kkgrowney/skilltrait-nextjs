'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProfileEdit() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [workTitle, setWorkTitle] = useState('');
  const [bio, setBio] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/signup');
      } else {
        setUserId(user.uid);
        fetchUserProfile(user.uid);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch existing user profile data
  const fetchUserProfile = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setName(data.display_name || data.name || '');
        setUsername(data.userName || data.username || '');
        setWorkTitle(data.currentRole || data.title || data.role || data.jobTitle || '');
        setBio(data.about || data.bio || data.description || '');
        setLinkedin(data.linkedInLink || data.linkedin || '');
        setAvatarPreview(data.photo_url || data.photoURL || data.photo || '');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const validateLinkedInUrl = (url: string): boolean => {
    if (!url.trim()) return true; // LinkedIn is optional
    return url.includes('www.linkedin.com/in/');
  };

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleAvatarSelect(files[0]);
    }
  };

  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        handleAvatarSelect(target.files[0]);
      }
    };
    input.click();
  };

  const handleAvatarSelect = (file: File) => {
    setAvatar(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Validate LinkedIn URL
      if (!validateLinkedInUrl(linkedin)) {
        console.error('LinkedIn URL must include www.linkedin.com/in/');
        setIsUpdating(false);
        return;
      }

      let photoUrl = avatarPreview; // Keep existing photo if no new avatar

      // Upload new avatar if selected
      if (avatar) {
        const avatarRef = ref(storage, `users/${userId}/avatar`);
        const snapshot = await uploadBytes(avatarRef, avatar);
        photoUrl = await getDownloadURL(snapshot.ref);
      }

      // Update user profile in Firestore
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        display_name: name,
        userName: username,
        currentRole: workTitle,
        about: bio,
        linkedInLink: linkedin,
        photo_url: photoUrl,
        updated_time: new Date(),
      });

      console.log('Profile updated successfully');
      router.push('/home');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
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

  return (
    <div className="min-h-screen bg-[#1A1D21]">
      {/* Top Header */}
      <div className="bg-[#212327] border-b border-[#454446] px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/home')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-white">Edit Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="text-center">
              <div
                className="w-24 h-24 mx-auto rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-[#00DF71] transition-colors"
                onDrop={handleAvatarDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={handleAvatarClick}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-gray-400 text-sm">Add Image</div>
                  </div>
                )}
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#212327] border border-[#454446] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors"
                placeholder="Enter your name"
              />
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Username *
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#212327] border border-[#454446] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors"
                placeholder="Enter your username"
              />
            </div>

            {/* Work Title Field */}
            <div>
              <label htmlFor="workTitle" className="block text-sm font-medium text-white mb-2">
                Work Title
              </label>
              <input
                type="text"
                id="workTitle"
                value={workTitle}
                onChange={(e) => setWorkTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[#212327] border border-[#454446] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors"
                placeholder="Enter your job title"
              />
            </div>

            {/* Bio Field */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-white mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-[#212327] border border-[#454446] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors resize-none"
                placeholder="Tell us about yourself"
              />
            </div>

            {/* LinkedIn Field */}
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-white mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                id="linkedin"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full px-4 py-3 bg-[#212327] border border-[#454446] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors"
                placeholder="https://www.linkedin.com/in/..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full bg-[#00DF71] text-[#212327] py-3 px-6 rounded-lg font-semibold hover:bg-[#0AFB84] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>

      {/* Email Verification Modal */}
      {showEmailVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#212327] rounded-lg p-8 max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Email Verification Required</h3>
            <p className="text-gray-300 mb-6">
              Please confirm your email by clicking the verification link. Check your spam folder if you didn't receive it.
            </p>
            <button
              onClick={() => {
                setShowEmailVerificationModal(false);
                router.push('/home');
              }}
              className="w-full bg-[#00DF71] text-[#212327] py-3 px-6 rounded-lg font-semibold hover:bg-[#0AFB84] transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 