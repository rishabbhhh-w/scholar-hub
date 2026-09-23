"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/shared/Logo";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const confirmEmail = async () => {
      try {
        const supabase = createClient();

        // 1. Extract query parameters
        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");
        const type = (searchParams.get("type") as any) || "signup";

        // 2. Extract hash parameters (e.g. #error=... or #access_token=...)
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
        const hashError = hashParams.get("error_description") || hashParams.get("error");

        if (hashError) {
          if (isMounted) {
            setErrorMessage(decodeURIComponent(hashError));
            setStatus("error");
          }
          return;
        }

        // Exchange PKCE code if present in URL
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            if (isMounted) {
              setErrorMessage(error.message);
              setStatus("error");
            }
            return;
          }
          if (isMounted) setStatus("success");
          return;
        }

        // Verify token_hash if present in URL
        if (tokenHash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type === "recovery" ? "recovery" : type === "email" ? "email" : "signup",
          });
          if (error) {
            if (isMounted) {
              setErrorMessage(error.message);
              setStatus("error");
            }
            return;
          }
          if (isMounted) setStatus("success");
          return;
        }

        // Check if user session already verified / active
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          if (isMounted) setStatus("success");
          return;
        }

        // Listen for auth state change
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" || session) {
            if (isMounted) setStatus("success");
          }
        });

        // 2.5 second fallback timer
        const timer = setTimeout(() => {
          subscription.unsubscribe();
          supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
              if (isMounted) setStatus("success");
            } else {
              if (isMounted) setStatus("error");
            }
          });
        }, 2500);

        return () => {
          clearTimeout(timer);
          subscription.unsubscribe();
        };
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err?.message || "An error occurred during verification.");
          setStatus("error");
        }
      }
    };

    confirmEmail();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

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

        {/* Card */}
        <div className="rounded-3xl bg-[#084131] border border-emerald-800/60 p-8 sm:p-10 shadow-2xl text-center space-y-6">
          {status === "loading" && (
            <div className="space-y-6 py-4">
              <div className="flex justify-center">
                <Loader2 className="h-14 w-14 animate-spin text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Verifying your email...</h2>
                <p className="text-xs text-emerald-200/80">
                  Please wait while we confirm your account details with Scholar Hub.
                </p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              {/* Large green checkmark */}
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 text-emerald-400 shadow-inner">
                  <Check className="h-10 w-10 stroke-[3]" />
                </div>
              </div>

              {/* Text details */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Email Confirmed!
                </h1>
                <p className="text-sm text-emerald-100/90 leading-relaxed max-w-xs mx-auto">
                  Your account has been verified successfully. You can now sign in to Scholar Hub.
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link href="/auth">
                  <button
                    type="button"
                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    Sign in now
                  </button>
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              {/* Red error icon */}
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/20 border-2 border-rose-400/40 text-rose-400 shadow-inner">
                  <X className="h-10 w-10 stroke-[3]" />
                </div>
              </div>

              {/* Text details */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Confirmation Failed
                </h1>
                <p className="text-sm text-rose-200/90 leading-relaxed max-w-xs mx-auto">
                  This link may have expired. Please register again.
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link href="/auth">
                  <button
                    type="button"
                    className="w-full h-12 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-semibold text-sm shadow-lg transition-all active:scale-[0.99]"
                  >
                    Back to Sign In
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-emerald-200/50">
          Official Scholar Hub Platform · Ministry of Tribal Affairs
        </p>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#053225] flex items-center justify-center text-sm font-semibold text-white">
          Loading confirmation...
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
