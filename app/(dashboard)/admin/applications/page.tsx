"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Filter,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Mail,
  Building,
  MapPin,
  Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export interface DBApplicationItem {
  id: string;
  user_id: string;
  scholarship_id: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "disbursed";
  tracking_number: string;
  submitted_at: string;
  notes?: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
    category: string;
    state: string;
    institution: string;
  };
  scholarships?: {
    id: string;
    title: string;
    amount_monthly: number;
    deadline: string;
  };
}

export default function ApplicationsReviewPage() {
  const [applications, setApplications] = useState<DBApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<DBApplicationItem | null>(null);
  
  // Rejection modal state
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("Incomplete documents");
  const [customReason, setCustomReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Primary join fetch via PostgREST
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          user_id,
          scholarship_id,
          status,
          tracking_number,
          submitted_at,
          notes,
          profiles:user_id (id, full_name, email, category, state, institution),
          scholarships:scholarship_id (id, title, amount_monthly, deadline)
        `)
        .order("submitted_at", { ascending: false });

      if (!error && data) {
        setApplications(data as unknown as DBApplicationItem[]);
      } else {
        // Fallback: Fetch separately if relations fail
        const { data: rawApps } = await supabase
          .from("applications")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (rawApps && rawApps.length > 0) {
          const userIds = Array.from(new Set(rawApps.map((a) => a.user_id)));
          const scholarshipIds = Array.from(new Set(rawApps.map((a) => a.scholarship_id)));

          const [{ data: profs }, { data: schols }] = await Promise.all([
            supabase.from("profiles").select("*").in("id", userIds),
            supabase.from("scholarships").select("*").in("id", scholarshipIds),
          ]);

          const profMap = new Map((profs || []).map((p) => [p.id, p]));
          const scholMap = new Map((schols || []).map((s) => [s.id, s]));

          const formatted = rawApps.map((app) => ({
            ...app,
            profiles: profMap.get(app.user_id),
            scholarships: scholMap.get(app.scholarship_id),
          }));

          setApplications(formatted as DBApplicationItem[]);
        }
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async () => {
    if (!selectedApp) return;
    setProcessing(true);
    try {
      // 1. Update application status
      const { error: appErr } = await supabase
        .from("applications")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", selectedApp.id);

      if (appErr) throw appErr;

      // 2. Insert notification for student
      const scholarshipTitle = selectedApp.scholarships?.title || "Scholarship";
      await supabase.from("notifications").insert({
        user_id: selectedApp.user_id,
        title: "Application Approved",
        message: `Your application for ${scholarshipTitle} has been approved!`,
        type: "info",
        is_read: false,
      });

      // Update local state
      setApplications((prev) =>
        prev.map((item) =>
          item.id === selectedApp.id ? { ...item, status: "approved" } : item
        )
      );

      setToastMessage({
        type: "success",
        text: `Application for ${selectedApp.profiles?.full_name || "student"} approved successfully!`,
      });
      setSelectedApp(null);
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setToastMessage({
        type: "error",
        text: errObj.message || "Failed to approve application.",
      });
    } finally {
      setProcessing(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    const finalReason = rejectReason === "Other" ? customReason.trim() || "Criteria not met" : rejectReason;
    setProcessing(true);
    try {
      // 1. Update application status
      const { error: appErr } = await supabase
        .from("applications")
        .update({
          status: "rejected",
          notes: `Rejection reason: ${finalReason}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedApp.id);

      if (appErr) throw appErr;

      // 2. Insert notification for student
      const scholarshipTitle = selectedApp.scholarships?.title || "Scholarship";
      await supabase.from("notifications").insert({
        user_id: selectedApp.user_id,
        title: "Application Rejected",
        message: `Your application for ${scholarshipTitle} has been rejected. Reason: ${finalReason}`,
        type: "info",
        is_read: false,
      });

      // Update local state
      setApplications((prev) =>
        prev.map((item) =>
          item.id === selectedApp.id ? { ...item, status: "rejected", notes: finalReason } : item
        )
      );

      setToastMessage({
        type: "success",
        text: `Application for ${selectedApp.profiles?.full_name || "student"} rejected.`,
      });
      setSelectedApp(null);
      setShowRejectReason(false);
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setToastMessage({
        type: "error",
        text: errObj.message || "Failed to reject application.",
      });
    } finally {
      setProcessing(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Filtering
  const filteredApps = applications.filter((app) => {
    const studentName = app.profiles?.full_name?.toLowerCase() || "";
    const scholTitle = app.scholarships?.title?.toLowerCase() || "";
    const trackingNo = app.tracking_number?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();

    const matchesSearch = studentName.includes(q) || scholTitle.includes(q) || trackingNo.includes(q);
    const matchesStatus = statusFilter === "all" ? true : app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            <CheckCircle className="h-3.5 w-3.5" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
            <XCircle className="h-3.5 w-3.5" /> Rejected
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300">
            <Clock className="h-3.5 w-3.5" /> Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
            <AlertCircle className="h-3.5 w-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Banner */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-200"
          }`}
        >
          <span className="text-sm font-semibold">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2.5">
            <FileCheck className="h-7 w-7 text-[#064e3b] dark:text-emerald-400" />
            Applications Review
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Review student scholarship applications, verify eligibility, and process approvals or rejections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-[#064e3b] text-white dark:bg-emerald-600 px-3 py-1 text-xs">
            Total: {applications.length} Applications
          </Badge>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white dark:bg-[#0f231c] p-4 rounded-2xl border border-stone-200 dark:border-[#193c30]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search student name, scholarship title, or tracking #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs bg-stone-50 dark:bg-[#081510] border-stone-200 dark:border-[#193c30] rounded-xl"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <Filter className="h-4 w-4 text-stone-400 shrink-0 mr-1" />
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? "bg-[#064e3b] text-white dark:bg-emerald-600"
                  : "bg-stone-100 text-stone-600 dark:bg-[#132820] dark:text-stone-300 hover:bg-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-stone-200 bg-white dark:border-[#193c30] dark:bg-[#0f231c] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-lg" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-[#153228] dark:text-stone-500">
              <FileCheck className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-stone-800 dark:text-stone-100">
              No applications submitted yet
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "No applications matched your current search filters. Try resetting search or category."
                : "When students submit scholarship applications, they will appear here for review."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50/70 text-stone-500 dark:border-[#193c30] dark:bg-[#081510] dark:text-stone-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Scholarship Name</th>
                  <th className="px-5 py-3.5">Submitted Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-[#193c30]">
                {filteredApps.map((app) => {
                  const studentName = app.profiles?.full_name || "Student Candidate";
                  const initials = studentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();
                  const category = app.profiles?.category || "ST";

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-stone-50/80 transition-colors dark:hover:bg-[#132820]/60"
                    >
                      {/* Student Name + Avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#064e3b]/10 text-[#064e3b] font-bold text-xs dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900 dark:text-stone-100">
                              {studentName}
                            </p>
                            <p className="text-[10px] text-stone-400 dark:text-stone-500">
                              {app.tracking_number}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-stone-100 text-stone-800 dark:bg-[#153228] dark:text-stone-200 border border-stone-200 dark:border-[#193c30]">
                          {category}
                        </span>
                      </td>

                      {/* Scholarship Name */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-stone-800 dark:text-stone-200 max-w-xs truncate">
                          {app.scholarships?.title || "National Scholarship"}
                        </p>
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                          ₹{app.scholarships?.amount_monthly ? (app.scholarships.amount_monthly * 12).toLocaleString("en-IN") : "20,000"} / year
                        </p>
                      </td>

                      {/* Submitted Date */}
                      <td className="px-5 py-4 text-stone-500 dark:text-stone-400 whitespace-nowrap">
                        {new Date(app.submitted_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </td>

                      {/* Action Button */}
                      <td className="px-5 py-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setShowRejectReason(false);
                          }}
                          className="bg-[#064e3b] text-white hover:bg-[#04382a] text-xs font-semibold rounded-xl dark:bg-emerald-600 dark:hover:bg-emerald-700"
                        >
                          <span>Review</span>
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#0f231c] border border-stone-200 dark:border-[#193c30] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-[#193c30] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-[#064e3b] dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 dark:text-white">
                    Application Review
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Ref: {selectedApp.tracking_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedApp(null);
                  setShowRejectReason(false);
                }}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-[#153228] dark:hover:text-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Application Info Cards */}
            <div className="space-y-4 text-xs">
              {/* Student Details Card */}
              <div className="rounded-2xl bg-stone-50 dark:bg-[#081510] p-4 border border-stone-200/80 dark:border-[#193c30] space-y-2.5">
                <p className="font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider text-[10px]">
                  Student Applicant
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-800 dark:text-stone-200">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#064e3b] dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold">{selectedApp.profiles?.full_name || "N/A"}</p>
                      <p className="text-[10px] text-stone-400">Full Name</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#064e3b] dark:text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold truncate">{selectedApp.profiles?.email || "N/A"}</p>
                      <p className="text-[10px] text-stone-400">Email Address</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[#064e3b] dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-semibold">{selectedApp.profiles?.category || "ST"}</p>
                      <p className="text-[10px] text-stone-400">Social Category</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#064e3b] dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-semibold">{selectedApp.profiles?.state || "Jharkhand"}</p>
                      <p className="text-[10px] text-stone-400">Domicile State</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                    <Building className="h-4 w-4 text-[#064e3b] dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-semibold">{selectedApp.profiles?.institution || "Central University of Jharkhand"}</p>
                      <p className="text-[10px] text-stone-400">Educational Institution</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scholarship Applied Card */}
              <div className="rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 p-4 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                <p className="font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                  Scholarship Scheme
                </p>
                <p className="text-sm font-extrabold text-stone-900 dark:text-white">
                  {selectedApp.scholarships?.title || "National Higher Education Support Scheme"}
                </p>
                <div className="flex items-center justify-between text-stone-600 dark:text-stone-300 pt-1">
                  <span>Current Status:</span>
                  <div>{getStatusBadge(selectedApp.status)}</div>
                </div>
              </div>

              {/* Show Rejection Reason Select Form if Reject Toggled */}
              {showRejectReason && (
                <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-4 border border-rose-200 dark:border-rose-900/60 space-y-3 animate-in fade-in duration-150">
                  <p className="font-bold text-rose-900 dark:text-rose-200">
                    Select Rejection Reason
                  </p>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full rounded-xl border border-rose-300 bg-white p-2.5 text-xs text-stone-900 dark:bg-[#081510] dark:border-rose-800 dark:text-stone-100"
                  >
                    <option value="Incomplete documents">Incomplete documents</option>
                    <option value="Not eligible">Not eligible</option>
                    <option value="Duplicate application">Duplicate application</option>
                    <option value="Other">Other</option>
                  </select>

                  {rejectReason === "Other" && (
                    <Input
                      placeholder="Type custom rejection reason..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="text-xs bg-white dark:bg-[#081510] border-rose-300 dark:border-rose-800"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Modal Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedApp(null);
                  setShowRejectReason(false);
                }}
                disabled={processing}
                className="w-full sm:w-auto text-xs"
              >
                Cancel
              </Button>

              {!showRejectReason ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => setShowRejectReason(true)}
                    disabled={processing}
                    className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Reject Application
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleApprove}
                    disabled={processing}
                    className="w-full sm:w-auto bg-[#064e3b] hover:bg-[#04382a] text-white text-xs font-semibold rounded-xl dark:bg-emerald-600 dark:hover:bg-emerald-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    {processing ? "Processing..." : "Approve Application"}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={handleReject}
                  disabled={processing}
                  className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  {processing ? "Submitting..." : "Confirm Rejection"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
