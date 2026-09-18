"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Brain,
  Sliders,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { SCHOLARSHIPS, Scholarship } from "@/lib/data/scholarships";
import { DetailModal } from "@/components/shared/DetailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function AIRecommendationsPage() {
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Recommendations enriched with AI explainability details
  const recommendations = [
    {
      scholarship: SCHOLARSHIPS[0], // National Fellowship for ST Students
      matchScore: 96,
      awardProbability: "Very High (94%)",
      confidence: "High",
      whyMatched: [
        "Notified ST community applicant verified via Jharkhand Revenue portal",
        "Current full-time enrollment in Ph.D. program at Central University of Jharkhand",
        "Family income ₹1.8 LPA is well within the ₹6.0 LPA central ceiling",
        "Academic record: 74.5% aggregate in M.Sc. Anthropology surpasses the 55% benchmark",
      ],
      missingCriteria: [
        "Awaiting signed supervisor joining certificate for final submission dossier",
      ],
      aiAdvice:
        "Submit this application first. The Ministry of Tribal Affairs prioritizes research scholars working on tribal indigenous culture and heritage.",
    },
    {
      scholarship: SCHOLARSHIPS[1], // Post-Matric Scholarship for ST Students
      matchScore: 94,
      awardProbability: "Universal Entitlement (100%)",
      confidence: "Very High",
      whyMatched: [
        "Mandatory affirmative scheme with zero quota capping for ST students",
        "Institutional fee structure verified with CUJ administrative wing",
        "Aadhaar bank account seeded and verified active on NPCI DBT portal",
      ],
      missingCriteria: [
        "Action required: Upload current FY 2026-27 Income Certificate to replace 2024-25 copy",
      ],
      aiAdvice:
        "Ensure your Tehsildar-issued income certificate is re-uploaded by 25 Sep to receive the full tuition fee reimbursement.",
    },
    {
      scholarship: SCHOLARSHIPS[3], // Top Class Education Scheme for ST Students
      matchScore: 92,
      awardProbability: "High (88%)",
      confidence: "High",
      whyMatched: [
        "Enrolled in a centrally funded premier institution",
        "Covers complete institutional expenses plus ₹86,000 annual living and laptop grant",
      ],
      missingCriteria: [
        "Submit original fee receipt with university account officer stamp",
      ],
      aiAdvice:
        "Apply before October 31st to secure the ₹45,000 computer grant allocation.",
    },
    {
      scholarship: SCHOLARSHIPS[2], // National Overseas Scholarship for ST
      matchScore: 89,
      awardProbability: "Competitive (72%)",
      confidence: "Moderate",
      whyMatched: [
        "Master's degree percentage (74.5%) exceeds the mandatory 55% threshold",
        "Candidate under 35 years of age",
      ],
      missingCriteria: [
        "Requires unconditional admission offer letter from QS Top 500 foreign university",
        "Valid passport with minimum 2-year validity required",
      ],
      aiAdvice:
        "Prepare for the upcoming foreign university cycle. Sarthi AI can review your Statement of Purpose (SOP).",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl border border-emerald-200/90 bg-[#eaf5ea]/80 p-6 sm:p-8 dark:border-emerald-900/60 dark:bg-[#0c2217]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#064e3b] px-3 py-1 text-xs font-semibold text-white dark:bg-emerald-600">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Sarthi AI Neural Matcher 2.0</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] dark:text-emerald-300">
              Personalized Scholarship Recommendations
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              Based on your verified student profile (ST, Jharkhand, Ph.D. in Tribal Studies, ₹1.8 LPA Income), Sarthi AI evaluated 142 schemes to find your highest funding potentials.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="rounded-2xl bg-white p-4 text-center border border-emerald-200/80 shadow-xs dark:bg-[#0f231c] dark:border-[#193c30]">
              <p className="text-2xl font-black text-[#064e3b] dark:text-emerald-400">₹4.8L+</p>
              <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Total Potential Aid</p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-center border border-emerald-200/80 shadow-xs dark:bg-[#0f231c] dark:border-[#193c30]">
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">96%</p>
              <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Peak Match Index</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-6">
        {recommendations.map((rec, index) => (
          <div
            key={rec.scholarship.id}
            className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-soft transition-all duration-200 hover:border-emerald-700/30 hover:shadow-elevated dark:border-[#193c30] dark:bg-[#0f231c]"
          >
            {/* Header: Score, Title, Amount */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-100 dark:border-[#193c30]">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-[#064e3b] dark:bg-emerald-950 dark:text-emerald-300">
                      <Sparkles className="h-3 w-3" />
                      {rec.matchScore}% Match
                    </span>
                    <Badge variant="subtle" size="sm">
                      Award Probability: {rec.awardProbability}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                    {rec.scholarship.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {rec.scholarship.ministry} • {rec.scholarship.closingDateFormatted}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-lg font-extrabold text-[#064e3b] dark:text-emerald-400">
                  {rec.scholarship.amountFormatted}
                </p>
                <span className="text-[11px] text-stone-400">
                  {rec.scholarship.sponsoringBody}
                </span>
              </div>
            </div>

            {/* Match Breakdown & Missing Criteria */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Why you matched */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Why You Matched ({rec.whyMatched.length} criteria satisfied)
                </h4>
                <div className="space-y-2">
                  {rec.whyMatched.map((reason, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-xl bg-stone-50 p-2.5 text-xs text-stone-700 dark:bg-[#132820] dark:text-stone-300"
                    >
                      <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable / Missing items */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Actionable Checklist ({rec.missingCriteria.length})
                </h4>
                <div className="space-y-2">
                  {rec.missingCriteria.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-xl bg-amber-50/70 p-2.5 text-xs text-amber-900 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40"
                    >
                      <span className="text-amber-600 font-bold mt-0.5">!</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* AI Advice Callout */}
                <div className="rounded-xl bg-[#eaf5ea] p-3 text-xs text-[#064e3b] dark:bg-emerald-950/60 dark:text-emerald-300">
                  <span className="font-bold">Sarthi AI Insight: </span>
                  {rec.aiAdvice}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-stone-100 dark:border-[#193c30]">
              <div className="flex items-center gap-2">
                <div className="h-2 w-36 overflow-hidden rounded-full bg-stone-100 dark:bg-[#193c30]">
                  <div
                    className="h-full rounded-full bg-[#064e3b] dark:bg-emerald-500"
                    style={{ width: `${rec.matchScore}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  {rec.matchScore}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedScholarship(rec.scholarship);
                    setModalOpen(true);
                  }}
                  className="text-xs"
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedScholarship(rec.scholarship);
                    setModalOpen(true);
                  }}
                  className="bg-[#064e3b] text-white text-xs rounded-xl shadow-xs gap-1.5 dark:bg-emerald-600"
                >
                  <span>Start Application</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <DetailModal
        scholarship={selectedScholarship}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
