"use client";

import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface SignUpModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function SignUpModal({ isOpen, setIsOpen, onSuccess }: SignUpModalProps) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      console.error("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!agreeToTerms) {
      console.error("Please agree to the Terms of Service and Privacy Policy");
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setIsOpen(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/profile");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      console.error("Sign up error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsOpen(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/profile");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      console.error("Google sign up error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 10000 }}>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-[#1B1D21] p-6">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-white hover:text-gray-300"
        >
          ✕
        </button>

        {/* Main Sign-Up Component */}
        {/* You can move your full sign-up JSX content here, or split it into another component and import it */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Sign up</h2>
            <p className="text-gray-300 text-sm mt-1">
              Create your account to get started with SkillTrait.
            </p>
          </div>

          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="h-9 relative rounded-lg shrink-0 w-full border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors"
            style={{ backgroundColor: "#212327", borderColor: "#454446" }}
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

          <div className="relative text-center text-gray-400 text-sm my-2">
            <hr className="border-t border-[#454446]" />
            <span className="bg-[#1B1D21] px-2 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              OR
            </span>
          </div>

          <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="rounded-lg px-3 py-2 bg-[#212327] border border-[#454446] text-white focus:ring-2 focus:outline-none"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="rounded-lg px-3 py-2 bg-[#212327] border border-[#454446] text-white w-full pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                👁
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="rounded-lg px-3 py-2 bg-[#212327] border border-[#454446] text-white w-full pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                👁
              </button>
            </div>

            <label className="flex gap-2 text-white text-sm items-center">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={() => setAgreeToTerms(!agreeToTerms)}
              />
              I agree to the Terms of Service and Privacy Policy
            </label>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-400 text-black font-semibold py-2 rounded-lg"
            >
              Sign Up
            </button>

            <div className="text-center text-sm text-white mt-2">
              Already have an account?{" "}
              <a
                href="/signin"
                className="underline text-gray-300 hover:text-white"
              >
                Sign in
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
