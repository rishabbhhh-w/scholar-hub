"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Bell,
  RefreshCw,
  Award,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { Scholarship } from "@/lib/data/scholarships";
import { ScholarshipCard } from "@/components/shared/ScholarshipCard";
import { DetailModal } from "@/components/shared/DetailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/hooks/useUserProfile";
import { useToast } from "@/components/shared/Toast";
import {
  applyToScholarship,
  getUserAppliedScholarshipIds,
} from "@/lib/services/applications";

interface UpcomingDeadlineItem {
  id: string;
  title: string;
  deadline: string;
  closesFormatted: string;
  daysRemaining: number;
  urgent: boolean;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // User Profile Data
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("student");
  const [userCategory, setUserCategory] = useState<string>("ST");
  const [userState, setUserState] = useState<string>("Jharkhand");
  const [userInstitution, setUserInstitution] = useState<string>("Central University of Jharkhand");

  // Dynamic Real KPIs
  const [matchedCount, setMatchedCount] = useState<number>(0);
  const [applicationCount, setApplicationCount] = useState<number>(0);
  const [documentCount, setDocumentCount] = useState<number>(0);
  const [flaggedDocCount, setFlaggedDocCount] = useState<number>(0);
  const [profileCompletion, setProfileCompletion] = useState<number>(0);

