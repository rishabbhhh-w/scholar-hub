"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  IndianRupee,
  ChevronRight,
  Bell,
  User,
  RefreshCw,
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
import { SCHOLARSHIPS } from "@/lib/data/scholarships";
import { ScholarshipCard } from "@/components/shared/ScholarshipCard";
import { DetailModal } from "@/components/shared/DetailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/hooks/useUserProfile";

const STATUS_DATA = [
  { name: "Sanctioned & Disbursed", value: 3, color: "#064e3b" },
  { name: "Under Verification", value: 4, color: "#10b981" },
  { name: "Action Required", value: 1, color: "#f59e0b" },
  { name: "Drafts", value: 1, color: "#94a3b8" },
];

const DISBURSEMENT_DATA = [
  { month: "May", amount: 37000 },
  { month: "Jun", amount: 37000 },
  { month: "Jul", amount: 37000 },
  { month: "Aug", amount: 42000 },
  { month: "Sep (Est)", amount: 74000 },
];

export default function StudentDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Real Supabase State
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("student");
  const [userCategory, setUserCategory] = useState<string>("ST");
  const [userState, setUserState] = useState<string>("Jharkhand");
  const [userInstitution, setUserInstitution] = useState<string>("Central University of Jharkhand");

  const [applicationCount, setApplicationCount] = useState<number>(0);
  const [documentCount, setDocumentCount] = useState<number>(0);
  const [flaggedDocCount, setFlaggedDocCount] = useState<number>(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  const [isSupabaseLoaded, setIsSupabaseLoaded] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const supabase = createClient();

  const loadSupabaseDashboardData = async () => {
    setIsSupabaseLoaded(false);
    setFetchError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 1. Fetch Profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role, category, state, institution")
          .eq("id", user.id)
          .single();

        if (profile?.full_name) {
          setUserName(profile.full_name);
        } else if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name);
        } else if (user.email) {
          setUserName(user.email.split("@")[0]);
        } else {
          setUserName("Scholar User");
        }

        if (profile?.role) setUserRole(profile.role);
        if (profile?.category) setUserCategory(profile.category);
        if (profile?.state) setUserState(profile.state);
        if (profile?.institution) setUserInstitution(profile.institution);

        // 2. Applications count
        const { count: appCount, error: appError } = await supabase
          .from("applications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (!appError && appCount !== null) setApplicationCount(appCount);

        // 3. Documents count & flagged count
        const { count: docsTotal } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        const { count: docsFlagged } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "flagged");

        if (docsTotal !== null) setDocumentCount(docsTotal);
        if (docsFlagged !== null) setFlaggedDocCount(docsFlagged);

        // 4. Notifications
        const { data: notifs } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (notifs) setRecentNotifications(notifs);
      } else {
        setUserName("Scholar User");
      }
    } catch (err: any) {
      setFetchError("Unable to sync live data with Supabase. Showing cached portal state.");
      setUserName("Scholar User");
    } finally {
      setIsSupabaseLoaded(true);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadSupabaseDashboardData();
  }, []);

  const featured = SCHOLARSHIPS[0];
  const userInitials = getInitials(userName);

  return (
    <div className="space-y-8">
      {/* Network / Supabase error fallback banner */}
      {fetchError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-center justify-between dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={loadSupabaseDashboardData}
            className="flex items-center gap-1 rounded-lg bg-amber-200 px-3 py-1 font-semibold text-amber-900 hover:bg-amber-300 dark:bg-amber-900 dark:text-amber-100"
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
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-36 rounded-xl" />
            <Skeleton className="h-9 w-36 rounded-xl" />
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
                  {userRole === "admin" || userRole === "nodal_officer" ? "Nodal Officer" : `${userCategory} Candidate`}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {userInstitution} · Aadhaar Seeded (DBT Active) · {userState} Domicile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/eligibility">
              <Button variant="secondary" size="sm" className="text-xs">
                Check New Eligibility
              </Button>
            </Link>
            <Link href="/scholarships">
              <Button size="sm" className="bg-[#064e3b] text-white text-xs gap-1.5 dark:bg-emerald-600">
                <span>Find Scholarships</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      {!isSupabaseLoaded ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c] space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* 1. Scholarships Matched */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Matched
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-stone-900 dark:text-white">24</p>
            <p className="mt-1 text-xs text-emerald-700 font-medium dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +4 new schemes this month
            </p>
          </div>

          {/* 2. Applications Count from Supabase */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Applications
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-stone-700 dark:bg-[#132820] dark:text-stone-300">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-stone-900 dark:text-white">
              {applicationCount}
            </p>
            <p className="mt-1 text-xs text-[#064e3b] font-semibold dark:text-emerald-400">
              Live Applications in Database
            </p>
          </div>

          {/* 3. Document Progress */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Documents
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-stone-900 dark:text-white">
              {documentCount} <span className="text-sm font-normal text-stone-400">/ 10</span>
            </p>
            <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              {flaggedDocCount > 0 ? `${flaggedDocCount} require attention` : "All documents verified"}
            </p>
          </div>

          {/* 4. Profile Completion */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Profile Ready
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-[#064e3b] dark:text-emerald-400">82%</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-[#193c30]">
              <div className="h-full rounded-full bg-[#064e3b] dark:bg-emerald-500 w-[82%]" />
            </div>
          </div>
        </div>
      )}

      {/* Recent Supabase Notifications Box */}
      {recentNotifications.length > 0 && (
        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#064e3b] dark:text-emerald-400" />
              Recent Supabase Notifications
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
                className="flex items-start justify-between p-3 rounded-2xl bg-stone-50 dark:bg-[#132820] text-xs"
              >
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">
                    {n.title || n.message}
                  </p>
                  <p className="text-stone-500 mt-0.5">{n.message}</p>
                </div>
                <Badge variant={n.is_read ? "subtle" : "mint"} size="sm">
                  {n.is_read ? "Read" : "New"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Left 8 Cols for Highlight Scheme & Charts, Right 4 Cols for Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Top Recommendation Showcase Card */}
          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-[#193c30]">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Top Matched Fellowship for You
                </h3>
              </div>
              <Link
                href="/recommendations"
                className="text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400 flex items-center gap-1"
              >
                View all recommendations <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-5">
              <ScholarshipCard
                scholarship={featured}
                onViewDetails={(s) => {
                  setSelectedScholarship(s);
                  setModalOpen(true);
                }}
                onQuickApply={(s) => {
                  setSelectedScholarship(s);
                  setModalOpen(true);
                }}
              />
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
              <h4 className="text-sm font-bold text-stone-900 dark:text-white mb-1">
                Application Pipeline
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                Current status of submitted dossiers
              </p>
              <div className="h-52 w-full">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={STATUS_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {STATUS_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-stone-400">Loading chart...</div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-3 text-[11px]">
                {STATUS_DATA.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-stone-600 dark:text-stone-300 font-medium">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
              <h4 className="text-sm font-bold text-stone-900 dark:text-white mb-1">
                Direct Benefit Transfer (DBT)
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                Monthly fellowship credits received via PFMS
              </p>
              <div className="h-52 w-full">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DISBURSEMENT_DATA}>
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val/1000}k`} />
                      <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, "DBT Credit"]} />
                      <Bar dataKey="amount" fill="#064e3b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-stone-400">Loading chart...</div>
                )}
              </div>
              <div className="mt-2 text-center text-xs text-emerald-800 font-semibold dark:text-emerald-400">
                Total Received FY 2026-27: ₹1,53,000
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-amber-200/90 bg-amber-50/70 p-5 dark:border-amber-900/60 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                  Action Required: Document Vault
                </h4>
                <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-300 leading-relaxed">
                  Income Certificate FY 2026-27 and Bonafide seal need verification before nodal review deadline.
                </p>
                <Link href="/documents" className="mt-3 inline-block">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-xl">
                    Resolve in Document Vault
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-[#193c30]">
              <h4 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#064e3b] dark:text-emerald-400" />
                Upcoming Deadlines
              </h4>
              <span className="text-[11px] text-stone-400">Sep - Dec 2026</span>
            </div>

            <div className="mt-3 space-y-3">
              {[
                {
                  title: "National Fellowship for ST Students",
                  closes: "31 Oct 2026",
                  daysLeft: "43 days left",
                  urgent: true,
                },
                {
                  title: "Pre-Matric Tribal Scholarship",
                  closes: "30 Sep 2026",
                  daysLeft: "12 days left",
                  urgent: true,
                },
                {
                  title: "Post-Matric Scholarship for ST",
                  closes: "15 Nov 2026",
                  daysLeft: "58 days left",
                  urgent: false,
                },
                {
                  title: "National Overseas Scholarship",
                  closes: "15 Dec 2026",
                  daysLeft: "88 days left",
                  urgent: false,
                },
              ].map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-stone-100 p-3 bg-stone-50/50 dark:border-[#193c30] dark:bg-[#132820]"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                      {d.title}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Closes {d.closes}
                    </p>
                  </div>
                  <Badge variant={d.urgent ? "warning" : "subtle"} size="sm">
                    {d.daysLeft}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DetailModal
        scholarship={selectedScholarship}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
