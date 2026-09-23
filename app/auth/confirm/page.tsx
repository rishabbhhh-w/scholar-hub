"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/shared/Logo";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let redirectTimer: NodeJS.Timeout;

    const handleRedirect = () => {
      redirectTimer = setTimeout(() => {
        if (isMounted) {
          router.push("/dashboard");
        }
      }, 2000);
    };

    const confirmEmail = async () => {
      try {
        const supabase = createClient();

        // 1. First check if user already has an active session
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (initialSession) {
          if (isMounted) {
            setStatus("success");
            handleRedirect();
          }
          return;
        }

        // 2. Check for access_token in URL hash (#access_token=...&refresh_token=...)
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        if (hash) {
          const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken) {
            const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || "",
            });

            if (!setSessionError && setSessionData?.session) {
              if (isMounted) {
                setStatus("success");
                handleRedirect();
              }
              return;
            }
          }
        }

        // 3. Extract query parameters from URL
        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");
        const type = (searchParams.get("type") as any) || "signup";

        // Exchange PKCE code if present
        if (code) {
          const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!codeError) {
            if (isMounted) {
              setStatus("success");
              handleRedirect();
            }
            return;
          }
        }

        // Verify token_hash if present
        if (tokenHash) {
          const { error: tokenError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type === "recovery" ? "recovery" : type === "email" ? "email" : "signup",
          });
          if (!tokenError) {
            if (isMounted) {
              setStatus("success");
              handleRedirect();
            }
            return;
          }
        }

        // 4. Check session again after attempting token verification
        const {
          data: { session: postSession },
        } = await supabase.auth.getSession();

        if (postSession) {
          if (isMounted) {
            setStatus("success");
            handleRedirect();
          }
          return;
        }

        // 5. If token verification fails AND no session exists -> show error state
        if (isMounted) {
          setErrorMessage("This link may have expired. Please register again.");
          setStatus("error");
        }
      } catch (err: any) {
        // Defensive check: if session exists despite error, show success
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          if (isMounted) {
            setStatus("success");
            handleRedirect();
          }
        } else {
          if (isMounted) {
            setErrorMessage(err?.message || "This link may have expired. Please register again.");
            setStatus("error");
          }
        }
      }
    };

    confirmEmail();

    return () => {
      isMounted = false;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [searchParams, router]);

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
                  Your account is verified. Redirecting to dashboard...
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link href="/dashboard">
                  <button
                    type="button"
                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    Go to Dashboard
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
                  {errorMessage || "This link may have expired. Please register again."}
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
