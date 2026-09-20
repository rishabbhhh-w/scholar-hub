"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Mail,
  User,
  ShieldCheck,
  AlertCircle,
  Building,
  MapPin,
  Check,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/shared/Logo";

function calculatePasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: "", color: "bg-stone-200" };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { score: 25, label: "Weak", color: "bg-rose-500" };
  if (score === 2) return { score: 50, label: "Fair", color: "bg-amber-500" };
  if (score === 3) return { score: 75, label: "Good", color: "bg-emerald-500" };
  return { score: 100, label: "Strong", color: "bg-emerald-600" };
}

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [stateName, setStateName] = useState("");
  const [institution, setInstitution] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isResetSending, setIsResetSending] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "register") setMode("register");
    else if (urlMode === "login") setMode("login");
  }, [searchParams]);

  const passwordStrength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    setIsLoading(true);
    setErrorMessage(null);
    setIsRegisterSuccess(false);

    try {
      if (mode === "login") {
        if (!email.trim() || !password) {
          setErrorMessage("Please fill in all mandatory fields.");
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          let userMsg = error.message;
          if (error.message.includes("Invalid login credentials")) {
            userMsg = "Incorrect email or password. Please check your details and try again.";
          } else if (error.message.includes("Email not confirmed")) {
            userMsg = "Please confirm your email address before logging in.";
          }
          setErrorMessage(userMsg);
          setIsLoading(false);
          return;
        }

        if (data?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

          const targetRole = profile?.role || data.user.user_metadata?.role || "student";
          if (targetRole === "nodal_officer" || targetRole === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
          router.refresh();
        }
      } else {
        // Register Mandatory Field Validation
        if (
          !name.trim() ||
          !category ||
          !stateName ||
          !institution.trim() ||
          !email.trim() ||
          !password ||
          !confirmPassword
        ) {
          setErrorMessage("Please complete all mandatory fields marked with an asterisk (*).");
          setIsLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMessage("Passwords do not match. Please ensure both fields are identical.");
          setIsLoading(false);
          return;
        }

        if (password.length < 8) {
          setErrorMessage("Password must be at least 8 characters long.");
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              role: "student",
              category,
              state: stateName.trim(),
              institution: institution.trim(),
            },
          },
        });

        if (error) {
          let userMsg = error.message;
          if (error.message.includes("User already registered") || error.message.includes("unique constraint")) {
            userMsg = "An account with this email address already exists. Please sign in instead.";
          }
          setErrorMessage(userMsg);
          setIsLoading(false);
          setIsRegisterSuccess(false);
          return;
        }

        if (data?.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: name.trim(),
            email: email.trim(),
            role: "student",
            category,
            state: stateName.trim(),
            institution: institution.trim(),
          });
        }

        setIsLoading(false);
        setIsRegisterSuccess(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during authentication.");
      setIsLoading(false);
      setIsRegisterSuccess(false);
    }
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    setIsResetSending(true);
    setErrorMessage(null);
    setResetSuccessMessage(null);

    try {
      const redirectUrl = typeof window !== "undefined" ? window.location.origin + "/auth/reset" : "";
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setResetSuccessMessage(
          `A password reset link has been sent to ${email.trim()}. Please check your email inbox.`
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send reset link.");
    } finally {
      setIsResetSending(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#fcfbf9] dark:bg-[#07130e]">
      {/* Left Panel: Deep Forest Green Brand Banner */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-[#053225] p-12 lg:flex xl:p-16 text-white overflow-hidden select-none">
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10">
          <Logo size="md" inverted />
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            OFFICIAL SCHOLARSHIP MANAGEMENT SYSTEM
          </span>

          <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
            A clearer way to fund your education.
          </h2>

          <p className="text-base text-emerald-100/80 leading-relaxed font-normal">
            Join thousands of tribal, Dalit, and minority scholars discovering verified scholarships, tracking direct benefit transfers, and securing their educational future.
          </p>

          <div className="pt-2 flex flex-col gap-2.5 text-xs font-medium text-emerald-200/90">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>DigiLocker Certified Document Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Direct Benefit Transfer (DBT) via PFMS Gateway</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>End-to-End Row Level Security (RLS) Protection</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-emerald-200/60">
          Scholar Hub · Ministry of Tribal Affairs Affirmative Action Desk
        </div>
      </div>

      {/* Right Panel: Clean Auth Form */}
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-12 lg:w-1/2 lg:p-16 xl:p-20 overflow-y-auto">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors dark:text-stone-400 dark:hover:text-white mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to home</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
              {showForgotPassword
                ? "Reset Password"
                : mode === "login"
                ? "Welcome back"
                : "Create account"}
            </h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {showForgotPassword
                ? "Enter your email address to receive a password reset link."
                : mode === "login"
                ? "Sign in to access your scholarship portal."
                : "Register to discover government scholarships & fellowships."}
            </p>
          </div>

          {/* Forgot Password Flow */}
          {showForgotPassword ? (
            <div className="space-y-4">
              {errorMessage && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {resetSuccessMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{resetSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleSendResetLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Email address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#074635] focus:outline-none focus:ring-1 focus:ring-[#074635] dark:border-[#193c30] dark:bg-[#0f231c] dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isResetSending}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-[#074635] px-4 text-sm font-semibold text-white shadow-md hover:bg-[#053628] transition-all disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  {isResetSending ? "Sending Reset Link..." : "Send Reset Link"}
                </button>
              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setErrorMessage(null);
                    setResetSuccessMessage(null);
                  }}
                  className="text-xs font-semibold text-[#074635] hover:underline dark:text-emerald-400"
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          ) : isRegisterSuccess ? (
            <div
              className="rounded-3xl p-8 shadow-xl text-center space-y-6 text-white"
              style={{
                background: "linear-gradient(to bottom, #053225, #0a4a35)",
                border: "1px solid #1a6b4a",
              }}
            >
              <div className="flex justify-center pt-2">
                <CheckCircle2 className="h-16 w-16 text-[#4ade80]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Registration Successful!
                </h2>
                <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                  A confirmation email has been sent to{" "}
                  <span className="font-semibold text-emerald-200 underline underline-offset-2 decoration-emerald-400/50">
                    {email}
                  </span>
                  . Please check your inbox and click the confirmation link to activate your account.
                </p>
              </div>

              <p className="text-xs text-white/70 leading-relaxed pt-1">
                Didn't receive the email? Check your spam folder or wait a few minutes.
              </p>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterSuccess(false);
                    setMode("login");
                    setErrorMessage(null);
                    setPassword("");
                    setConfirmPassword("");
                    setAttemptedSubmit(false);
                  }}
                  className="w-full h-12 rounded-xl text-sm font-semibold text-white transition-all shadow-md hover:bg-[#053d2e] active:scale-[0.99]"
                  style={{ backgroundColor: "#064e3b" }}
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Segmented Pill Toggle */}
              <div className="mb-6 grid grid-cols-2 rounded-2xl bg-stone-100 p-1.5 dark:bg-[#132820]">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMessage(null);
                    setAttemptedSubmit(false);
                  }}
                  className={`rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    mode === "login"
                      ? "bg-[#074635] text-white shadow-sm dark:bg-emerald-600"
                      : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErrorMessage(null);
                    setAttemptedSubmit(false);
                  }}
                  className={`rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    mode === "register"
                      ? "bg-[#074635] text-white shadow-sm dark:bg-emerald-600"
                      : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Error / Alert banner */}
              {errorMessage && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {mode === "register" && (
                  <>
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Full Name"
                        className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 dark:bg-[#0f231c] dark:text-white ${
                          attemptedSubmit && !name.trim()
                            ? "border-rose-500 dark:border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                            : "border-stone-200 focus:border-[#074635] focus:ring-[#074635] dark:border-[#193c30]"
                        }`}
                      />
                      {attemptedSubmit && !name.trim() && (
                        <p className="text-[11px] font-medium text-rose-500 mt-1">
                          This field is required
                        </p>
                      )}
                    </div>

                    {/* Social Category & Domicile State */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Social Category */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                          Social Category *
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-stone-900 focus:outline-none focus:ring-1 dark:bg-[#0f231c] dark:text-white ${
                            attemptedSubmit && !category
                              ? "border-rose-500 dark:border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                              : "border-stone-200 focus:border-[#074635] focus:ring-[#074635] dark:border-[#193c30]"
                          }`}
                        >
                          <option value="" disabled>
                            Select category *
                          </option>
                          <option value="ST">Scheduled Tribe (ST)</option>
                          <option value="SC">Scheduled Caste (SC)</option>
                          <option value="OBC">Other Backward Class (OBC)</option>
                          <option value="General">General / EWS</option>
                          <option value="Minority">Minority</option>
                        </select>
                        {attemptedSubmit && !category && (
                          <p className="text-[11px] font-medium text-rose-500 mt-1">
                            This field is required
                          </p>
                        )}
                      </div>

                      {/* Domicile State */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                          Domicile State *
                        </label>
                        <select
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-stone-900 focus:outline-none focus:ring-1 dark:bg-[#0f231c] dark:text-white ${
                            attemptedSubmit && !stateName
                              ? "border-rose-500 dark:border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                              : "border-stone-200 focus:border-[#074635] focus:ring-[#074635] dark:border-[#193c30]"
                          }`}
                        >
                          <option value="" disabled>
                            Select state *
                          </option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                          <option value="Assam">Assam</option>
                          <option value="Bihar">Bihar</option>
                          <option value="Chhattisgarh">Chhattisgarh</option>
                          <option value="Goa">Goa</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Haryana">Haryana</option>
                          <option value="Himachal Pradesh">Himachal Pradesh</option>
                          <option value="Jharkhand">Jharkhand</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Manipur">Manipur</option>
                          <option value="Meghalaya">Meghalaya</option>
                          <option value="Mizoram">Mizoram</option>
                          <option value="Nagaland">Nagaland</option>
                          <option value="Odisha">Odisha</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Sikkim">Sikkim</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Tripura">Tripura</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Uttarakhand">Uttarakhand</option>
                          <option value="West Bengal">West Bengal</option>
                          <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                          <option value="Chandigarh">Chandigarh</option>
                          <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                          <option value="Ladakh">Ladakh</option>
                          <option value="Lakshadweep">Lakshadweep</option>
                          <option value="Puducherry">Puducherry</option>
                        </select>
                        {attemptedSubmit && !stateName && (
                          <p className="text-[11px] font-medium text-rose-500 mt-1">
                            This field is required
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Institution / University */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        Institution / University *
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="Enter your institution / university name"
                        className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 dark:bg-[#0f231c] dark:text-white ${
                          attemptedSubmit && !institution.trim()
                            ? "border-rose-500 dark:border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                            : "border-stone-200 focus:border-[#074635] focus:ring-[#074635] dark:border-[#193c30]"
                        }`}
                      />
                      {attemptedSubmit && !institution.trim() && (
                        <p className="text-[11px] font-medium text-rose-500 mt-1">
                          This field is required
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Email address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 dark:bg-[#0f231c] dark:text-white ${
                      attemptedSubmit && !email.trim()
                        ? "border-rose-500 dark:border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                        : "border-stone-200 focus:border-[#074635] focus:ring-[#074635] dark:border-[#193c30]"
                    }`}
                  />
                  {attemptedSubmit && !email.trim() && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1">
                      This field is required
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className={`h-11 w-full rounded-xl border bg-white px-4 pr-11 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 dark:bg-[#0f231c] dark:text-white ${
                        attemptedSubmit && !password
                          ? "border-rose-500 dark:border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                          : "border-stone-200 focus:border-[#074635] focus:ring-[#074635] dark:border-[#193c30]"
                      }`}
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
                  {attemptedSubmit && !password && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1">
                      This field is required
                    </p>
                  )}

                  {/* Forgot Password Link on Sign In form */}
                  {mode === "login" && (
                    <div style={{ textAlign: "right", marginTop: "6px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setErrorMessage(null);
                          setResetSuccessMessage(null);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#666",
                          fontSize: "13px",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Password Strength Indicator on Register */}
                  {mode === "register" && password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-medium text-stone-500">
                        <span>Password Strength:</span>
                        <span className="font-bold text-stone-700 dark:text-stone-300">{passwordStrength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden dark:bg-[#193c30]">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password on Register */}
                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Confirm Password *
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 dark:bg-[#0f231c] dark:text-white ${
                        attemptedSubmit && (!confirmPassword || confirmPassword !== password)
                          ? "border-rose-500 dark:border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                          : "border-stone-200 focus:border-[#074635] focus:ring-[#074635] dark:border-[#193c30]"
                      }`}
                    />
                    {attemptedSubmit && !confirmPassword && (
                      <p className="text-[11px] font-medium text-rose-500 mt-1">
                        This field is required
                      </p>
                    )}
                  </div>
                )}

                {/* Mandatory Note */}
                {mode === "register" && (
                  <p className="text-xs text-stone-400 dark:text-stone-500 pt-1">
                    * All fields are mandatory
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[#074635] px-4 text-sm font-semibold text-white shadow-md hover:bg-[#053628] transition-all disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  {isLoading
                    ? "Authenticating with Supabase..."
                    : mode === "login"
                    ? "Sign in to portal"
                    : "Create account"}
                </button>
              </form>

              {/* Subtle Admin Login Link on Sign In tab */}
              {mode === "login" && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setIsAdminLogin(!isAdminLogin)}
                    className="text-[12px] text-stone-500 opacity-50 hover:opacity-100 transition-opacity font-normal"
                  >
                    {isAdminLogin ? "Back to Student Login" : "Admin? Login here"}
                  </button>
                  {isAdminLogin && (
                    <p className="mt-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                      Use your admin credentials provided by the development team
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          <p className="mt-8 text-center text-xs text-stone-400 dark:text-stone-500">
            Official Scholar Hub Platform · Protected by Row Level Security
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fcfbf9] flex items-center justify-center text-sm font-semibold text-stone-500">Loading Scholar Hub Auth Portal...</div>}>
      <AuthContent />
    </Suspense>
  );
}
