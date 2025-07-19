'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavPrelogin from '@/components/nav_prelogin';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

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

  return (
    <div className="min-h-screen" style={{backgroundColor: '#1B1D21'}}>
      <NavPrelogin />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
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

          <div className="mt-6 p-4 bg-blue-900 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-100 mb-2">Welcome to SkillTrait!</h3>
            <p className="text-blue-200">
              You have successfully signed in. This dashboard shows your authentication status and provides quick access to your account features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 