  // Top Matched Fellowship & Deadlines
  const [topFellowship, setTopFellowship] = useState<Scholarship | null>(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadlineItem[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [appliedScholarshipIds, setAppliedScholarshipIds] = useState<string[]>([]);
  const [isApplyingTop, setIsApplyingTop] = useState(false);

  const [isSupabaseLoaded, setIsSupabaseLoaded] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const supabase = createClient();

  const loadDashboardData = async () => {
    setIsSupabaseLoaded(false);
    setFetchError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);

        // 1. Fetch Profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role, category, state, institution")
          .eq("id", user.id)
          .single();

        let resolvedName = "Scholar User";
        let resolvedCategory = "ST";
        let resolvedState = "Jharkhand";
        let resolvedInstitution = "Central University of Jharkhand";

        if (profile) {
          if (profile.full_name) resolvedName = profile.full_name;
          if (profile.role) setUserRole(profile.role);
          if (profile.category) resolvedCategory = profile.category;
          if (profile.state) resolvedState = profile.state;
          if (profile.institution) resolvedInstitution = profile.institution;
        } else if (user.user_metadata?.full_name) {
          resolvedName = user.user_metadata.full_name;
        }

        setUserName(resolvedName);
        setUserCategory(resolvedCategory);
        setUserState(resolvedState);
        setUserInstitution(resolvedInstitution);

        // Calculate Profile Completion %
        let readyPct = 0;
        if (profile?.full_name?.trim()) readyPct += 25;
        if (profile?.category?.trim()) readyPct += 25;
        if (profile?.state?.trim()) readyPct += 25;
        if (profile?.institution?.trim()) readyPct += 25;
        setProfileCompletion(readyPct);

        // 2. Applications Count & Applied IDs
        const appliedIds = await getUserAppliedScholarshipIds(supabase, user.id);
        setAppliedScholarshipIds(appliedIds);
        setApplicationCount(appliedIds.length);

        // 3. Documents Count & Flagged Count
        const { count: docsTotal } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        const { count: docsFlagged } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "flagged");

        setDocumentCount(docsTotal || 0);
        setFlaggedDocCount(docsFlagged || 0);

        // 4. Fetch Active Scholarships from Supabase
        const { data: allActiveSchs } = await supabase
          .from("scholarships")
          .select("*")
          .eq("status", "active")
          .order("deadline", { ascending: true });

        if (allActiveSchs && allActiveSchs.length > 0) {
          // Count matched where user's category is in category_eligible
          const matchingSchs = allActiveSchs.filter((item: any) => {
            const eligArray: string[] = Array.isArray(item.category_eligible)
              ? item.category_eligible
              : typeof item.category_eligible === "string"
              ? item.category_eligible.replace(/[{}]/g, "").split(",")
              : ["ST", "SC", "OBC", "General"];

            return eligArray.includes(resolvedCategory) || eligArray.includes("All");
          });

          setMatchedCount(matchingSchs.length);

          // Top Matched Fellowship
          const topOne = matchingSchs[0] || allActiveSchs[0];
          if (topOne) {
            const eligibleTags = Array.isArray(topOne.category_eligible)
              ? topOne.category_eligible
              : [resolvedCategory];

            setTopFellowship({
              id: topOne.id,
              slug: topOne.id,
              title: topOne.title,
              ministry: "Ministry of Tribal Affairs",
              category: (eligibleTags[0] as any) || resolvedCategory,
              educationLevel:
                topOne.level === "PhD"
                  ? "Ph.D. / Fellowship"
                  : (topOne.level as any) || "Post-Matric",
              matchScore: 96,
              deadline: topOne.deadline,
              closingDateFormatted: `Closes ${new Date(topOne.deadline).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}`,
              amount: Number(topOne.amount) || 37000,
              amountFormatted: `₹${Number(topOne.amount || 37000).toLocaleString("en-IN")} / month`,
              amountPeriod: "month",
              description: topOne.description,
              eligibilityCriteria: [
                `Eligible for ${resolvedCategory} scholars`,
                "Enrolled in recognized University",
              ],
              requiredDocuments: ["Aadhaar", "Income Certificate", "Caste Certificate"],
              benefits: ["Monthly DBT Stipend", "Academic Research Grant"],
              selectionProcess: "State Nodal Officer Merit Review",
              sponsoringBody: "Central Ministry",
              tags: eligibleTags,
              genderEligibility: "All",
            });
          }

          // Upcoming Deadlines (within 60 days or nearest)
          const now = Date.now();
          const deadlinesList: UpcomingDeadlineItem[] = allActiveSchs.map((sch: any) => {
            const dDate = new Date(sch.deadline);
            const diffDays = Math.ceil((dDate.getTime() - now) / (1000 * 60 * 60 * 24));
            return {
              id: sch.id,
              title: sch.title,
              deadline: sch.deadline,
              closesFormatted: dDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              daysRemaining: diffDays,
              urgent: diffDays >= 0 && diffDays <= 15,
            };
          }).filter((item) => item.daysRemaining >= 0);

          setUpcomingDeadlines(deadlinesList.slice(0, 4));
        }

        // 5. Recent Notifications from Supabase
        const { data: notifs } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (notifs) setRecentNotifications(notifs);
      }
    } catch (err: any) {
      console.error("Dashboard data load error:", err);
      setFetchError("Unable to load live dashboard stats. Please check connection.");
    } finally {
      setIsSupabaseLoaded(true);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadDashboardData();
  }, []);

  const handleApplyTopFellowship = async (scholarship: Scholarship) => {
    if (!currentUserId) {
      toast.error("Please sign in to apply.");
      return;
    }

    if (appliedScholarshipIds.includes(scholarship.id)) {
      router.push("/applications");
      return;
    }

    setIsApplyingTop(true);
    try {
      const result = await applyToScholarship(
        supabase,
        currentUserId,
        scholarship.id,
        scholarship.title
      );

      if (result.success) {
        setAppliedScholarshipIds((prev) => [...prev, scholarship.id]);
        setApplicationCount((prev) => prev + 1);
        toast.success("Application submitted!");
        setTimeout(() => {
          router.push("/applications");
        }, 1200);
      } else {
        toast.error(result.error || "Failed to submit application.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to apply.");
    } finally {
      setIsApplyingTop(false);
    }
  };

  const userInitials = getInitials(userName);

  return (
    <div className="space-y-8">
      {/* Error Retry Banner */}
      {fetchError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 flex items-center justify-between dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-1 rounded-lg bg-rose-200 px-3 py-1 font-semibold text-rose-900 hover:bg-rose-300 dark:bg-rose-900 dark:text-rose-100"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* Top Greeting Banner */}
      {!isSupabaseLoaded ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-stone-200/90 bg-white p-6 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-stone-200/90 bg-white p-6 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#dcfce7] text-base font-bold text-[#166534] dark:bg-emerald-950 dark:text-emerald-300 ring-4 ring-emerald-50 dark:ring-emerald-950/40">
              {userInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white">
                  Good afternoon, {userName}
                </h2>
                <Badge variant="mint" size="sm">
                  {userCategory} Candidate
                </Badge>
              </div>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {userInstitution} · {userState} Domicile · Aadhaar Linked
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/eligibility">
              <Button variant="secondary" size="sm" className="text-xs">
                Check Eligibility
              </Button>
            </Link>
            <Link href="/scholarships">
              <Button size="sm" className="bg-[#064e3b] hover:bg-[#053d2e] text-white text-xs gap-1.5 dark:bg-emerald-600">
                <span>Find Scholarships</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Real Dynamic KPI Stat Cards */}
      {!isSupabaseLoaded ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c] space-y-3"
            >
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* 1. MATCHED: Count of active scholarships where user's category matches */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                MATCHED
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-stone-900 dark:text-white">
              {matchedCount}
            </p>
            <p className="mt-1 text-xs text-emerald-700 font-medium dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Matching {userCategory} Category
            </p>
          </div>

          {/* 2. APPLICATIONS: Real count from applications table */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                APPLICATIONS
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-stone-700 dark:bg-[#132820] dark:text-stone-300">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-stone-900 dark:text-white">
              {applicationCount}
            </p>
            <p className="mt-1 text-xs text-[#064e3b] font-semibold dark:text-emerald-400">
              Submitted to Nodal Cell
            </p>
          </div>

          {/* 3. DOCUMENTS: Real count from documents table */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                DOCUMENTS
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-stone-900 dark:text-white">
              {documentCount}
            </p>
            <p className="mt-1 text-xs font-semibold text-stone-500 dark:text-stone-400">
              {flaggedDocCount > 0 ? `${flaggedDocCount} need attention` : "Stored in Secure Vault"}
            </p>
          </div>

          {/* 4. PROFILE READY: Calculated 25% per completed field */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                PROFILE READY
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-[#064e3b] dark:text-emerald-400">
              {profileCompletion}%
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-[#193c30]">
              <div
                className="h-full rounded-full bg-[#064e3b] dark:bg-emerald-500 transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Recent Notifications (Last 3 from Supabase) */}
      {recentNotifications.length > 0 && (
        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#064e3b] dark:text-emerald-400" />
              Recent Notifications
            </h3>
            <Link
              href="/notifications"
              className="text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
            >
              View all
            </Link>
          </div>

          <div className="space-y-2">
            {recentNotifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-[#132820] text-xs"
              >
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">
                    {n.title}
                  </p>
                  <p className="text-stone-600 dark:text-stone-300 mt-0.5">{n.message}</p>
                </div>
                <Badge variant={n.is_read ? "subtle" : "mint"} size="sm">
                  {n.is_read ? "Read" : "New"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Top Fellowship & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Top Matched Fellowship */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-[#193c30]">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Top Matched Fellowship
                </h3>
              </div>
              <Link
                href="/scholarships"
                className="text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Explore all schemes
              </Link>
            </div>

            <div className="mt-5">
              {topFellowship ? (
                <ScholarshipCard
                  scholarship={topFellowship}
                  isApplied={appliedScholarshipIds.includes(topFellowship.id)}
                  isApplying={isApplyingTop}
                  onApply={handleApplyTopFellowship}
                  onViewDetails={(s) => {
                    setSelectedScholarship(s);
                    setModalOpen(true);
                  }}
                />
              ) : (
                <div className="py-8 text-center text-xs text-stone-500">
                  No active schemes matching your criteria currently.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Deadlines */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-[#193c30]">
              <h4 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#064e3b] dark:text-emerald-400" />
                Upcoming Deadlines
              </h4>
              <span className="text-[11px] text-stone-400">Next 60 Days</span>
            </div>

            <div className="mt-3 space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-stone-500 py-3 text-center">
                  No deadlines approaching in the next 60 days.
                </p>
              ) : (
                upcomingDeadlines.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-xl border border-stone-100 p-3 bg-stone-50/50 dark:border-[#193c30] dark:bg-[#132820]"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate" title={d.title}>
                        {d.title}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        Closes {d.closesFormatted}
                      </p>
                    </div>
                    <Badge variant={d.urgent ? "warning" : "subtle"} size="sm">
                      {d.daysRemaining} days left
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <DetailModal
        scholarship={selectedScholarship}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onApplySuccess={() => {
          if (selectedScholarship) {
            handleApplyTopFellowship(selectedScholarship);
          }
        }}
      />
    </div>
  );
}
