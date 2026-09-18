"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Scholarship } from "@/lib/data/scholarships";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Building2,
  Calendar,
  IndianRupee,
  CheckCircle2,
  FileText,
  HelpCircle,
  ArrowRight,
  Share2,
  Award,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

interface DetailModalProps {
  scholarship: Scholarship | null;
  isOpen: boolean;
  onClose: () => void;
  onApplySuccess?: (scholarshipTitle: string) => void;
}

export function DetailModal({
  scholarship,
  isOpen,
  onClose,
  onApplySuccess,
}: DetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "eligibility" | "documents" | "process">("overview");
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  if (!scholarship) return null;

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setApplied(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Confetti fallback
      }
      if (onApplySuccess) {
        onApplySuccess(scholarship.title);
      }
    }, 900);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setApplied(false);
        onClose();
      }}
      maxWidth="3xl"
    >
      {applied ? (
        <div className="py-8 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-bold text-stone-900 dark:text-white">
            Application Dossier Created!
          </h3>
          <p className="max-w-md mx-auto text-sm text-stone-600 dark:text-stone-300">
            Your application for <strong>{scholarship.title}</strong> has been drafted and linked to your DigiLocker documents. Tracking ID generated.
          </p>
          <div className="rounded-2xl bg-stone-50 p-4 max-w-sm mx-auto border border-stone-200 dark:bg-[#0f231c] dark:border-[#193c30]">
            <p className="text-xs text-stone-500 dark:text-stone-400">Application Reference ID</p>
            <p className="text-base font-mono font-bold text-emerald-800 dark:text-emerald-400">
              SH-{scholarship.category}-{Math.floor(100000 + Math.random() * 900000)}
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setApplied(false);
                onClose();
              }}
            >
              Close
            </Button>
            <a href="/applications">
              <Button className="bg-[#064e3b] text-white">
                View in Applications Tracker
              </Button>
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row items-start gap-4 pb-5 border-b border-stone-100 dark:border-[#193c30]">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <Badge variant="mint" size="sm">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {scholarship.matchScore}% Match for You
                </Badge>
                <Badge variant="saffron" size="sm">
                  {scholarship.category} Category
                </Badge>
                <Badge variant="neutral" size="sm">
                  {scholarship.educationLevel}
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                {scholarship.title}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 dark:text-stone-400">
                <Building2 className="h-3.5 w-3.5" />
                <span>{scholarship.ministry}</span>
                <span>•</span>
                <Calendar className="h-3.5 w-3.5" />
                <span>{scholarship.closingDateFormatted}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-stone-50 p-3.5 border border-stone-200/70 dark:bg-[#0f231c] dark:border-[#193c30]">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Financial Benefit
              </span>
              <p className="text-base font-bold text-emerald-800 dark:text-emerald-400 mt-0.5">
                {scholarship.amountFormatted}
              </p>
            </div>
            <div className="rounded-2xl bg-stone-50 p-3.5 border border-stone-200/70 dark:bg-[#0f231c] dark:border-[#193c30]">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Income Ceiling
              </span>
              <p className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                {scholarship.maxAnnualIncome ? `₹${(scholarship.maxAnnualIncome / 100000).toFixed(1)} Lakhs/yr` : "No limit"}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-2xl bg-stone-50 p-3.5 border border-stone-200/70 dark:bg-[#0f231c] dark:border-[#193c30]">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Funding Authority
              </span>
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-0.5 truncate">
                {scholarship.sponsoringBody}
              </p>
            </div>
          </div>

          {/* Navigation Subtabs */}
          <div className="flex border-b border-stone-200 text-sm font-medium dark:border-[#193c30]">
            {(
              [
                { key: "overview", label: "Overview & Benefits" },
                { key: "eligibility", label: "Eligibility Checklist" },
                { key: "documents", label: "Required Documents" },
                { key: "process", label: "Process & Disbursement" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`py-2.5 px-3 border-b-2 text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === tab.key
                    ? "border-[#064e3b] text-[#064e3b] dark:border-emerald-400 dark:text-emerald-400"
                    : "border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview & Benefits */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <p className="text-sm text-stone-700 leading-relaxed dark:text-stone-300">
                {scholarship.description}
              </p>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-2.5">
                  Key Scheme Benefits
                </h4>
                <div className="space-y-2">
                  {scholarship.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Eligibility */}
          {activeTab === "eligibility" && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-900/50">
                <p className="text-xs text-emerald-900 font-medium dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Your profile matches 5 out of 5 core eligibility criteria for this scheme.
                </p>
              </div>
              <div className="space-y-2.5">
                {scholarship.eligibilityCriteria.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-stone-200/80 p-3 bg-white dark:bg-[#0f231c] dark:border-[#193c30]"
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 font-medium">
                      {c}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Required Documents */}
          {activeTab === "documents" && (
            <div className="space-y-3">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Ensure the following documents are in PDF format (under 5MB) and digitally verifiable via DigiLocker.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {scholarship.requiredDocuments.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-xl border border-stone-200 p-3 bg-stone-50/50 dark:bg-[#0f231c] dark:border-[#193c30]"
                  >
                    <FileText className="h-4 w-4 text-[#064e3b] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-stone-800 dark:text-stone-200">
                      {doc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Process */}
          {activeTab === "process" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200 dark:bg-[#0f231c] dark:border-[#193c30]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-1.5">
                  Selection Protocol
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed dark:text-stone-300">
                  {scholarship.selectionProcess}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                  Direct Benefit Transfer (DBT) Flow
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed dark:text-stone-300">
                  Fellowship amounts are released monthly through Public Financial Management System (PFMS) directly into the student's Aadhaar-seeded bank account with zero intermediary commissions.
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-100 dark:border-[#193c30]">
            <div className="text-xs text-stone-500 dark:text-stone-400 text-center sm:text-left">
              Closes strictly on <strong>{scholarship.closingDateFormatted}</strong>. Late applications not accepted.
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="secondary"
                size="md"
                onClick={onClose}
                className="w-1/2 sm:w-auto"
              >
                Close
              </Button>
              <Button
                size="md"
                onClick={handleApply}
                disabled={isApplying}
                className="w-1/2 sm:w-auto bg-[#064e3b] hover:bg-[#053d2e] text-white rounded-xl shadow-md gap-2 dark:bg-emerald-600"
              >
                {isApplying ? "Processing..." : "Start Application"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
