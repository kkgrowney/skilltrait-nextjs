'use client';

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      console.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!agreeToTerms) {
      console.error('Please agree to the Terms of Service and Privacy Policy');
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('Sign up error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('Google sign up error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    setLoading(true);

    try {
      const provider = new OAuthProvider('apple.com');
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('Apple sign up error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex flex-row items-center justify-start min-h-screen" style={{backgroundColor: '#1B1D21'}}>
        <div className="hidden md:flex basis-0 grow h-full min-h-screen min-w-px relative shrink-0 justify-center items-center" style={{backgroundColor: '#1B1D21'}}>
          <div className="flex flex-col items-center relative size-full max-w-md">
            <div className="flex flex-col items-center justify-center px-6 py-24 relative w-full">
              <div className="flex flex-col gap-6 items-start justify-start max-w-[360px] p-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-center w-full">
                  <div className="font-bold relative shrink-0 text-[30px] text-white w-full">
                    <p className="block leading-[36px]">Sign up</p>
                  </div>
                  <div className="font-normal relative shrink-0 text-[14px] text-gray-300 w-full">
                    <p className="block leading-[20px]">Create your account to get started with SkillTrait.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="md:hidden relative size-full min-h-screen" style={{backgroundColor: '#1B1D21'}}>
          <div className="flex flex-col items-center justify-center relative size-full">
            <div className="flex flex-col gap-2.5 items-center justify-center px-6 py-24 relative size-full">
              <div className="flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-center w-full">
                  <div className="font-bold relative shrink-0 text-[24px] text-white w-full">
                    <p className="block leading-[32px]">Sign up</p>
                  </div>
                  <div className="font-normal relative shrink-0 text-[14px] text-gray-300 w-full">
                    <p className="block leading-[20px]">Create your account to get started with SkillTrait.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:block basis-0 bg-center bg-cover bg-no-repeat grow h-full min-h-screen min-w-px shrink-0" style={{backgroundImage: 'url(\'https://picsum.photos/1200/800?random=2\')'}}></div>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center justify-start min-h-screen" style={{backgroundColor: '#1B1D21'}}>
      {/* Desktop View */}
      <div className="hidden md:flex basis-0 grow h-full min-h-screen min-w-px relative shrink-0 justify-center items-center" style={{backgroundColor: '#1B1D21'}}>
        <div className="flex flex-col items-center relative size-full max-w-md">
          <div className="flex flex-col items-center justify-center px-6 py-24 relative w-full">
            <div className="flex flex-col gap-6 items-start justify-start max-w-[360px] p-0 relative shrink-0 w-full">
              <div className="flex flex-col gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-center w-full">
                <div className="font-bold relative shrink-0 text-[30px] text-white w-full">
                  <p className="block leading-[36px]">Sign up</p>
                </div>
                <div className="font-normal relative shrink-0 text-[14px] text-gray-300 w-full">
                  <p className="block leading-[20px]">Create your account to get started with SkillTrait.</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                <button 
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors"
                  style={{backgroundColor: '#212327', borderColor: '#454446'}}
                >
                  <div className="flex flex-row items-center justify-center relative size-full">
                    <div className="flex flex-row gap-2 h-9 items-center justify-center px-4 py-2 relative w-full">
                      <div className="overflow-clip relative shrink-0 size-4">
                        <svg viewBox="0 0 24 24" className="size-full">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                        </svg>
                      </div>
                      <div className="font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-left text-white text-nowrap">
                        <p className="block leading-[20px] whitespace-pre">Continue with Google</p>
                      </div>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={handleAppleSignUp}
                  disabled={loading}
                  className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors"
                  style={{backgroundColor: '#212327', borderColor: '#454446'}}
                >
                  <div className="flex flex-row items-center justify-center relative size-full">
                    <div className="flex flex-row gap-2 h-9 items-center justify-center px-4 py-2 relative w-full">
                      <div className="overflow-clip relative shrink-0 size-4">
                        <svg viewBox="0 0 24 24" className="size-full" fill="white">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"></path>
                        </svg>
                      </div>
                      <div className="font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-left text-white text-nowrap">
                        <p className="block leading-[20px] whitespace-pre">Continue with Apple</p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-full">
                  <div className="h-0 relative shrink-0 w-full border-t" style={{borderColor: '#454446'}}>
                    <div className="absolute box-border flex flex-row items-center justify-center px-2 py-0 top-1/2 translate-x-[-50%] translate-y-[-50%]" style={{left: 'calc(50% - 0.5px)', backgroundColor: '#1B1D21'}}>
                      <div className="font-normal leading-[0] relative shrink-0 text-[12px] text-left text-gray-400 text-nowrap">
                        <p className="block leading-none whitespace-pre">OR</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{backgroundColor: '#212327', borderColor: '#454446'}}
                  />
                </div>
                
                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <div className="relative w-full">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent pr-10"
                      style={{backgroundColor: '#212327', borderColor: '#454446'}}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye" aria-hidden="true">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <div className="relative w-full">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent pr-10"
                      style={{backgroundColor: '#212327', borderColor: '#454446'}}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye" aria-hidden="true">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-row items-start justify-start p-0 relative shrink-0 w-full">
                  <button
                    type="button"
                    onClick={() => setAgreeToTerms(!agreeToTerms)}
                    className="flex flex-row gap-2 items-start justify-start cursor-pointer"
                  >
                    <div className={`relative rounded shrink-0 size-4 border ${agreeToTerms ? 'bg-green-500' : 'bg-transparent'}`} style={{borderColor: '#454446'}}></div>
                    <span className="font-medium text-[14px] text-white">I agree to the Terms of Service and Privacy Policy</span>
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full transition-colors disabled:opacity-50 bg-[var(--primary-dark)] hover:bg-[#0AFB84]"
                >
                  <div className="flex flex-row items-center justify-center relative size-full">
                    <div className="flex flex-row gap-2 h-9 items-center justify-center px-4 py-2 relative w-full">
                      <div className="font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-left text-nowrap" style={{color: '#212327'}}>
                        <p className="block leading-[20px] whitespace-pre">Sign up</p>
                      </div>
                    </div>
                  </div>
                </button>
                
                <div className="flex flex-row font-normal gap-1 items-start justify-center leading-[0] p-0 relative shrink-0 text-[14px] text-center text-nowrap w-full">
                  <div className="relative shrink-0 text-gray-400">
                    <p className="block leading-[20px] text-nowrap whitespace-pre">Already have an account?</p>
                  </div>
                  <a href="/signin" className="relative shrink-0 text-white underline hover:text-gray-300">
                    <p className="block leading-[20px] text-nowrap whitespace-pre">Sign in</p>
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile View */}
      <div className="md:hidden relative size-full min-h-screen" style={{backgroundColor: '#1B1D21'}}>
        <div className="flex flex-col items-center justify-center relative size-full">
          <div className="flex flex-col gap-2.5 items-center justify-center px-6 py-24 relative size-full">
            <div className="flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full">
              <div className="flex flex-col gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-center w-full">
                <div className="font-bold relative shrink-0 text-[24px] text-white w-full">
                  <p className="block leading-[32px]">Sign up</p>
                </div>
                <div className="font-normal relative shrink-0 text-[14px] text-gray-300 w-full">
                  <p className="block leading-[20px]">Create your account to get started with SkillTrait.</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                <button 
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors"
                  style={{backgroundColor: '#212327', borderColor: '#454446'}}
                >
                  <div className="flex flex-row items-center justify-center relative size-full">
                    <div className="flex flex-row gap-2 h-9 items-center justify-center px-4 py-2 relative w-full">
                      <div className="overflow-clip relative shrink-0 size-4">
                        <svg viewBox="0 0 24 24" className="size-full">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                        </svg>
                      </div>
                      <div className="font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-left text-white text-nowrap">
                        <p className="block leading-[20px] whitespace-pre">Continue with Google</p>
                      </div>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={handleAppleSignUp}
                  disabled={loading}
                  className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors"
                  style={{backgroundColor: '#212327', borderColor: '#454446'}}
                >
                  <div className="flex flex-row items-center justify-center relative size-full">
                    <div className="flex flex-row gap-2 h-9 items-center justify-center px-4 py-2 relative w-full">
                      <div className="overflow-clip relative shrink-0 size-4">
                        <svg viewBox="0 0 24 24" className="size-full" fill="white">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"></path>
                        </svg>
                      </div>
                      <div className="font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-left text-white text-nowrap">
                        <p className="block leading-[20px] whitespace-pre">Continue with Apple</p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-full">
                  <div className="h-0 relative shrink-0 w-full border-t" style={{borderColor: '#454446'}}>
                    <div className="absolute box-border flex flex-row items-center justify-center px-2 py-0 top-1/2 translate-x-[-50%] translate-y-[-50%]" style={{left: 'calc(50% - 0.5px)', backgroundColor: '#1B1D21'}}>
                      <div className="font-normal leading-[0] relative shrink-0 text-[12px] text-left text-gray-400 text-nowrap">
                        <p className="block leading-none whitespace-pre">OR</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{backgroundColor: '#212327', borderColor: '#454446'}}
                  />
                </div>
                
                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <div className="relative w-full">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent pr-10"
                      style={{backgroundColor: '#212327', borderColor: '#454446'}}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye" aria-hidden="true">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <div className="relative w-full">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent pr-10"
                      style={{backgroundColor: '#212327', borderColor: '#454446'}}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye" aria-hidden="true">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-row items-start justify-start p-0 relative shrink-0 w-full">
                  <button
                    type="button"
                    onClick={() => setAgreeToTerms(!agreeToTerms)}
                    className="flex flex-row gap-2 items-start justify-start cursor-pointer"
                  >
                    <div className={`relative rounded shrink-0 size-4 border ${agreeToTerms ? 'bg-green-500' : 'bg-transparent'}`} style={{borderColor: '#454446'}}></div>
                    <span className="font-medium text-[14px] text-white">I agree to the Terms of Service and Privacy Policy</span>
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full transition-colors disabled:opacity-50 bg-[var(--primary-dark)] hover:bg-[#0AFB84]"
                >
                  <div className="flex flex-row items-center justify-center relative size-full">
                    <div className="flex flex-row gap-2 h-9 items-center justify-center px-4 py-2 relative w-full">
                      <div className="font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-left text-nowrap" style={{color: '#212327'}}>
                        <p className="block leading-[20px] whitespace-pre">Sign up</p>
                      </div>
                    </div>
                  </div>
                </button>
                
                <div className="flex flex-row font-normal gap-1 items-start justify-center leading-[0] p-0 relative shrink-0 text-[14px] text-center text-nowrap w-full">
                  <div className="relative shrink-0 text-gray-400">
                    <p className="block leading-[20px] text-nowrap whitespace-pre">Already have an account?</p>
                  </div>
                  <a href="/signin" className="relative shrink-0 text-white underline hover:text-gray-300">
                    <p className="block leading-[20px] text-nowrap whitespace-pre">Sign in</p>
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden md:block basis-0 bg-center bg-cover bg-no-repeat grow h-full min-h-screen min-w-px shrink-0" style={{backgroundImage: 'url(\'https://picsum.photos/1200/800?random=2\')'}}></div>
    </div>
  );
} 