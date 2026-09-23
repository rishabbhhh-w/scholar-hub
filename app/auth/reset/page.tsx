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
  Mail,
  RefreshCw,
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

  // Inline re-trigger reset link state
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    const checkSessionAndRecovery = async () => {
      try {
        // 0. Check for error param from callback route
        const urlError = searchParams.get("error");

        // 1. Check for URL hash params (#access_token=... or #error_description=...)
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        if (hash) {
          const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken) {
            const { data: setSessionData, error: setSessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || "",
              });

            if (!setSessionError && setSessionData?.session) {
              if (isMounted) {
                setShowForm(true);
                setIsVerifying(false);
              }
              return;
            }
          }
        }

        // 2. Check for PKCE code in query parameters
        const code = searchParams.get("code");
        if (code) {
          const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
          if (codeError) {
            if (isMounted) {
              // Friendly user message for PKCE storage or verifier mismatch
              setErrorMessage(
                "This password reset link has expired or was opened in a different browser session."
              );
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

        // 3. Listen for auth state changes (PASSWORD_RECOVERY or session established)
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

        // 4. Check initial existing session from cookies
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          if (isMounted) {
            setShowForm(true);
            setIsVerifying(false);
          }
          return;
        }

        // If URL error param was passed or no session after check
        if (urlError) {
          if (isMounted) {
            setErrorMessage(
              "This password reset link has expired or was opened in a different browser session."
            );
            setIsVerifying(false);
          }
          return;
        }

        // 2.5 second fallback timer to verify session state
        const timer = setTimeout(() => {
          if (isMounted && isVerifying) {
            supabase.auth.getSession().then(({ data }) => {
              if (data.session) {
                setShowForm(true);
              } else {
                setErrorMessage(
                  "Password reset session not found or link has expired. You can request a new reset link below."
                );
              }
              setIsVerifying(false);
            });
          }
        }, 2000);

        return () => {
          clearTimeout(timer);
          subscription.unsubscribe();
        };
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(
            "Password reset session not found or link has expired. You can request a new reset link below."
          );
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
        setSuccessMessage("Password updated successfully! Redirecting to sign in...");
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

  const handleResendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      setResendError("Please enter your email address.");
      return;
    }

    setIsResending(true);
    setResendError(null);
    setResendSuccess(null);

    try {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback?next=/auth/reset`
          : "";

      const { error } = await supabase.auth.resetPasswordForEmail(resendEmail.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        setResendError(error.message);
      } else {
        setResendSuccess(
          `A new password reset link has been sent to ${resendEmail.trim()}. Please check your inbox.`
        );
      }
    } catch (err: any) {
      setResendError(err?.message || "Failed to send new reset link.");
    } finally {
      setIsResending(false);
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
              {showForm
                ? "Enter your new secure password below."
                : "Verify password recovery link."}
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
            /* Invalid/Expired Link State with Inline Resend Option */
            <div className="space-y-5">
              <div className="rounded-2xl border border-amber-500/40 bg-amber-950/40 p-4 text-xs text-amber-200 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-100">Reset Link Expired or Invalid</p>
                  <p className="leading-relaxed opacity-90">
                    {errorMessage ||
                      "This link has expired or was opened in a different browser. Enter your email below to request a new link directly in this browser."}
                  </p>
                </div>
              </div>

              {resendError && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{resendError}</span>
                </div>
              )}

              {resendSuccess && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3.5 text-xs text-emerald-200 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{resendSuccess}</span>
                </div>
              )}

              {!resendSuccess && (
                <form onSubmit={handleResendLink} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                      Enter your email address *
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300/40" />
                      <input
                        type="email"
                        required
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-11 w-full rounded-xl border border-emerald-800/80 bg-[#05281e] pl-10 pr-4 text-sm text-white placeholder:text-emerald-300/40 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isResending}
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Send New Reset Link</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="pt-2 text-center">
                <Link href="/auth">
                  <span className="text-xs text-emerald-300/80 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                  </span>
                </Link>
              </div>
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
