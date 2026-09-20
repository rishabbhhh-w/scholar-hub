"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/shared/Logo";

function ResetPasswordContent() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please make sure both fields are identical.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
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
        setSuccessMessage("Your password has been reset successfully! Redirecting to sign in...");
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
    <div className="flex min-h-screen w-full bg-[#fcfbf9] dark:bg-[#07130e]">
      {/* Left Brand Panel */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-[#053225] p-12 lg:flex xl:p-16 text-white overflow-hidden select-none">
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10">
          <Logo size="md" inverted />
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            ACCOUNT SECURITY & AUTHENTICATION
          </span>

          <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
            Set your new secure password.
          </h2>

          <p className="text-base text-emerald-100/80 leading-relaxed font-normal">
            Choose a strong password containing at least 8 characters with a mix of letters, numbers, and symbols.
          </p>
        </div>

        <div className="relative z-10 text-xs text-emerald-200/60">
          Scholar Hub · Ministry of Tribal Affairs Affirmative Action Desk
        </div>
      </div>

      {/* Right Reset Password Form */}
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-12 lg:w-1/2 lg:p-16 xl:p-20 overflow-y-auto">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors dark:text-stone-400 dark:hover:text-white mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to sign in</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
              <Lock className="h-7 w-7 text-[#074635] dark:text-emerald-400" />
              Set New Password
            </h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Enter and confirm your new password below.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 pr-11 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#074635] focus:outline-none focus:ring-1 focus:ring-[#074635] dark:border-[#193c30] dark:bg-[#0f231c] dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 dark:bg-[#0f231c] dark:text-white ${
                  confirmPassword && confirmPassword !== newPassword
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
                    : "border-stone-200 focus:border-[#074635] focus:ring-[#074635] dark:border-[#193c30]"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[#074635] px-4 text-sm font-semibold text-white shadow-md hover:bg-[#053628] transition-all disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              {isLoading ? "Updating Password..." : "Update Password"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-stone-400 dark:text-stone-500">
            Official Scholar Hub Platform · Protected by Row Level Security
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fcfbf9] flex items-center justify-center text-sm font-semibold text-stone-500">Loading Password Reset...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
