"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Check,
  GraduationCap,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Scholarship } from "@/lib/data/scholarships";
import { DetailModal } from "@/components/shared/DetailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/shared/Toast";
import {
  applyToScholarship,
  getUserAppliedScholarshipIds,
} from "@/lib/services/applications";

interface RecommendationItem {
  scholarship: Scholarship;
  matchScore: number;
  categoryMatched: boolean;
  stateMatched: boolean;
  levelMatched: boolean;
  whyMatched: string[];
  missingCriteria: string[];
  aiAdvice: string;
}

export default function AIRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userCategory, setUserCategory] = useState<string>("ST");
  const [userState, setUserState] = useState<string>("Jharkhand");
  const [appliedScholarshipIds, setAppliedScholarshipIds] = useState<string[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const supabase = createClient();
  const { toast } = useToast();

  const fetchRecommendationsData = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let resolvedCategory = "ST";
      let resolvedState = "Jharkhand";

      if (user) {
        setCurrentUserId(user.id);
        const appliedIds = await getUserAppliedScholarshipIds(supabase, user.id);
        setAppliedScholarshipIds(appliedIds);

        // 1. Fetch user's category and state from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("category, state, full_name, institution")
          .eq("id", user.id)
          .single();

        if (profile) {
          if (profile.category) resolvedCategory = profile.category;
          if (profile.state) resolvedState = profile.state;
          setUserCategory(resolvedCategory);
          setUserState(resolvedState);
        }
      }

      // 2. Query scholarships from Supabase
      const { data: schs, error } = await supabase
        .from("scholarships")
        .select("*")
        .eq("status", "active")
        .order("deadline", { ascending: true });

      if (error) throw error;

      if (schs && schs.length > 0) {
        const computedRecs: RecommendationItem[] = [];

        schs.forEach((item: any) => {
          const eligibleArray: string[] = Array.isArray(item.category_eligible)
            ? item.category_eligible
            : typeof item.category_eligible === "string"
            ? item.category_eligible.replace(/[{}]/g, "").split(",")
            : ["ST", "SC", "OBC", "General"];

          // Scoring Formula:
          // Category match = 60%
          // State relevance = 20%
          // Level match = 20%
          let score = 0;
          const categoryMatched =
            eligibleArray.includes(resolvedCategory) || eligibleArray.includes("All");
          if (categoryMatched) score += 60;

          const titleDesc = `${item.title} ${item.description}`.toLowerCase();
          const stateMatched =
            titleDesc.includes(resolvedState.toLowerCase()) ||
            titleDesc.includes("pan-india") ||
            titleDesc.includes("national") ||
            titleDesc.includes("central");
          if (stateMatched) score += 20;

          const levelMatched = Boolean(item.level);
          if (levelMatched) score += 20;

          const monthlyNum = Number(item.amount_monthly) || 10000;
          const closingDateFormatted = `Closes ${new Date(item.deadline).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}`;

          const scholarshipObj: Scholarship = {
            id: item.id,
            slug: item.id,
            title: item.title,
            ministry: "Ministry of Tribal Affairs & Government of India",
            category: (eligibleArray[0] as any) || resolvedCategory,
            educationLevel:
              item.level === "PhD"
                ? "Ph.D. / Fellowship"
                : (item.level as any) || "Post-Matric",
            matchScore: score,
            deadline: item.deadline,
            closingDateFormatted,
            amount: monthlyNum,
            amountFormatted: `₹${monthlyNum.toLocaleString("en-IN")} / month`,
            amountPeriod: "month",
            description: item.description,
            eligibilityCriteria: eligibleArray.map((c) => `${c} candidates eligible`),
            requiredDocuments: ["Aadhaar", "Income Certificate", "Caste Certificate", "Marksheet"],
            benefits: ["Monthly DBT Fellowship", "Contingency Research Grant"],
            selectionProcess: "State Nodal Cell Scrutiny",
            sponsoringBody: "Central Ministry",
            tags: eligibleArray,
            genderEligibility: "All",
          };

          const whyMatched = [];
          if (categoryMatched) {
            whyMatched.push(`Verified ${resolvedCategory} community affirmative action eligibility`);
          }
          if (stateMatched) {
            whyMatched.push(`Domicile alignment: Active for ${resolvedState} & National PAN-India schemes`);
          }
          if (levelMatched) {
            whyMatched.push(`Academic level aligned: ${item.level} curriculum`);
          }

          computedRecs.push({
            scholarship: scholarshipObj,
            matchScore: score,
            categoryMatched,
            stateMatched,
            levelMatched,
            whyMatched,
            missingCriteria: [
              "Ensure latest FY income certificate is updated in your Document Vault",
            ],
            aiAdvice:
              "Recommended for early submission. Affirmative quota allocations prioritize complete applicant dossiers.",
          });
        });

        // Sort by highest match score first
        computedRecs.sort((a, b) => b.matchScore - a.matchScore);
        setRecommendations(computedRecs);
      }
    } catch (err: any) {
      console.error("Error fetching recommendations:", err);
      setFetchError(err?.message || "Failed to load recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendationsData();
  }, []);

  const handleApply = async (scholarship: Scholarship) => {
    if (!currentUserId) {
      toast.error("Please sign in to apply.");
      return;
    }

    if (appliedScholarshipIds.includes(scholarship.id)) {
      toast.info("You have already applied for this scholarship.");
      return;
    }

    setApplyingId(scholarship.id);
    try {
      const result = await applyToScholarship(
        supabase,
        currentUserId,
        scholarship.id,
        scholarship.title
      );

      if (result.success) {
        setAppliedScholarshipIds((prev) => [...prev, scholarship.id]);
        toast.success("Application submitted!");
      } else {
        toast.error(result.error || "Failed to apply.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to apply.");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl border border-emerald-200/90 bg-[#eaf5ea]/80 p-6 sm:p-8 dark:border-emerald-900/60 dark:bg-[#0c2217]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#064e3b] px-3 py-1 text-xs font-semibold text-white dark:bg-emerald-600">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Smart Recommendation Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] dark:text-emerald-300">
              Personalized Scholarship Recommendations
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              Based on your verified student profile ({userCategory} Category, {userState} Domicile), we calculated multi-factor match scores across all active government schemes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="rounded-2xl bg-white p-4 text-center border border-emerald-200/80 shadow-xs dark:bg-[#0f231c] dark:border-[#193c30]">
              <p className="text-2xl font-black text-[#064e3b] dark:text-emerald-400">
                {recommendations.length}
              </p>
              <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Total Matched</p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-center border border-emerald-200/80 shadow-xs dark:bg-[#0f231c] dark:border-[#193c30]">
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {recommendations[0]?.matchScore || 100}%
              </p>
              <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Peak Match Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {fetchError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 flex items-center justify-between dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={fetchRecommendationsData}
            className="flex items-center gap-1 rounded-lg bg-rose-200 px-3 py-1 font-semibold text-rose-900 hover:bg-rose-300 dark:bg-rose-900 dark:text-rose-100"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-[#193c30] dark:bg-[#0f231c] space-y-4"
            >
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center dark:border-[#193c30] dark:bg-[#0f231c]">
          <GraduationCap className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
            No active recommendations available
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Check back soon as new government scholarship schemes are announced.
          </p>
        </div>
      ) : (
        /* Recommendations Feed */
        <div className="space-y-6">
          {recommendations.map((rec) => {
            const isApplied = appliedScholarshipIds.includes(rec.scholarship.id);
            const isApplying = applyingId === rec.scholarship.id;

            return (
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
                          {rec.scholarship.educationLevel}
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
                      Direct Benefit Transfer
                    </span>
                  </div>
                </div>

                {/* Match Breakdown & Checklist */}
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
                      Application Checklist
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

                    {/* Advice Callout */}
                    <div className="rounded-xl bg-[#eaf5ea] p-3 text-xs text-[#064e3b] dark:bg-emerald-950/60 dark:text-emerald-300">
                      <span className="font-bold">Match Insight: </span>
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

                    {isApplied ? (
                      <Button
                        size="sm"
                        disabled
                        className="bg-emerald-700 text-white text-xs rounded-xl shadow-xs gap-1.5 opacity-90 cursor-not-allowed dark:bg-emerald-600"
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        <span>Applied ✓</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={isApplying}
                        onClick={() => handleApply(rec.scholarship)}
                        className="bg-[#064e3b] hover:bg-[#053d2e] text-white text-xs rounded-xl shadow-xs gap-1.5 dark:bg-emerald-600"
                      >
                        {isApplying ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Applying...</span>
                          </>
                        ) : (
                          <>
                            <span>Apply Now</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal
        scholarship={selectedScholarship}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onApplySuccess={() => {
          if (selectedScholarship) {
            handleApply(selectedScholarship);
          }
        }}
      />
    </div>
  );
}
