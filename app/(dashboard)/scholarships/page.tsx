"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Bookmark,
  GraduationCap,
  Sparkles,
  ArrowUpDown,
  LayoutGrid,
  List,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SCHOLARSHIPS, Scholarship } from "@/lib/data/scholarships";
import { ScholarshipCard } from "@/components/shared/ScholarshipCard";
import { DetailModal } from "@/components/shared/DetailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ScholarshipDiscoveryPage() {
  const [scholarshipList, setScholarshipList] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"match" | "deadline" | "amount">("match");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(["nfst-2026"]);

  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchSupabaseScholarships() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("scholarships")
          .select("*")
          .order("deadline", { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: Scholarship[] = data.map((item: any) => ({
            id: item.id,
            slug: item.id,
            title: item.title,
            ministry: "Ministry of Tribal Affairs & Government of India",
            category: (item.category_eligible?.[0] as any) || "ST",
            educationLevel: item.level === "PhD" ? "Ph.D. / Fellowship" : (item.level as any) || "Post-Matric",
            matchScore: 94,
            deadline: item.deadline,
            closingDateFormatted: `Closes ${new Date(item.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
            amount: Number(item.amount_monthly) || 10000,
            amountFormatted: `₹${Number(item.amount_monthly).toLocaleString()} / month`,
            amountPeriod: "month",
            description: item.description,
            eligibilityCriteria: item.eligibility_criteria || ["ST / SC candidates", "Annual Income < 8 LPA"],
            requiredDocuments: ["Income Certificate", "Caste Certificate", "Aadhaar", "Mark Sheet"],
            benefits: ["Monthly Fellowship via DBT", "Contingency Research Grant"],
            selectionProcess: "Direct Merit Scrutiny by State Nodal Cell",
            sponsoringBody: "Central Ministry",
            tags: [item.level, item.status, "DBT Transfer"],
            genderEligibility: "All",
          }));
          setScholarshipList(mapped);
        } else {
          setScholarshipList(SCHOLARSHIPS);
        }
      } catch (err) {
        setScholarshipList(SCHOLARSHIPS);
      } finally {
        setLoading(false);
      }
    }

    fetchSupabaseScholarships();
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredScholarships = useMemo(() => {
    return scholarshipList
      .filter((s) => {
        const matchesSearch =
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.ministry.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "All" ||
          s.category === selectedCategory ||
          s.category === "All";

        const matchesLevel =
          selectedLevel === "All" ||
          s.educationLevel.toLowerCase().includes(selectedLevel.toLowerCase());

        return matchesSearch && matchesCategory && matchesLevel;
      })
      .sort((a, b) => {
        if (sortBy === "match") return b.matchScore - a.matchScore;
        if (sortBy === "amount") return b.amount - a.amount;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
  }, [scholarshipList, searchQuery, selectedCategory, selectedLevel, sortBy]);

  const categories = ["All", "ST", "SC", "OBC", "Minority", "General"];
  const levels = ["All", "Pre-Matric", "Post-Matric", "UG", "PG", "PhD"];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white">
            Scholarship Discovery
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Explore verified affirmative action schemes, national fellowships, and state grants from Supabase Database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
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
              <option value="match">Sort: AI Match Score</option>
              <option value="deadline">Sort: Closing Date</option>
              <option value="amount">Sort: Grant Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c] space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by scheme name, description, degree level or keywords..."
            className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-4 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#064e3b] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#064e3b] dark:border-[#193c30] dark:bg-[#132820] dark:text-white"
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

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider dark:text-stone-400 mr-2">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-[#064e3b] text-white shadow-xs dark:bg-emerald-600"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-[#132820] dark:text-stone-300 dark:hover:bg-[#193c30]"
              }`}
            >
              {cat}
            </button>
          ))}

          <span className="mx-2 text-stone-300 dark:text-stone-600 hidden sm:inline">|</span>

          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider dark:text-stone-400 mr-2">
            Level:
          </span>
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                selectedLevel === lvl
                  ? "bg-[#064e3b] text-white shadow-xs dark:bg-emerald-600"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-[#132820] dark:text-stone-300 dark:hover:bg-[#193c30]"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400 px-1">
        <span>Showing {filteredScholarships.length} opportunities from Supabase</span>
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
            <div key={i} className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-[#193c30] dark:bg-[#0f231c] space-y-4">
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
            Try adjusting your search query or resetting filters to view all available affirmative action schemes.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedLevel("All");
            }}
            className="mt-4"
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
              isBookmarked={bookmarkedIds.includes(scholarship.id)}
              onToggleBookmark={toggleBookmark}
              onViewDetails={(s) => {
                setSelectedScholarship(s);
                setModalOpen(true);
              }}
              onQuickApply={(s) => {
                setSelectedScholarship(s);
                setModalOpen(true);
              }}
              compact={viewMode === "list"}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal
        scholarship={selectedScholarship}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
