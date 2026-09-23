"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  FileText,
  Search,
  Plus,
  RefreshCw,
  LayoutGrid,
  List,
  Download,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/shared/Toast";
import { applyToScholarship } from "@/lib/services/applications";

function formatSubmittedDate(dateStr: string | null | undefined): string {
  if (!dateStr || !dateStr.trim()) return "Recently submitted";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Recently submitted";

  const day = d.getDate().toString().padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatTrackingNumber(tn: string | null | undefined): string {
  if (!tn || !tn.trim()) return "Processing...";
  let clean = tn.trim();
  if (clean.startsWith("#")) {
    clean = clean.slice(1).trim();
  }
  if (!clean) return "Processing...";

  if (clean.startsWith("NSH-2026-")) {
    return `#${clean}`;
  }
  if (clean.startsWith("NSH-")) {
    return `#NSH-2026-${clean.slice(4)}`;
  }
  return `#NSH-2026-${clean}`;
}

export interface DBApplication {
  id: string;
  trackingNumber: string;
  scholarshipTitle: string;
  scholarshipId: string;
  amount: string;
  deadline: string;
  deadlineFormatted: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "disbursed";
  submittedAt: string;
  updatedAt: string;
  notes?: string;
}

export default function ApplicationsTrackingPage() {
  const [applications, setApplications] = useState<DBApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<DBApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("list");
  const [newAppModalOpen, setNewAppModalOpen] = useState(false);
  const [availableScholarships, setAvailableScholarships] = useState<any[]>([]);
  const [selectedScholarshipId, setSelectedScholarshipId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const supabase = createClient();
  const { toast } = useToast();

  const fetchUserApplications = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);

        // Fetch applications joined with scholarships
        const { data: apps, error } = await supabase
          .from("applications")
          .select(
            "id, tracking_number, status, submitted_at, updated_at, notes, scholarship_id, scholarships(title, amount_monthly, deadline)"
          )
          .eq("user_id", user.id)
          .order("submitted_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (apps) {
          const mapped: DBApplication[] = apps.map((item: any) => {
            const sch = item.scholarships;
            const monthly = sch?.amount_monthly ? Number(sch.amount_monthly) : 10000;
            const deadlineDate = sch?.deadline;

            return {
              id: item.id,
              trackingNumber: formatTrackingNumber(item.tracking_number),
              scholarshipTitle: sch?.title || "National Scholarship Scheme",
              scholarshipId: item.scholarship_id,
              amount: `₹${monthly.toLocaleString("en-IN")} / month`,
              deadline: deadlineDate || "",
              deadlineFormatted: deadlineDate
                ? new Date(deadlineDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Ongoing",
              status: (item.status as any) || "pending",
              submittedAt: formatSubmittedDate(item.submitted_at),
              updatedAt: formatSubmittedDate(item.updated_at),
              notes: item.notes,
            };
          });

          setApplications(mapped);
          if (mapped.length > 0) setSelectedApp(mapped[0]);
        }

        // Fetch scholarships for new application modal
        const { data: schs } = await supabase
          .from("scholarships")
          .select("id, title, amount_monthly")
          .eq("status", "active");

        if (schs) setAvailableScholarships(schs);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserApplications();
  }, []);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScholarshipId || !currentUserId) return;

    const chosen = availableScholarships.find((s) => s.id === selectedScholarshipId);
    const title = chosen?.title || "Scholarship Scheme";

    setIsSubmitting(true);
    try {
      const result = await applyToScholarship(
        supabase,
        currentUserId,
        selectedScholarshipId,
        title
      );

      if (result.success) {
        if (result.alreadyApplied) {
          toast.info("You have already applied for this scholarship.");
        } else {
          toast.success("Application submitted!");
        }
        setNewAppModalOpen(false);
        setSelectedScholarshipId("");
        await fetchUserApplications();
      } else {
        toast.error(result.error || "Failed to submit application.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredApps = applications.filter(
    (app) =>
      app.scholarshipTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </span>
        );
      case "disbursed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
            <CheckCircle2 className="h-3 w-3" />
            Disbursed
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <AlertCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      case "under_review":
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="h-3 w-3" />
            Under Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white">
            Applications & Tracking
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Real-time status tracking with State Welfare Officers, Central Ministries, and PFMS DBT Gateway.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => setNewAppModalOpen(true)}
            className="bg-[#064e3b] hover:bg-[#053d2e] text-white text-xs gap-1.5 dark:bg-emerald-600"
          >
            <Plus className="h-4 w-4" />
            <span>Apply for Scheme</span>
          </Button>

          <div className="flex rounded-xl bg-stone-100 p-1 dark:bg-[#132820]">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === "list"
                  ? "bg-white text-[#064e3b] shadow-sm dark:bg-[#0f231c] dark:text-emerald-400"
                  : "text-stone-500 hover:text-stone-800 dark:text-stone-400"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === "kanban"
                  ? "bg-white text-[#064e3b] shadow-sm dark:bg-[#0f231c] dark:text-emerald-400"
                  : "text-stone-500 hover:text-stone-800 dark:text-stone-400"
              }`}
            >
              Kanban View
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-stone-200 bg-white p-5 dark:border-[#193c30] dark:bg-[#0f231c] space-y-3"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center dark:border-[#193c30] dark:bg-[#0f231c]">
          <Clock className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
            You haven't applied to any scholarships yet.
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Discover verified scholarships suited to your demographic criteria and submit your application online.
          </p>
          <Link href="/scholarships" className="mt-4 inline-block">
            <Button size="sm" className="bg-[#064e3b] text-white text-xs dark:bg-emerald-600 gap-1.5">
              <span>Browse Scholarships</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      ) : viewMode === "list" ? (
        /* List View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 Columns: Application List */}
          <div className="lg:col-span-7 space-y-4">
            {filteredApps.map((app) => {
              const isSelected = selectedApp?.id === app.id;

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`cursor-pointer rounded-3xl border p-5 transition-all duration-200 bg-white shadow-soft hover:border-emerald-600/40 dark:bg-[#0f231c] ${
                    isSelected
                      ? "ring-2 ring-[#064e3b] border-transparent dark:ring-emerald-500"
                      : "border-stone-200/90 dark:border-[#193c30]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-stone-400 dark:text-stone-500">
                        {app.trackingNumber}
                      </span>
                      <h4 className="text-base font-bold text-stone-900 dark:text-white mt-0.5">
                        {app.scholarshipTitle}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        Closing Date: {app.deadlineFormatted}
                      </p>
                    </div>

                    {getStatusBadge(app.status)}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-stone-100 dark:border-[#193c30]">
                    <span className="font-bold text-[#064e3b] dark:text-emerald-400">
                      Amount: {app.amount}
                    </span>
                    <span className="text-stone-400">
                      {app.submittedAt.startsWith("Recently")
                        ? app.submittedAt
                        : `Submitted: ${app.submittedAt}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 5 Columns: Detailed Audit Timeline */}
          <div className="lg:col-span-5">
            {selectedApp && (
              <div className="sticky top-28 rounded-3xl border border-stone-200/90 bg-white p-6 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c] space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    REAL-TIME APPLICATION DOSSIER
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white mt-1">
                    {selectedApp.scholarshipTitle}
                  </h3>
                  <p className="font-mono text-xs text-stone-400 mt-0.5">
                    Ref ID: {selectedApp.trackingNumber}
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 p-3.5 border border-stone-200/80 dark:bg-[#132820] dark:border-[#193c30]">
                  <p className="text-[11px] font-bold uppercase text-stone-400">
                    Financial Benefit
                  </p>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mt-0.5">
                    {selectedApp.amount}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                    Direct Benefit Transfer (DBT) via PFMS Gateway
                  </p>
                </div>

                {/* Timeline status list */}
                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white">Online Application Submitted</p>
                      <p className="text-stone-500">{selectedApp.submittedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white">DigiLocker Document Verification</p>
                      <p className="text-stone-500">Auto-validated via Aadhaar Vault</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white">State Nodal Officer Review</p>
                      <p className="text-stone-500 capitalize">Current Stage: {selectedApp.status.replace("_", " ")}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 dark:border-[#193c30]">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => alert(`Downloaded acknowledgement receipt for ${selectedApp.trackingNumber}`)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Download Acknowledgement Slip
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Kanban View: 4 Columns (Submitted | Under Review | Approved | Rejected) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
          {[
            {
              title: "Submitted",
              filterFn: (a: DBApplication) => a.status === "pending",
              badgeColor: "bg-stone-200 text-stone-800",
            },
            {
              title: "Under Review",
              filterFn: (a: DBApplication) => a.status === "under_review",
              badgeColor: "bg-amber-100 text-amber-800",
            },
            {
              title: "Approved",
              filterFn: (a: DBApplication) => a.status === "approved" || a.status === "disbursed",
              badgeColor: "bg-emerald-100 text-emerald-800",
            },
            {
              title: "Rejected",
              filterFn: (a: DBApplication) => a.status === "rejected",
              badgeColor: "bg-rose-100 text-rose-800",
            },
          ].map((col) => {
            const colApps = applications.filter(col.filterFn);

            return (
              <div
                key={col.title}
                className="rounded-3xl border border-stone-200/80 bg-stone-50/70 p-4 dark:border-[#193c30] dark:bg-[#0c1c16]"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    {col.title}
                  </h4>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${col.badgeColor}`}>
                    {colApps.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colApps.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-stone-200 p-4 text-center text-xs text-stone-400">
                      No applications
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <div
                        key={app.id}
                        className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c] space-y-2"
                      >
                        <span className="font-mono text-[10px] text-stone-400 block">
                          {app.trackingNumber}
                        </span>
                        <h5 className="text-xs font-bold text-stone-900 dark:text-white line-clamp-2">
                          {app.scholarshipTitle}
                        </h5>
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-[#064e3b] dark:text-emerald-400 font-bold">
                            {app.amount}
                          </span>
                          <span className="text-stone-400">
                            {app.submittedAt.startsWith("Recently")
                              ? app.submittedAt
                              : `Submitted: ${app.submittedAt}`}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Application Modal */}
      <Modal
        isOpen={newAppModalOpen}
        onClose={() => setNewAppModalOpen(false)}
        title="Submit New Scholarship Application"
      >
        <form onSubmit={handleCreateApplication} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Select Active Scheme *
            </label>
            <select
              required
              value={selectedScholarshipId}
              onChange={(e) => setSelectedScholarshipId(e.target.value)}
              className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs sm:text-sm text-stone-900 focus:border-[#064e3b] focus:outline-none dark:border-[#193c30] dark:bg-[#0f231c] dark:text-white"
            >
              <option value="">-- Choose a scholarship scheme --</option>
              {availableScholarships.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} (₹{Number(s.amount_monthly || 10000).toLocaleString("en-IN")} / month)
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-stone-50 p-3.5 border border-stone-200 text-xs text-stone-600 dark:bg-[#132820] dark:border-[#193c30] dark:text-stone-300">
            <p className="font-bold text-stone-900 dark:text-white">Note:</p>
            <p className="mt-1">
              Your profile category, domicile state, and verified documents will be automatically linked to this application dossier.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setNewAppModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !selectedScholarshipId}
              className="bg-[#064e3b] text-white dark:bg-emerald-600"
            >
              {isSubmitting ? "Submitting..." : "Confirm & Submit"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
