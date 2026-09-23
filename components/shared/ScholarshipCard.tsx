"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, ArrowUpRight, Clock, Sparkles, Check, Bookmark, Loader2 } from "lucide-react";
import { Scholarship } from "@/lib/data/scholarships";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ScholarshipCardProps {
  scholarship: Scholarship;
  isApplied?: boolean;
  onApply?: (scholarship: Scholarship) => void;
  onQuickApply?: (scholarship: Scholarship) => void;
  onViewDetails?: (scholarship: Scholarship) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  compact?: boolean;
  isApplying?: boolean;
}

export function ScholarshipCard({
  scholarship,
  isApplied = false,
  onApply,
  onQuickApply,
  onViewDetails,
  isBookmarked = false,
  onToggleBookmark,
  compact = false,
  isApplying = false,
}: ScholarshipCardProps) {
  // Format deadline as "Closes DD MMM YYYY" and check if within 7 days
  const formatDeadlineInfo = (deadlineStr: string) => {
    if (!deadlineStr) return { text: "Open", isUrgent: false };
    const d = new Date(deadlineStr);
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isUrgent = diffDays >= 0 && diffDays <= 7;

    const formatted = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return {
      text: `Closes ${formatted}`,
      isUrgent,
      diffDays,
    };
  };

  const deadlineInfo = formatDeadlineInfo(scholarship.deadline);

  // Extract category tags
  const categoryTags: string[] = [];
  if (Array.isArray(scholarship.tags) && scholarship.tags.length > 0) {
    categoryTags.push(...scholarship.tags.filter((t) => ["ST", "SC", "OBC", "General", "Minority"].includes(t)));
  }
  if (categoryTags.length === 0 && scholarship.category) {
    categoryTags.push(scholarship.category);
  }

  // Monthly amount formatting
  const monthlyAmount = scholarship.amount
    ? `₹${Number(scholarship.amount).toLocaleString("en-IN")} / month`
    : scholarship.amountFormatted || "₹10,000 / month";

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-700/30 hover:shadow-elevated dark:border-[#193c30] dark:bg-[#0f231c] dark:hover:border-emerald-600/40">
      <div>
        {/* Top row: Icon + Titles + Bookmark */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-800 shadow-xs dark:bg-amber-950/60 dark:text-amber-300">
            <GraduationCap className="h-6 w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4
                onClick={() => onViewDetails && onViewDetails(scholarship)}
                className="cursor-pointer font-bold text-base text-stone-900 transition-colors group-hover:text-[#064e3b] dark:text-stone-100 dark:group-hover:text-emerald-400 line-clamp-1"
                title={scholarship.title}
              >
                {scholarship.title}
              </h4>
              {onToggleBookmark && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(scholarship.id);
                  }}
                  className={`p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors shrink-0 ${
                    isBookmarked ? "text-amber-600 fill-amber-600 dark:text-amber-400" : ""
                  }`}
                  aria-label="Bookmark scholarship"
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
                </button>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs font-medium text-stone-500 dark:text-stone-400">
              {scholarship.ministry || "Ministry of Tribal Affairs"}
            </p>
          </div>
        </div>

        {/* Amount & Deadline */}
        <div className="mt-4 flex items-center justify-between text-xs font-semibold">
          <span className="text-base font-extrabold text-[#064e3b] dark:text-emerald-400">
            {monthlyAmount}
          </span>
          <span
            className={`font-semibold flex items-center gap-1 ${
              deadlineInfo.isUrgent
                ? "text-rose-600 dark:text-rose-400 font-bold animate-pulse"
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {deadlineInfo.text}
          </span>
        </div>

        {/* Category Tags */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {categoryTags.map((cat, i) => (
            <Badge key={i} variant="mint" size="sm">
              {cat}
            </Badge>
          ))}
          {scholarship.educationLevel && (
            <Badge variant="subtle" size="sm">
              {scholarship.educationLevel}
            </Badge>
          )}
        </div>

        {/* Description (2 lines truncated) */}
        <p className="mt-3 line-clamp-2 text-xs text-stone-600 leading-relaxed dark:text-stone-300">
          {scholarship.description}
        </p>
      </div>

      {!compact && (
        <div className="mt-5 flex items-center justify-between gap-2 pt-3 border-t border-stone-100 dark:border-[#193c30]">
          {/* Check Eligibility Button */}
          <Link href="/eligibility">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-9 border-stone-200 text-stone-700 hover:bg-stone-50 dark:border-[#193c30] dark:text-stone-300 dark:hover:bg-[#132820]"
            >
              Check Eligibility
            </Button>
          </Link>

          {/* Apply Now / Applied Button */}
          {isApplied ? (
            <Button
              type="button"
              size="sm"
              disabled
              className="h-9 bg-emerald-700 text-white rounded-xl text-xs gap-1.5 px-4 opacity-90 cursor-not-allowed dark:bg-emerald-600"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Applied ✓</span>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={isApplying}
              onClick={() => (onApply ? onApply(scholarship) : onQuickApply && onQuickApply(scholarship))}
              className="h-9 bg-[#064e3b] hover:bg-[#053d2e] text-white rounded-xl text-xs gap-1.5 px-4 shadow-sm transition-all active:scale-[0.98] dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              {isApplying ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Applying...</span>
                </>
              ) : (
                <>
                  <span>Apply Now</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
