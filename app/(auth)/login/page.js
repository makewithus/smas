"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { INSTITUTION } from "@/src/lib/constants";
import { sendPasswordResetEmail, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading: authLoading, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPortal, setSelectedPortal] = useState("boys");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Sign out the current user when they load the login page to prevent automatic authentication/bypass
  useEffect(() => {
    const performSignOut = async () => {
      try {
        await firebaseSignOut(auth);
        localStorage.removeItem("userProfile");
        localStorage.removeItem("portal");
      } catch (err) {
        console.error("Sign out error on login mount:", err);
      }
    };
    performSignOut();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    // Validation
    if (!normalizedEmail) {
      toast.error("Please enter your email");
      return;
    }

    if (!normalizedPassword) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      await signIn(normalizedEmail, normalizedPassword, selectedPortal);

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem("rememberEmail", normalizedEmail);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      // Redirect to dashboard
      router.push(`/${selectedPortal}/dashboard`);
    } catch (err) {
      // Show clean, user-friendly message — never expose raw Firebase internals
      const knownMessages = [
        "Access denied for this portal",
        "Your account has been deactivated",
        "User profile not found",
      ];
      const isKnownMessage = knownMessages.some((m) => err.message?.includes(m));
      const message = isKnownMessage
        ? err.message
        : "Invalid email or password. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error("Enter your email first, then click Forgot password");
      return;
    }
    try {
      setResetLoading(true);
      await sendPasswordResetEmail(auth, normalizedEmail);
      toast.success(
        "Password reset email sent. Reset your password, then try signing in again.",
      );
    } catch (err) {
      toast.error(err?.message || "Failed to send reset email. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-105">
        {/* Login Card */}
        <div className="bg-white border border-[#E8DFD4] rounded-md p-10 shadow-card">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-xl border border-[#E8DFD4] bg-[#F8F3ED] flex items-center justify-center mx-auto mb-4 overflow-hidden">
              <Image
                src="/smas_logo.png"
                alt={`${INSTITUTION.name} logo`}
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
                priority
              />
            </div>
            <h1 className="font-serif text-xl text-brand">
              {INSTITUTION.name}
            </h1>
            <p className="text-sm text-neutral-600">Administration Portal</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E8DFD4] my-6" />

          {/* Portal Selector */}
          <div className="mb-6">
            <div className="border border-[#E8DFD4] rounded-md p-0.5 flex">
              <button
                type="button"
                onClick={() => setSelectedPortal("boys")}
                className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
                  selectedPortal === "boys"
                    ? "bg-brand text-white"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Boys Portal
              </button>
              <button
                type="button"
                onClick={() => setSelectedPortal("girls")}
                className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
                  selectedPortal === "girls"
                    ? "bg-brand text-white"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Girls Portal
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full h-10 px-3 text-sm border border-[#E8DFD4] rounded-md bg-white focus:border-brand focus:ring-0"
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-10 px-3 pr-10 text-sm border border-[#E8DFD4] rounded-md bg-white focus:border-brand focus:ring-0"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading || resetLoading}
                  className="text-xs text-brand hover:underline disabled:opacity-50"
                >
                  {resetLoading ? "Sending reset email…" : "Forgot password?"}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#E8DFD4] text-brand focus:ring-brand"
              />
              <label htmlFor="remember" className="text-sm text-neutral-600">
                Remember me
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10.5 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-500 mt-6">
          {INSTITUTION.fullName}
        </p>
      </div>
    </div>
  );
}
