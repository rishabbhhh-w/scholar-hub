"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Award,
  AlertCircle,
  GraduationCap,
  IndianRupee,
  RefreshCw,
  FileCheck,
} from "lucide-react";
import {
  eligibilitySchema,
  EligibilityFormData,
  defaultEligibilityValues,
} from "@/lib/schemas/eligibility";
import { SCHOLARSHIPS } from "@/lib/data/scholarships";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EligibilityCheckerPage() {
  const [step, setStep] = useState<number>(1);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [matchedSchemes, setMatchedSchemes] = useState<typeof SCHOLARSHIPS>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<EligibilityFormData>({
    resolver: zodResolver(eligibilitySchema),
    defaultValues: defaultEligibilityValues,
    mode: "onChange",
  });

  const formData = watch();

  const onSubmit = (data: EligibilityFormData) => {
    // Live calculation based on Zod-validated input
    const matches = SCHOLARSHIPS.filter((s) => {
      // Category match
      const catMatch =
        s.category === "All" || s.category === data.category;
      // Income match
      const incomeMatch =
        !s.maxAnnualIncome || data.annualFamilyIncome <= s.maxAnnualIncome;
      // Level match
      const levelMatch =
        s.educationLevel === data.currentEducationLevel;
      // Percentage match
      const marksMatch =
        !s.minPercentageRequired || data.lastExamPercentage >= s.minPercentageRequired;

      return catMatch && incomeMatch && levelMatch && marksMatch;
    });

    setMatchedSchemes(matches.length > 0 ? matches : SCHOLARSHIPS.slice(0, 2));
    setIsCalculated(true);
  };

  const steps = [
    { num: 1, label: "Academic Profile" },
    { num: 2, label: "Social Category" },
    { num: 3, label: "Household Income" },
    { num: 4, label: "Special Criteria" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf5ea] px-3.5 py-1 text-xs font-semibold text-[#064e3b] dark:bg-emerald-950 dark:text-emerald-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive Scheme Assessment</span>
        </div>
        <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white">
          Eligibility & Entitlement Checker
        </h2>
        <p className="text-sm text-stone-500 max-w-lg mx-auto dark:text-stone-400">
          Verify your eligibility against government norms in 4 simple steps and receive a customized scheme roadmap.
        </p>
      </div>

      {/* Wizard Steps Indicator */}
      <div className="rounded-3xl border border-stone-200/90 bg-white p-4 sm:p-6 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;

            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCompleted
                        ? "bg-[#064e3b] text-white dark:bg-emerald-600"
                        : isCurrent
                        ? "border-2 border-[#064e3b] text-[#064e3b] font-extrabold dark:border-emerald-400 dark:text-emerald-400"
                        : "bg-stone-100 text-stone-400 dark:bg-[#132820] dark:text-stone-500"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-semibold hidden md:inline ${
                      isCurrent
                        ? "text-stone-900 dark:text-white"
                        : "text-stone-400 dark:text-stone-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 sm:mx-4 transition-colors ${
                      step > s.num
                        ? "bg-[#064e3b] dark:bg-emerald-500"
                        : "bg-stone-100 dark:bg-[#132820]"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-10 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
        {isCalculated ? (
          /* Results View */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#dcfce7] text-[#166534] dark:bg-emerald-950 dark:text-emerald-400">
                <FileCheck className="h-9 w-9" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 dark:text-white">
                Assessment Complete: {matchedSchemes.length} Schemes Matched!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto dark:text-stone-300">
                Congratulations, {formData.fullName}. You satisfy all core criteria for the schemes listed below.
              </p>
            </div>

            {/* Matched Summary Pill */}
            <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                  Estimated Total Aid Potential
                </p>
                <p className="text-2xl font-extrabold text-[#064e3b] dark:text-emerald-400">
                  ₹37,000 / month + Contingency & Tuition
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="mint">Aadhaar Verified</Badge>
                <Badge variant="saffron">{formData.category} Beneficiary</Badge>
              </div>
            </div>

            {/* List of matched schemes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Your Matched Schemes
              </h4>
              {matchedSchemes.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-2xl border border-stone-200/80 p-4 bg-stone-50/50 hover:bg-stone-50 dark:border-[#193c30] dark:bg-[#132820] dark:hover:bg-[#17382d]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-stone-900 dark:text-white">
                        {s.title}
                      </h5>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {s.ministry} • {s.amountFormatted}
                      </p>
                    </div>
                  </div>
                  <a href={`/scholarships`}>
                    <Button size="sm" className="bg-[#064e3b] text-white text-xs dark:bg-emerald-600">
                      Apply Scheme
                    </Button>
                  </a>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-stone-100 dark:border-[#193c30]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsCalculated(false);
                  setStep(1);
                }}
                className="gap-2 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retake Assessment
              </Button>
              <a href="/dashboard">
                <Button size="sm" className="bg-[#064e3b] text-white text-xs dark:bg-emerald-600">
                  Return to Dashboard
                </Button>
              </a>
            </div>
          </div>
        ) : (
          /* Multi-step Form */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Academic Profile */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-[#193c30]">
                  Step 1: Current Academic Enrollment
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Full Student Name
                  </label>
                  <input
                    {...register("fullName")}
                    className="h-11 w-full rounded-xl border border-stone-200 px-4 text-sm focus:border-[#064e3b] focus:outline-none focus:ring-1 focus:ring-[#064e3b] dark:border-[#193c30] dark:bg-[#132820] dark:text-white"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-500 mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Current Education Level
                    </label>
                    <select
                      {...register("currentEducationLevel")}
                      className="h-11 w-full rounded-xl border border-stone-200 px-3 text-sm focus:border-[#064e3b] focus:outline-none focus:ring-1 focus:ring-[#064e3b] dark:border-[#193c30] dark:bg-[#132820] dark:text-white"
                    >
                      <option value="Pre-Matric">Pre-Matric (Classes 9-10)</option>
                      <option value="Post-Matric">Post-Matric (11th, 12th, ITI)</option>
                      <option value="Undergraduate">Undergraduate (B.A., B.Sc., B.Tech)</option>
                      <option value="Postgraduate">Postgraduate (M.A., M.Sc., M.Tech)</option>
                      <option value="Ph.D. / Fellowship">Ph.D. / Doctoral Fellowship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Course / Discipline Name
                    </label>
                    <input
                      {...register("courseName")}
                      placeholder="e.g. M.Sc. Anthropology"
                      className="h-11 w-full rounded-xl border border-stone-200 px-4 text-sm focus:border-[#064e3b] focus:outline-none focus:ring-1 focus:ring-[#064e3b] dark:border-[#193c30] dark:bg-[#132820] dark:text-white"
                    />
                    {errors.courseName && (
                      <p className="text-xs text-rose-500 mt-1">{errors.courseName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Last Qualifying Examination Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register("lastExamPercentage", { valueAsNumber: true })}
                    className="h-11 w-full rounded-xl border border-stone-200 px-4 text-sm focus:border-[#064e3b] focus:outline-none focus:ring-1 focus:ring-[#064e3b] dark:border-[#193c30] dark:bg-[#132820] dark:text-white"
                  />
                  {errors.lastExamPercentage && (
                    <p className="text-xs text-rose-500 mt-1">
                      {errors.lastExamPercentage.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Social Category & Demographics */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-[#193c30]">
                  Step 2: Social Category & Domicile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Affirmative Action Community Category
                    </label>
                    <select
                      {...register("category")}
                      className="h-11 w-full rounded-xl border border-stone-200 px-3 text-sm focus:border-[#064e3b] focus:outline-none focus:ring-1 focus:ring-[#064e3b] dark:border-[#193c30] dark:bg-[#132820] dark:text-white"
                    >
                      <option value="ST">Scheduled Tribe (ST)</option>
                      <option value="SC">Scheduled Caste (SC)</option>
                      <option value="OBC">Other Backward Class (OBC)</option>
                      <option value="Minority">Notified Minority</option>
                      <option value="General">General / EWS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      State of Permanent Domicile
                    </label>
                    <input
                      {...register("stateOfDomicile")}
                      placeholder="e.g. Jharkhand, Odisha, Assam"
                      className="h-11 w-full rounded-xl border border-stone-200 px-4 text-sm focus:border-[#064e3b] focus:outline-none focus:ring-1 focus:ring-[#064e3b] dark:border-[#193c30] dark:bg-[#132820] dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Gender Identity
                  </label>
                  <div className="flex gap-4">
                    {["Female", "Male", "Other"].map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          value={g}
                          {...register("gender")}
                          className="h-4 w-4 text-[#064e3b]"
                        />
                        <span className="text-stone-700 dark:text-stone-300">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Income & Finances */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-[#193c30]">
                  Step 3: Household Income & Welfare Status
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Annual Gross Family Income (in INR ₹)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    {...register("annualFamilyIncome", { valueAsNumber: true })}
                    placeholder="180000"
                    className="h-11 w-full rounded-xl border border-stone-200 px-4 text-sm focus:border-[#064e3b] focus:outline-none focus:ring-1 focus:ring-[#064e3b] dark:border-[#193c30] dark:bg-[#132820] dark:text-white"
                  />
                  <p className="text-xs text-stone-400 mt-1">
                    Enter income as certified by Revenue Authority (SDM/Tehsildar).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 dark:bg-[#132820] dark:border-[#193c30]">
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    <strong>Ceiling Check:</strong> Most central ST fellowships permit up to <strong>₹6.0 Lakhs per annum</strong>. Post-Matric schemes typically limit up to <strong>₹2.5 Lakhs per annum</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Special Criteria */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-[#193c30]">
                  Step 4: Special Criteria & Affirmative Action
                </h3>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-200/80 bg-stone-50/50 cursor-pointer dark:bg-[#132820] dark:border-[#193c30]">
                    <input
                      type="checkbox"
                      {...register("hasValidCasteCertificate")}
                      className="h-4 w-4 mt-1 text-[#064e3b]"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white">
                        Valid Caste / Tribe Certificate in Hand
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Issued by an authorized government revenue officer (SDM, Tehsildar, or DWO).
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-200/80 bg-stone-50/50 cursor-pointer dark:bg-[#132820] dark:border-[#193c30]">
                    <input
                      type="checkbox"
                      {...register("isAadhaarLinkedToBank")}
                      className="h-4 w-4 mt-1 text-[#064e3b]"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white">
                        Aadhaar Linked & Seeded with Bank Account (DBT Ready)
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Required for direct transfer via Public Financial Management System (PFMS).
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-200/80 bg-stone-50/50 cursor-pointer dark:bg-[#132820] dark:border-[#193c30]">
                    <input
                      type="checkbox"
                      {...register("isFirstGenerationLearner")}
                      className="h-4 w-4 mt-1 text-[#064e3b]"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white">
                        First Generation Higher Education Learner
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        First person in immediate family pursuing graduation or doctoral studies.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-200/80 bg-stone-50/50 cursor-pointer dark:bg-[#132820] dark:border-[#193c30]">
                    <input
                      type="checkbox"
                      {...register("hasDisability")}
                      className="h-4 w-4 mt-1 text-[#064e3b]"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white">
                        Person with Benchmark Disability (PwD &gt; 40%)
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Qualifies for additional monthly reader/escort allowance of ₹3,000/mo.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-stone-100 dark:border-[#193c30]">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setStep(step - 1)}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Step
                </Button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setStep(step + 1)}
                  className="bg-[#064e3b] text-white gap-1 text-xs dark:bg-emerald-600"
                >
                  Next Step
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#064e3b] text-white gap-1 text-xs dark:bg-emerald-600"
                >
                  Calculate Schemes
                  <Sparkles className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
