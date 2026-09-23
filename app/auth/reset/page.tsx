"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/shared/Logo";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    const checkSessionAndRecovery = async () => {
      try {
        // 1. Check for PKCE code in query parameters
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            if (isMounted) {
              setErrorMessage(error.message);
              setIsVerifying(false);
            }
            return;
          }
          if (isMounted) {
            setShowForm(true);
            setIsVerifying(false);
          }
          return;
        }

        // 2. Check initial session from URL hash or existing token
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          if (isMounted) {
            setShowForm(true);
            setIsVerifying(false);
          }
        }

        // 3. Listen for auth state changes (PASSWORD_RECOVERY event)
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === "PASSWORD_RECOVERY" || session) {
            if (isMounted) {
              setShowForm(true);
              setIsVerifying(false);
            }
          }
        });

        // 2.5 second fallback timer to verify session state
        const timer = setTimeout(() => {
          if (isMounted && isVerifying) {
            supabase.auth.getSession().then(({ data }) => {
              if (data.session) {
                setShowForm(true);
              } else {
                setErrorMessage("Invalid or expired password reset link. Please request a new link.");
              }
              setIsVerifying(false);
            });
          }
        }, 2500);

        return () => {
          clearTimeout(timer);
          subscription.unsubscribe();
        };
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err?.message || "Failed to verify password reset link.");
          setIsVerifying(false);
        }
      }
    };

    checkSessionAndRecovery();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please make sure both fields are identical.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
      } else {
        setSuccessMessage("Password updated successfully!");
        setIsLoading(false);
        setTimeout(() => {
          router.push("/auth?mode=login");
        }, 2000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while updating your password.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#053225] flex flex-col items-center justify-center p-4 sm:p-6 text-white select-none">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Official Brand Logo */}
        <div className="flex justify-center">
          <Logo size="md" inverted />
        </div>

        {/* Centered Card Design matching /auth page style */}
        <div className="rounded-3xl bg-[#084131] border border-emerald-800/60 p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
              <Lock className="h-7 w-7 text-emerald-400" />
              Reset Password
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80">
              Enter your new secure password below.
            </p>
          </div>

          {/* Verifying State */}
          {isVerifying ? (
            <div className="space-y-4 py-6 text-center">
              <div className="flex justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
              </div>
              <p className="text-xs text-emerald-200/80">
                Verifying password reset link...
              </p>
            </div>
          ) : !showForm ? (
            /* Invalid/Expired Link State */
            <div className="space-y-4 text-center">
              {errorMessage && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3.5 text-xs text-rose-300 text-left flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <Link href="/auth">
                <button
                  type="button"
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition-all"
                >
                  Back to Sign In
                </button>
              </Link>
            </div>
          ) : (
            /* Reset Form */
            <div className="space-y-4">
              {errorMessage && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3.5 text-xs text-emerald-200 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="h-11 w-full rounded-xl border border-emerald-800/80 bg-[#05281e] px-4 pr-11 text-sm text-white placeholder:text-emerald-300/40 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300/60 hover:text-white"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                    Confirm Password *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="h-11 w-full rounded-xl border border-emerald-800/80 bg-[#05281e] px-4 text-sm text-white placeholder:text-emerald-300/40 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-all disabled:opacity-60"
                >
                  {isLoading ? "Updating Password..." : "Update Password"}
                </button>
              </form>

              <div className="pt-2 text-center">
                <Link href="/auth">
                  <span className="text-xs text-emerald-300/80 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-emerald-200/50">
          Official Scholar Hub Platform · Protected by Row Level Security
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#053225] flex items-center justify-center text-sm font-semibold text-white">
          Loading Password Reset...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
