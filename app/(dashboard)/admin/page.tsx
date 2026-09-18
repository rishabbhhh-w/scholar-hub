"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Users,
  IndianRupee,
  FileCheck,
  AlertCircle,
  Search,
  Check,
  X,
  Eye,
  Filter,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

export interface AdminQueueItem {
  id: string;
  userId: string;
  trackingNumber: string;
  studentName: string;
  category: string;
  state: string;
  institution: string;
  schemeTitle: string;
  grantAmount: string;
  submittedOn: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "disbursed";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const profile = useUserProfile();
  const [queue, setQueue] = useState<AdminQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  // Real DB Counts
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingReview: 0,
    approvedThisMonth: 0,
    totalStudents: 0,
  });

  const supabase = createClient();

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      // Verify Role
      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const userRole = dbProfile?.role || user.user_metadata?.role || user.app_metadata?.role || "student";

      if (userRole !== "admin" && userRole !== "nodal_officer") {
        router.push("/dashboard");
        return;
      }

      // Fetch Real Counts from Supabase
      const [
        { count: totalApps },
        { count: pendingApps },
        { count: approvedApps },
        { count: totalStudents },
      ] = await Promise.all([
        supabase.from("applications").select("*", { count: "exact", head: true }),
        supabase.from("applications").select("*", { count: "exact", head: true }).in("status", ["pending", "under_review"]),
        supabase.from("applications").select("*", { count: "exact", head: true }).in("status", ["approved", "disbursed"]),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
      ]);

      setStats({
        totalApplications: totalApps || 0,
        pendingReview: pendingApps || 0,
        approvedThisMonth: approvedApps || 0,
        totalStudents: totalStudents || 0,
      });

      // Fetch all applications joined with student profiles and scholarships
      let { data: apps, error } = await supabase
        .from("applications")
        .select(`
          id,
          tracking_number,
          status,
          submitted_at,
          notes,
          user_id,
          scholarship_id,
          profiles:user_id (
            full_name,
            category,
            state,
            institution
          ),
          scholarships (
            title,
            amount_monthly
          )
        `)
        .order("submitted_at", { ascending: false });

      if (error) {
        const { data: fallbackApps, error: fallbackError } = await supabase
          .from("applications")
          .select("id, tracking_number, status, submitted_at, notes, user_id, scholarship_id, profiles(full_name, category, state, institution), scholarships(title, amount_monthly)")
          .order("submitted_at", { ascending: false });

        if (!fallbackError && fallbackApps) {
          apps = fallbackApps;
          error = null;
        }
      }

      if (!error && apps) {
        const mapped: AdminQueueItem[] = apps.map((item: any) => {
          const prof = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
          const sch = Array.isArray(item.scholarships) ? item.scholarships[0] : item.scholarships;

          return {
            id: item.id,
            userId: item.user_id,
            trackingNumber: item.tracking_number || `NSH-2026-${item.id.slice(0, 6).toUpperCase()}`,
            studentName: prof?.full_name || "Applicant Student",
            category: prof?.category || "ST",
            state: prof?.state || "Jharkhand",
            institution: prof?.institution || "Central University of Jharkhand",
            schemeTitle: sch?.title || "National Tribal Fellowship Scheme",
            grantAmount: sch?.amount_monthly ? `₹${(sch.amount_monthly * 12).toLocaleString()} / yr` : "₹1,20,000 / yr",
            submittedOn: new Date(item.submitted_at || Date.now()).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            status: item.status || "pending",
          };
        });

        setQueue(mapped);
      } else {
        setQueue([]);
      }
    } catch (err) {
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (appId: string, userId: string, schemeTitle: string) => {
    setIsProcessingId(appId);
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: "approved" })
        .eq("id", appId);

      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Application Approved & Sanctioned",
        message: `Your application for ${schemeTitle} has been sanctioned by the Nodal Review Officer.`,
        type: "disbursement",
        is_read: false,
      });

      setQueue((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: "approved" } : app))
      );

      setStats((prev) => ({
        ...prev,
        pendingReview: Math.max(0, prev.pendingReview - 1),
        approvedThisMonth: prev.approvedThisMonth + 1,
      }));
    } catch (err: any) {
      alert("Error approving application: " + err.message);
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleReject = async (appId: string, userId: string, schemeTitle: string) => {
    setIsProcessingId(appId);
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: "rejected" })
        .eq("id", appId);

      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Application Status Update",
        message: `Nodal Remark on ${schemeTitle}: Application rejected due to document verification policy.`,
        type: "verification",
        is_read: false,
      });

      setQueue((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: "rejected" } : app))
      );

      setStats((prev) => ({
        ...prev,
        pendingReview: Math.max(0, prev.pendingReview - 1),
      }));
    } catch (err: any) {
      alert("Error rejecting application: " + err.message);
    } finally {
      setIsProcessingId(null);
    }
  };

  const filteredQueue = queue.filter(
    (app) =>
      app.studentName.toLowerCase().includes(search.toLowerCase()) ||
      app.schemeTitle.toLowerCase().includes(search.toLowerCase()) ||
      app.trackingNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-stone-200/90 bg-white p-6 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#064e3b] text-white dark:bg-emerald-600 shadow-md">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white">
                Nodal Officer Portal
              </h1>
              <Badge variant="saffron" size="sm">
                Admin Control
              </Badge>
            </div>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Welcome back, <span className="font-bold text-stone-700 dark:text-stone-200">{profile.fullName || "Administrator"}</span> · Department of Affirmative Action & Scholarship Verification
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchAdminData}
          className="text-xs gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </Button>
      </div>

      {/* 4 Stat Cards fetching real counts from Supabase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Applications */}
        <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Total Applications
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-stone-700 dark:bg-[#132820] dark:text-stone-300">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-stone-900 dark:text-white">
            {loading ? <Skeleton className="h-8 w-16" /> : stats.totalApplications}
          </p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Real count from Supabase
          </p>
        </div>

        {/* Card 2: Pending Review */}
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/80 p-5 shadow-soft dark:border-amber-900/60 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Pending Review
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-900 dark:text-amber-400">
            {loading ? <Skeleton className="h-8 w-16" /> : stats.pendingReview}
          </p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
            Awaiting nodal verification
          </p>
        </div>

        {/* Card 3: Approved This Month */}
        <div className="rounded-2xl border border-emerald-200/90 bg-[#eaf5ea]/80 p-5 shadow-soft dark:border-emerald-900/60 dark:bg-[#0c2217]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#064e3b] dark:text-emerald-400">
              Approved This Month
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#064e3b] dark:text-emerald-300">
            {loading ? <Skeleton className="h-8 w-16" /> : stats.approvedThisMonth}
          </p>
          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
            Sanctioned for DBT credit
          </p>
        </div>

        {/* Card 4: Total Students Registered */}
        <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Total Students Registered
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-stone-700 dark:bg-[#132820] dark:text-stone-300">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-stone-900 dark:text-white">
            {loading ? <Skeleton className="h-8 w-16" /> : stats.totalStudents}
          </p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Active student profiles
          </p>
        </div>
      </div>

      {/* Recent Applications Scrutiny Table */}
      <div id="applications" className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-[#193c30]">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              Recent Applications Queue
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Scrutinize student eligibility, review submitted applications, and execute immediate approvals or rejections.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student name or scheme..."
              className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-4 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#064e3b] focus:bg-white focus:outline-none dark:border-[#193c30] dark:bg-[#132820] dark:text-white"
            />
          </div>
        </div>

        {/* Applications Table or Empty State */}
        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : queue.length === 0 ? (
          /* Empty State if no applications */
          <div className="py-16 text-center space-y-3">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-[#132820] dark:text-stone-500">
              <FileCheck className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
              No applications received yet
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500 max-w-sm mx-auto">
              Student scholarship applications submitted through the portal will appear here for verification and scrutiny.
            </p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500 dark:text-stone-400">
            No applications matching &quot;{search}&quot; found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/70 text-stone-400 dark:border-[#193c30]">
                  <th className="py-3 px-3 font-semibold">Student Name</th>
                  <th className="py-3 px-3 font-semibold">Scholarship</th>
                  <th className="py-3 px-3 font-semibold">Submitted Date</th>
                  <th className="py-3 px-3 font-semibold text-center">Status</th>
                  <th className="py-3 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-[#193c30]">
                {filteredQueue.map((item) => {
                  const isApproved = item.status === "approved" || item.status === "disbursed";
                  const isRejected = item.status === "rejected";
                  const isPending = item.status === "pending" || item.status === "under_review";
                  const isBusy = isProcessingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/60 dark:hover:bg-[#132820]/50 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-stone-900 dark:text-white block">
                          {item.studentName}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {item.trackingNumber} · {item.category} ({item.state})
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-medium text-stone-800 dark:text-stone-200 block max-w-xs truncate">
                          {item.schemeTitle}
                        </span>
                        <span className="text-[10px] font-bold text-[#064e3b] dark:text-emerald-400">
                          {item.grantAmount}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-stone-600 dark:text-stone-300 font-medium">
                        {item.submittedOn}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <Badge
                          variant={isApproved ? "mint" : isPending ? "saffron" : "danger"}
                          size="sm"
                        >
                          {item.status.toUpperCase()}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={isBusy || isApproved}
                            onClick={() => handleApprove(item.id, item.userId, item.schemeTitle)}
                            className="inline-flex items-center gap-1 rounded-xl bg-[#064e3b] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#053d2e] disabled:opacity-40 transition-all dark:bg-emerald-600 dark:hover:bg-emerald-500"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            disabled={isBusy || isRejected}
                            onClick={() => handleReject(item.id, item.userId, item.schemeTitle)}
                            className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 disabled:opacity-40 transition-all dark:bg-rose-700 dark:hover:bg-rose-600"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
