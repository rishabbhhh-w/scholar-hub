"use client";

import React from "react";
import { GraduationCap, ArrowUpRight, Clock, Sparkles, CheckCircle2, Bookmark } from "lucide-react";
import { Scholarship } from "@/lib/data/scholarships";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ScholarshipCardProps {
  scholarship: Scholarship;
  onViewDetails?: (scholarship: Scholarship) => void;
  onQuickApply?: (scholarship: Scholarship) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  compact?: boolean;
}

export function ScholarshipCard({
  scholarship,
  onViewDetails,
  onQuickApply,
  isBookmarked = false,
  onToggleBookmark,
  compact = false,
}: ScholarshipCardProps) {
  return (
    <div className="group relative rounded-2xl border border-stone-200/90 bg-white p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-700/30 hover:shadow-elevated dark:border-[#193c30] dark:bg-[#0f231c] dark:hover:border-emerald-600/40">
      {/* Top row: Icon + Titles + Bookmark */}
      <div className="flex items-start gap-4">
        {/* Amber Mortarboard Icon Box - Exactly as Reference Image 1 */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-800 shadow-xs dark:bg-amber-950/60 dark:text-amber-300">
          <GraduationCap className="h-6 w-6" />
        </div>

        {/* Title & Organization */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              onClick={() => onViewDetails && onViewDetails(scholarship)}
              className="cursor-pointer truncate text-base font-bold text-stone-900 transition-colors group-hover:text-[#064e3b] dark:text-stone-100 dark:group-hover:text-emerald-400"
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
                className={`p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors ${
                  isBookmarked ? "text-amber-600 fill-amber-600 dark:text-amber-400" : ""
                }`}
                aria-label="Bookmark scholarship"
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
              </button>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs font-medium text-stone-500 dark:text-stone-400">
            {scholarship.ministry}
          </p>
        </div>
      </div>

      {/* Match Score & Deadline - Matching Reference Image 1 */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-[#064e3b] dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            {scholarship.matchScore}% match
          </span>
          <span className="text-stone-500 dark:text-stone-400 font-normal">
            {scholarship.closingDateFormatted}
          </span>
        </div>

        {/* Solid Forest Green Progress Bar - Matching Reference Image 1 */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-[#193c30]">
          <div
            className="h-full rounded-full bg-[#064e3b] transition-all duration-700 dark:bg-emerald-500"
            style={{ width: `${scholarship.matchScore}%` }}
          />
        </div>
      </div>

      {!compact && (
        <>
          {/* Metadata chips */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-stone-100 dark:border-[#193c30]/70">
            <span className="text-xs font-bold text-stone-900 dark:text-emerald-300">
              {scholarship.amountFormatted}
            </span>
            <span className="text-stone-300 dark:text-stone-600">•</span>
            <Badge variant="mint" size="sm">
              {scholarship.category} Category
            </Badge>
            <Badge variant="subtle" size="sm">
              {scholarship.educationLevel}
            </Badge>
          </div>

          {/* Description snippet */}
          <p className="mt-2.5 line-clamp-2 text-xs text-stone-600 leading-relaxed dark:text-stone-300">
            {scholarship.description}
          </p>

          {/* Bottom Card Actions */}
          <div className="mt-4 flex items-center justify-between gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails && onViewDetails(scholarship)}
              className="text-xs text-stone-600 hover:text-stone-900 px-2.5 dark:text-stone-300 dark:hover:text-white"
            >
              View Eligibility
            </Button>
            <Button
              size="sm"
              onClick={() => onQuickApply ? onQuickApply(scholarship) : (onViewDetails && onViewDetails(scholarship))}
              className="bg-[#064e3b] hover:bg-[#053d2e] text-white rounded-xl text-xs gap-1.5 px-3.5 dark:bg-emerald-600"
            >
              Apply Scheme
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
