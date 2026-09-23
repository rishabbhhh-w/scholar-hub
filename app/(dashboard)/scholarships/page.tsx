"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Bookmark,
  GraduationCap,
  Sparkles,
  ArrowUpDown,
  LayoutGrid,
  List,
  X,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Scholarship, SCHOLARSHIPS } from "@/lib/data/scholarships";
import { ScholarshipCard } from "@/components/shared/ScholarshipCard";
import { DetailModal } from "@/components/shared/DetailModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/shared/Toast";
import {
  applyToScholarship,
  getUserAppliedScholarshipIds,
} from "@/lib/services/applications";

import { useUserProfile } from "@/lib/hooks/useUserProfile";

function ScholarshipsContent() {
  const profile = useUserProfile();
  const isOfficerOrAdmin = profile.role === "admin" || profile.role === "nodal_officer";
  const searchParams = useSearchParams();
  const initialQuery = searchParams ? searchParams.get("q") || searchParams.get("query") || "" : "";

  const [scholarshipList, setScholarshipList] = useState<Scholarship[]>(SCHOLARSHIPS);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"match" | "deadline" | "amount">("deadline");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [appliedScholarshipIds, setAppliedScholarshipIds] = useState<string[]>([]);
  const [applyingScholarshipId, setApplyingScholarshipId] = useState<string | null>(null);

  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const q = searchParams ? searchParams.get("q") || searchParams.get("query") || "" : "";
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const fetchScholarshipsAndApplications = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      // 1. Get current logged in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);
        const appliedIds = await getUserAppliedScholarshipIds(supabase, user.id);
        setAppliedScholarshipIds(appliedIds);
      }

      // 2. Fetch scholarships from Supabase
      const { data, error } = await supabase
        .from("scholarships")
        .select("*")
        .eq("status", "active")
        .order("deadline", { ascending: true });

      let mapped: Scholarship[] = [];

      if (error) {
        console.warn("Supabase query error (using seed fallback):", error.message);
      }

      if (data && data.length > 0) {
        mapped = data.map((item: any) => {
          const eligibleArray: string[] = Array.isArray(item.category_eligible)
            ? item.category_eligible
            : typeof item.category_eligible === "string"
            ? item.category_eligible.replace(/[{}]/g, "").split(",")
            : ["ST", "SC", "OBC", "General"];

          return {
            id: item.id,
            slug: item.id,
            title: item.title,
            ministry: "Ministry of Tribal Affairs & Government of India",
            category: (eligibleArray[0] as any) || "ST",
            educationLevel:
              item.level === "PhD"
                ? "Ph.D. / Fellowship"
                : (item.level as any) || "Post-Matric",
            matchScore: 95,
            deadline: item.deadline,
            closingDateFormatted: `Closes ${new Date(item.deadline).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}`,
            amount: Number(item.amount_monthly || item.amount) || 10000,
            amountFormatted: `₹${Number(item.amount_monthly || item.amount || 10000).toLocaleString("en-IN")} / month`,
            amountPeriod: "month",
            description: item.description || "Government scholarship scheme.",
            eligibilityCriteria: eligibleArray.map((c) => `${c} candidates eligible`),
            requiredDocuments: [
              "Aadhaar Card",
              "Caste Certificate",
              "Income Certificate",
              "Marksheet",
            ],
            benefits: ["Monthly DBT Fellowship", "Contingency Research Grant"],
            selectionProcess: "Direct Verification by State Nodal Officer",
            sponsoringBody: "Central Ministry",
            tags: eligibleArray,
            genderEligibility: "All",
          };
        });
      }

      // Combine DB schemes with default seed SCHOLARSHIPS so schemes are ALWAYS available
      if (mapped.length === 0) {
        setScholarshipList(SCHOLARSHIPS);
      } else {
        const existingIds = new Set(mapped.map((s) => s.id));
        const combined = [...mapped];
        SCHOLARSHIPS.forEach((s) => {
          if (!existingIds.has(s.id)) {
            combined.push(s);
          }
        });
        setScholarshipList(combined);
      }
    } catch (err: any) {
      console.error("Error fetching scholarships:", err);
      // Fallback to static SCHOLARSHIPS
      setScholarshipList(SCHOLARSHIPS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarshipsAndApplications();
  }, []);

  const handleApply = async (scholarship: Scholarship) => {
    if (!currentUserId) {
      toast.error("Please sign in to apply for scholarships.");
      return;
    }

    if (appliedScholarshipIds.includes(scholarship.id)) {
      toast.info("You have already applied for this scholarship.");
      return;
    }

    setApplyingScholarshipId(scholarship.id);

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
        toast.error(result.error || "Failed to submit application.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.");
    } finally {
      setApplyingScholarshipId(null);
    }
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredScholarships = useMemo(() => {
    return scholarshipList
      .filter((s) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.ministry.toLowerCase().includes(q) ||
          (Array.isArray(s.eligibilityCriteria) &&
            s.eligibilityCriteria.some((c) => c.toLowerCase().includes(q))) ||
          (Array.isArray(s.tags) && s.tags.some((t) => t.toLowerCase().includes(q)));

        const matchesCategory =
          selectedCategory === "All" ||
          (Array.isArray(s.tags) && s.tags.includes(selectedCategory)) ||
          s.category === selectedCategory;

        const matchesLevel =
          selectedLevel === "All" ||
          s.educationLevel.toLowerCase().includes(selectedLevel.toLowerCase());

        return matchesSearch && matchesCategory && matchesLevel;
      })
      .sort((a, b) => {
        if (sortBy === "amount") return b.amount - a.amount;
        if (sortBy === "match") return b.matchScore - a.matchScore;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
  }, [scholarshipList, searchQuery, selectedCategory, selectedLevel, sortBy]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf5ea] px-3.5 py-1 text-xs font-semibold text-[#064e3b] dark:bg-emerald-950 dark:text-emerald-300 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isOfficerOrAdmin ? "Admin Control Desk" : "DBT Direct Transfer Desk"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            {isOfficerOrAdmin ? "Manage Scholarships" : "Scholarship Discovery"}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            {isOfficerOrAdmin
              ? "Oversee affirmative action schemes, update eligibility criteria, and scrutinize applicant queues."
              : "Browse verified Central and State affirmative action scholarships for ST/SC/OBC students."}
          </p>
        </div>

        {/* View Mode & Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-stone-100 p-1 dark:bg-[#132820]">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-[#064e3b] shadow-sm dark:bg-[#0f231c] dark:text-emerald-400"
                  : "text-stone-500 hover:text-stone-800 dark:text-stone-400"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-white text-[#064e3b] shadow-sm dark:bg-[#0f231c] dark:text-emerald-400"
                  : "text-stone-500 hover:text-stone-800 dark:text-stone-400"
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 dark:border-[#193c30] dark:bg-[#0f231c] dark:text-stone-200">
            <ArrowUpDown className="h-3.5 w-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="deadline">Sort: Closing Date</option>
              <option value="amount">Sort: Grant Amount</option>
              <option value="match">Sort: Match Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state with retry */}
      {fetchError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 flex items-center justify-between dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={() => fetchScholarshipsAndApplications()}
            className="flex items-center gap-1 rounded-lg bg-rose-200 px-3 py-1 font-semibold text-rose-900 hover:bg-rose-300 dark:bg-rose-900 dark:text-rose-100"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c] space-y-4">
        {/* Search input with real-time filtering */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholarships by title, keyword, ministry, or criteria..."
            className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-10 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#064e3b] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#064e3b] dark:border-[#193c30] dark:bg-[#132820] dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Categories Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100 dark:border-[#193c30]">
          <span className="text-xs font-semibold text-stone-400 mr-2">Category:</span>
          {["All", "ST", "SC", "OBC", "General", "Minority"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-[#064e3b] text-white shadow-sm dark:bg-emerald-600"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-[#132820] dark:text-stone-300 dark:hover:bg-[#193c30]"
              }`}
            >
              {cat === "All" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {/* Filter Education Level Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100 dark:border-[#193c30]">
          <span className="text-xs font-semibold text-stone-400 mr-2">Level:</span>
          {["All", "Pre-Matric", "Post-Matric", "Undergraduate", "Postgraduate", "Ph.D. / Fellowship"].map(
            (lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedLevel === lvl
                    ? "bg-[#064e3b] text-white shadow-sm dark:bg-emerald-600"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-[#132820] dark:text-stone-300 dark:hover:bg-[#193c30]"
                }`}
              >
                {lvl}
              </button>
            )
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400 px-1">
        <span>Showing {filteredScholarships.length} active opportunities</span>
        {bookmarkedIds.length > 0 && (
          <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
            <Bookmark className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            {bookmarkedIds.length} bookmarked
          </span>
        )}
      </div>

      {/* Skeletons while loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-[#193c30] dark:bg-[#0f231c] space-y-4"
            >
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-16 w-full rounded-2xl" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-24 rounded-xl" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredScholarships.length === 0 ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center dark:border-[#193c30] dark:bg-[#0f231c]">
          <GraduationCap className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
            No matching scholarships found
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or resetting filters to view all active affirmative action schemes.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedLevel("All");
            }}
            className="mt-4 text-xs"
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredScholarships.map((scholarship) => (
            <ScholarshipCard
              key={scholarship.id}
              scholarship={scholarship}
              userRole={profile.role}
              isApplied={appliedScholarshipIds.includes(scholarship.id)}
              isApplying={applyingScholarshipId === scholarship.id}
              onApply={handleApply}
              isBookmarked={bookmarkedIds.includes(scholarship.id)}
              onToggleBookmark={toggleBookmark}
              onViewDetails={(s) => {
                setSelectedScholarship(s);
                setModalOpen(true);
              }}
              compact={viewMode === "list"}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedScholarship && (
        <DetailModal
          scholarship={selectedScholarship}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function ScholarshipDiscoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-stone-500 text-xs font-semibold">
          Loading scholarship discovery...
        </div>
      }
    >
      <ScholarshipsContent />
    </Suspense>
  );
}
