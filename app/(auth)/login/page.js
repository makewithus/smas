"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { INSTITUTION } from "@/src/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading: authLoading, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPortal, setSelectedPortal] = useState("boys");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const p = localStorage.getItem("portal") || "boys";
      router.replace(`/${p}/dashboard`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password, selectedPortal);

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      // Redirect to dashboard
      router.push(`/${selectedPortal}/dashboard`);
    } catch (err) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
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
            <div className="w-8 h-8 bg-brand rounded-md flex items-center justify-center mx-auto mb-3">
              <span className="font-serif text-white text-lg">S</span>
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

            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle
                  size={16}
                  className="text-red-500 shrink-0 mt-0.5"
                />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
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
