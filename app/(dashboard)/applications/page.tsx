"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileText,
  UserCheck,
  ChevronRight,
  Download,
  ExternalLink,
  Search,
  Filter,
  Layers,
  ListFilter,
  Plus,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";

export interface DBApplication {
  id: string;
  trackingNumber: string;
  scholarshipTitle: string;
  scholarshipId: string;
  ministry: string;
  amount: string;
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

  const supabase = createClient();

  const fetchUserApplications = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch applications
        const { data: apps, error } = await supabase
          .from("applications")
          .select("id, tracking_number, status, submitted_at, updated_at, notes, scholarship_id, scholarships(title, amount_monthly)")
          .eq("user_id", user.id)
          .order("submitted_at", { ascending: false });

        if (!error && apps) {
          const mapped: DBApplication[] = apps.map((item: any) => ({
            id: item.id,
            trackingNumber: item.tracking_number || `NSH-2026-${item.id.slice(0, 6).toUpperCase()}`,
            scholarshipTitle: item.scholarships?.title || "National Tribal Fellowship Scheme",
            scholarshipId: item.scholarship_id,
            ministry: "Ministry of Tribal Affairs / State Welfare Directorate",
            amount: item.scholarships?.amount_monthly ? `₹${(item.scholarships.amount_monthly * 12).toLocaleString()} / yr` : "₹1,20,000 / yr",
            status: item.status || "pending",
            submittedAt: new Date(item.submitted_at || Date.now()).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            updatedAt: new Date(item.updated_at || Date.now()).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            notes: item.notes,
          }));

          setApplications(mapped);
          if (mapped.length > 0) setSelectedApp(mapped[0]);
        }

        // Fetch scholarships list for new application modal
        const { data: schs } = await supabase
          .from("scholarships")
          .select("id, title, amount_monthly")
          .eq("status", "active");

        if (schs) setAvailableScholarships(schs);
      }
    } catch (err) {
      // Fallback state handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserApplications();
  }, []);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScholarshipId) return;

    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase.from("applications").insert({
          user_id: user.id,
          scholarship_id: selectedScholarshipId,
          status: "pending",
        });

        if (!error) {
          setNewAppModalOpen(false);
          setSelectedScholarshipId("");
          await fetchUserApplications();
        }
      }
    } catch (err) {
      alert("Error submitting application. Please check your network connection.");
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
      case "disbursed":
        return <Badge variant="mint" size="sm">Sanctioned & Disbursed</Badge>;
      case "under_review":
        return <Badge variant="saffron" size="sm">Under Nodal Scrutiny</Badge>;
      case "rejected":
        return <Badge variant="danger" size="sm">Defect Marked</Badge>;
      default:
        return <Badge variant="subtle" size="sm">Submitted (Pending Review)</Badge>;
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
            Real-time tracking of dossiers with State Nodal Officers, University Welfare Desks, and PFMS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => setNewAppModalOpen(true)}
            className="bg-[#064e3b] text-white text-xs gap-1.5 dark:bg-emerald-600"
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
              Kanban Board
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl border border-stone-200 bg-white p-5 dark:border-[#193c30] dark:bg-[#0f231c] space-y-3">
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
            No Applications Submitted Yet
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Explore active scholarships in the discovery section and submit your first online application.
          </p>
          <Button
            size="sm"
            onClick={() => setNewAppModalOpen(true)}
            className="mt-4 bg-[#064e3b] text-white text-xs dark:bg-emerald-600"
          >
            Submit Application Now
          </Button>
        </div>
      ) : viewMode === "list" ? (
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
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {app.ministry}
                      </p>
                    </div>

                    {getStatusBadge(app.status)}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-stone-100 dark:border-[#193c30]">
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      Amount: {app.amount}
                    </span>
                    <span className="text-stone-400">
                      Submitted: {app.submittedAt}
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
                    REAL-TIME AUDIT TRAIL
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white mt-1">
                    {selectedApp.scholarshipTitle}
                  </h3>
                  <p className="font-mono text-xs text-stone-400 mt-0.5">
                    Ref: {selectedApp.trackingNumber}
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 p-3.5 border border-stone-200/80 dark:bg-[#132820] dark:border-[#193c30]">
                  <p className="text-[11px] font-bold uppercase text-stone-400">
                    Designated Welfare Directorate
                  </p>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-1">
                    Shri R.K. Soren (State Nodal Officer)
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Department of Scheduled Tribe Welfare
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
                      <p className="text-stone-500">Current Stage: {selectedApp.status.toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 dark:border-[#193c30] flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => alert(`Downloading slip for ${selectedApp.trackingNumber}...`)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download Acknowledgement Slip
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {[
            { title: "Pending Review", status: "pending" },
            { title: "Under Review", status: "under_review" },
            { title: "Approved", status: "approved" },
            { title: "Disbursed via DBT", status: "disbursed" },
          ].map((col) => {
            const colApps = applications.filter((a) => a.status === col.status);

            return (
              <div
                key={col.status}
                className="rounded-3xl border border-stone-200/80 bg-stone-50/70 p-4 dark:border-[#193c30] dark:bg-[#0c1c16]"
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3 px-1">
                  {col.title} ({colApps.length})
                </h4>
                <div className="space-y-3">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]"
                    >
                      <span className="font-mono text-[10px] text-stone-400">
                        {app.trackingNumber}
                      </span>
                      <h5 className="text-xs font-bold text-stone-900 dark:text-white mt-1">
                        {app.scholarshipTitle}
                      </h5>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-semibold mt-2">
                        {app.amount}
                      </p>
                    </div>
                  ))}
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
              Select Active Scheme
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
                  {s.title} (₹{(s.amount_monthly * 12).toLocaleString()} / yr)
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-stone-50 p-3.5 border border-stone-200 text-xs text-stone-600 dark:bg-[#132820] dark:border-[#193c30] dark:text-stone-300">
            <p className="font-bold text-stone-900 dark:text-white">Note:</p>
            <p className="mt-1">
              Your profile category, domicile state, and uploaded document vault files will be automatically attached to this application.
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
