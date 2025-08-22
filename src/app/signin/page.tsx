"use client";

import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import NavPrelogin from "@/components/nav_prelogin";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Test Firebase configuration
  useEffect(() => {
    console.log("Firebase auth object:", auth);
    console.log("Firebase config:", {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Set" : "Not set",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "Set" : "Not set",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Set" : "Not set",
    });
    
    // Check current auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Current auth state:", user ? "Logged in" : "Not logged in");
      if (user) {
        console.log("User email:", user.email);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Handle redirect result
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("Redirect sign-in successful:", result.user.email);
          
          // Check if user has a profile
          const userDoc = await getDoc(doc(db, "users", result.user.uid));
          if (!userDoc.exists()) {
            // Create basic profile for Google user
            await setDoc(doc(db, "users", result.user.uid), {
              display_name: result.user.displayName || "",
              email: result.user.email || "",
              photo_url: result.user.photoURL || "",
              created_time: new Date(),
              didInitProfile: false,
            });
            router.push("/onboarding");
          } else {
            const userData = userDoc.data();
            const hasProfile = userData.didInitProfile === true;
            router.push(hasProfile ? "/profile" : "/onboarding");
          }
        }
      } catch (error) {
        console.error("Redirect result error:", error);
      }
    };

    handleRedirectResult();
  }, [router]);

  const checkUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.didInitProfile === true;
      }
      return false;
    } catch (error) {
      console.error("Error checking user profile:", error);
      return false;
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const hasProfile = await checkUserProfile(userCredential.user.uid);
      router.push(hasProfile ? "/profile" : "/onboarding");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      console.error("Sign in error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      console.log("Starting Google sign-in process...");
      const provider = new GoogleAuthProvider();
      
      // Add scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      console.log("Calling signInWithPopup...");
      let result;
      
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError) {
        console.log("Popup failed, trying redirect:", popupError);
        // Fallback to redirect if popup is blocked
        await signInWithRedirect(auth, provider);
        return; // Redirect will handle the rest
      }
      
      console.log("Google sign-in successful:", result.user.email);

      // Check if user has a profile
      console.log("Checking user profile...");
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (!userDoc.exists()) {
        console.log("Creating new user profile...");
        // Create basic profile for Google user
        await setDoc(doc(db, "users", result.user.uid), {
          display_name: result.user.displayName || "",
          email: result.user.email || "",
          photo_url: result.user.photoURL || "",
          created_time: new Date(),
          didInitProfile: false,
        });
        console.log("User profile created, redirecting to onboarding");
        router.push("/onboarding");
      } else {
        console.log("User profile exists, checking if initialized...");
        const userData = userDoc.data();
        const hasProfile = userData.didInitProfile === true;
        console.log("User has profile:", hasProfile);
        router.push(hasProfile ? "/profile" : "/onboarding");
      }
    } catch (error: unknown) {
      console.error("Google sign in error details:", error);
      
      if (error instanceof Error) {
        const errorMessage = error.message;
        console.error("Error message:", errorMessage);
        
        // Handle specific Firebase auth errors
        if (errorMessage.includes('popup-closed-by-user')) {
          alert("Sign-in was cancelled. Please try again.");
        } else if (errorMessage.includes('popup-blocked')) {
          alert("Pop-up was blocked. Please allow pop-ups for this site and try again.");
        } else if (errorMessage.includes('auth/unauthorized-domain')) {
          alert("This domain is not authorized for Google sign-in. Please contact support.");
        } else if (errorMessage.includes('auth/network-request-failed')) {
          alert("Network error. Please check your internet connection and try again.");
        } else {
          alert(`Sign-in failed: ${errorMessage}`);
        }
      } else {
        alert("An unexpected error occurred during sign-in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="flex flex-row items-center justify-start h-screen overflow-hidden"
        style={{ backgroundColor: "#1B1D21" }}
      >
        {/* Desktop View */}
        <div
          className="hidden md:flex justify-center items-center h-full w-full"
          style={{ backgroundColor: "#1B1D21" }}
        >
          <div className="flex flex-col items-center justify-center relative max-w-md">
            <div className="flex flex-col items-center justify-center px-6 py-24 relative w-full">
              <div className="flex flex-col gap-6 items-start justify-start max-w-[360px] p-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-center w-full">
                  <div className="font-bold relative shrink-0 text-[30px] text-white w-full">
                    <p className="block leading-[36px]">Sign in</p>
                  </div>
                  <div className="font-normal relative shrink-0 text-[14px] text-gray-300 w-full">
                    <p className="block leading-[20px]">
                      Log in to unlock tailored content and stay connected with
                      your community.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors"
                    style={{
                      backgroundColor: "#212327",
                      borderColor: "#454446",
                    }}
                  >
                    <div className="flex flex-row items-center justify-center relative size-full">
                      <div className="flex flex-row gap-2 h-9 items-center justify-center px-4 py-2 relative w-full">
                        <div className="overflow-clip relative shrink-0 size-4">
                          <svg viewBox="0 0 24 24" className="size-full">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            ></path>
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            ></path>
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            ></path>
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            ></path>
                          </svg>
                        </div>
                        <div className="font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-left text-white text-nowrap">
                          <p className="block leading-[20px] whitespace-pre">
                            Continue with Google
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-full">
                  <div className="flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-full">
                    <div
                      className="h-0 relative shrink-0 w-full border-t"
                      style={{ borderColor: "#454446" }}
                    >
                      <div
                        className="absolute box-border flex flex-row items-center justify-center px-2 py-0 top-1/2 translate-x-[-50%] translate-y-[-50%]"
                        style={{
                          left: "calc(50% - 0.5px)",
                          backgroundColor: "#1B1D21",
                        }}
                      >
                        <div className="font-normal leading-[0] relative shrink-0 text-[12px] text-left text-gray-400 text-nowrap">
                          <p className="block leading-none whitespace-pre">
                            OR
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleEmailSignIn}
                  className="flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full"
                >
                  <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{
                        backgroundColor: "#212327",
                        borderColor: "#454446",
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                    <div className="relative w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent pr-10"
                        style={{
                          backgroundColor: "#212327",
                          borderColor: "#454446",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-eye"
                          aria-hidden="true"
                        >
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between p-0 relative shrink-0 w-full">
                    <button
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className="flex flex-row gap-2 items-start justify-start cursor-pointer"
                    >
                      <div
                        className={`relative rounded shrink-0 size-4 border ${
                          rememberMe ? "bg-green-500" : "bg-transparent"
                        }`}
                        style={{ borderColor: "#454446" }}
                      ></div>
                      <span className="font-medium text-[14px] text-white">
                        Remember me
                      </span>
                    </button>
                    <a
                      href="/forgot-password"
                      className="font-normal text-[14px] text-gray-400 underline hover:text-gray-300"
                    >
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-9 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full transition-colors disabled:opacity-50 bg-[var(--primary-dark)] hover:bg-[#0AFB84]"
                  >
                    <div className="flex flex-row items-center justify-center relative size-full">
                      <div className="flex flex-row gap-2 h-9 items-center justify-center px-4 py-2 relative w-full">
                        <div
                          className="font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-left text-nowrap"
                          style={{ color: "#212327" }}
                        >
                          <p className="block leading-[20px] whitespace-pre">
                            Sign in
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="flex flex-row font-normal gap-1 items-start justify-center leading-[0] p-0 relative shrink-0 text-[14px] text-center text-nowrap w-full">
                    <div className="relative shrink-0 text-gray-400">
                      <p className="block leading-[20px] text-nowrap whitespace-pre">
                        Don&apos;t have an account?
                      </p>
                    </div>
                    <a
                      href="/signup"
                      className="relative shrink-0 text-white underline hover:text-gray-300"
                    >
                      <p className="block leading-[20px] text-nowrap whitespace-pre">
                        Sign up
                      </p>
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div
          className="md:hidden relative size-full h-screen"
          style={{ backgroundColor: "#1B1D21" }}
        >
          <div className="flex flex-col items-center justify-center relative size-full">
            <div className="flex flex-col gap-2.5 items-center justify-center px-6 py-24 relative size-full">
              <div className="flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-center w-full">
                  <div className="font-bold relative shrink-0 text-[24px] text-white w-full">
                    <p className="block leading-[32px]">Sign in</p>
                  </div>
                  <div className="font-normal relative shrink-0 text-[14px] text-gray-300 w-full">
                    <p className="block leading-[20px]">
                      Log in to unlock tailored content and stay connected with
                      your community.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors"
                    style={{
                      backgroundColor: "#212327",
                      borderColor: "#454446",
                    }}
                  >
                    <div className="flex flex-row items-center justify-center relative size-full">
                      <div className="flex flex-row gap-2 h-9 items-center justify-center px-4 py-2 relative w-full">
                        <div className="overflow-clip relative shrink-0 size-4">
                          <svg viewBox="0 0 24 24" className="size-full">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            ></path>
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            ></path>
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            ></path>
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            ></path>
                          </svg>
                        </div>
                        <div className="font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-left text-white text-nowrap">
                          <p className="block leading-[20px] whitespace-pre">
                            Continue with Google
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-full">
                  <div className="flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-full">
                    <div
                      className="h-0 relative shrink-0 w-full border-t"
                      style={{ borderColor: "#454446" }}
                    >
                      <div
                        className="absolute box-border flex flex-row items-center justify-center px-2 py-0 top-1/2 translate-x-[-50%] translate-y-[-50%]"
                        style={{
                          left: "calc(50% - 0.5px)",
                          backgroundColor: "#1B1D21",
                        }}
                      >
                        <div className="font-normal leading-[0] relative shrink-0 text-[12px] text-left text-gray-400 text-nowrap">
                          <p className="block leading-none whitespace-pre">
                            OR
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleEmailSignIn}
                  className="flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full"
                >
                  <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{
                        backgroundColor: "#212327",
                        borderColor: "#454446",
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                    <div className="relative w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-3 py-1 text-[14px] text-white focus:outline-none focus:ring-2 focus:border-transparent pr-10"
                        style={{
                          backgroundColor: "#212327",
                          borderColor: "#454446",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-eye"
                          aria-hidden="true"
                        >
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between p-0 relative shrink-0 w-full">
                    <button
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className="flex flex-row gap-2 items-start justify-start cursor-pointer"
                    >
                      <div
                        className={`relative rounded shrink-0 size-4 border ${
                          rememberMe ? "bg-green-500" : "bg-transparent"
                        }`}
                        style={{ borderColor: "#454446" }}
                      ></div>
                      <span className="font-medium text-[14px] text-white">
                        Remember me
                      </span>
                    </button>
                    <a
                      href="/forgot-password"
                      className="font-normal text-[14px] text-gray-400 underline hover:text-gray-300"
                    >
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-9 relative rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full transition-colors disabled:opacity-50 bg-[var(--primary-dark)] hover:bg-[#0AFB84]"
                  >
                    <div className="flex flex-row items-center justify-center relative size-full">
                      <div className="flex flex-row gap-2 h-9 items-center justify-center px-4 py-2 relative w-full">
                        <div
                          className="font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-left text-nowrap"
                          style={{ color: "#212327" }}
                        >
                          <p className="block leading-[20px] whitespace-pre">
                            Sign in
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="flex flex-row font-normal gap-1 items-start justify-center leading-[0] p-0 relative shrink-0 text-[14px] text-center text-nowrap w-full">
                    <div className="relative shrink-0 text-gray-400">
                      <p className="block leading-[20px] text-nowrap whitespace-pre">
                        Don&apos;t have an account?
                      </p>
                    </div>
                    <a
                      href="/signup"
                      className="relative shrink-0 text-white underline hover:text-gray-300"
                    >
                      <p className="block leading-[20px] text-nowrap whitespace-pre">
                        Sign up
                      </p>
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
