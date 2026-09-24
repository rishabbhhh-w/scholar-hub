"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
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
  Plus,
  Edit3,
  Users,
  Trash2,
  Check,
  Building,
  Calendar,
  IndianRupee,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Scholarship, SCHOLARSHIPS } from "@/lib/data/scholarships";
import { ScholarshipCard } from "@/components/shared/ScholarshipCard";
import { DetailModal } from "@/components/shared/DetailModal";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/shared/Toast";
import {
  applyToScholarship,
  getUserAppliedScholarshipIds,
} from "@/lib/services/applications";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { parseAmount } from "@/lib/utils";

const UI_TO_DB_LEVEL: Record<string, string> = {
  "Pre-Matric": "Pre-Matric",
  "Post-Matric": "Post-Matric",
  "Undergraduate": "UG",
  "Postgraduate": "PG",
  "Ph.D. / Fellowship": "PhD",
};

const DB_TO_UI_LEVEL: Record<string, string> = {
  "Pre-Matric": "Pre-Matric",
  "Post-Matric": "Post-Matric",
  "UG": "Undergraduate",
  "PG": "Postgraduate",
  "PhD": "Ph.D. / Fellowship",
};

function ScholarshipsContent() {
  const profile = useUserProfile();
  const isOfficerOrAdmin = profile.role === "admin" || profile.role === "nodal_officer";
  const searchParams = useSearchParams();
  const initialQuery = searchParams ? searchParams.get("q") || searchParams.get("query") || "" : "";

  const [scholarshipList, setScholarshipList] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"match" | "deadline" | "amount">("deadline");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [appliedScholarshipIds, setAppliedScholarshipIds] = useState<string[]>([]);
  const [applyingScholarshipId, setApplyingScholarshipId] = useState<string | null>(null);

  // Student Detail Modal
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Admin Add / Edit Scheme Modal State
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scholarship | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formMinistry, setFormMinistry] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState<number>(10000);
  const [formCategory, setFormCategory] = useState<string>("ST");
  const [formLevel, setFormLevel] = useState<string>("Post-Matric");
  const [formDeadline, setFormDeadline] = useState("2026-11-30");
  const [formStatus, setFormStatus] = useState<"active" | "closed">("active");
  const [isSavingScheme, setIsSavingScheme] = useState(false);

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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);
        const appliedIds = await getUserAppliedScholarshipIds(supabase, user.id);
        setAppliedScholarshipIds(appliedIds);
      }

      // Fetch scholarships from Supabase
      let { data, error } = await supabase
        .from("scholarships")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Fallback ordering if created_at column is missing
        const fallback = await supabase
          .from("scholarships")
          .select("*")
          .order("deadline", { ascending: true });
        data = fallback.data;
        error = fallback.error;
      }

      let mapped: Scholarship[] = [];

      if (data && data.length > 0) {
        mapped = data.map((item: any) => {
          const eligibleArray: string[] = Array.isArray(item.category_eligible)
            ? item.category_eligible
            : typeof item.category_eligible === "string"
            ? item.category_eligible.replace(/[{}]/g, "").split(",")
            : item.category ? [item.category] : [];

          const titleVal = item.name || item.title || "Scholarship Scheme";
          const ministryVal = item.ministry || "Ministry of Tribal Affairs & Government of India";
          const categoryVal = item.category || (eligibleArray.length > 0 ? eligibleArray[0] : "All Categories");
          
          const rawLevel = item.education_level || item.level || "";
          const levelVal = DB_TO_UI_LEVEL[rawLevel] || rawLevel || "Post-Matric";
          const deadlineVal = item.closing_date || item.deadline || "";

          const amountVal = parseAmount(item.amount, 10000);
          const amountFormattedVal = `₹${amountVal.toLocaleString("en-IN")} / month`;

          const statusVal = item.status === "active" || item.is_active === true ? "active" : "closed";

          return {
            id: item.id,
            slug: item.id,
            title: titleVal,
            name: titleVal,
            ministry: ministryVal,
            category: categoryVal as any,
            educationLevel: levelVal as any,
            education_level: item.education_level || UI_TO_DB_LEVEL[levelVal] || levelVal,
            level: item.level || UI_TO_DB_LEVEL[levelVal] || levelVal,
            matchScore: 95,
            deadline: deadlineVal,
            closing_date: deadlineVal,
            closingDateFormatted: deadlineVal
              ? `Closes ${new Date(deadlineVal).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}`
              : "Ongoing",
            amount: amountVal,
            amountFormatted: amountFormattedVal,
            amountPeriod: "month",
            description: item.description || "Government scholarship scheme.",
            eligibilityCriteria: eligibleArray.length > 0 ? eligibleArray.map((c) => `${c} candidates eligible`) : ["Eligible candidates"],
            requiredDocuments: [
              "Aadhaar Card",
              "Caste Certificate",
              "Income Certificate",
              "Marksheet",
            ],
            benefits: ["Monthly DBT Fellowship", "Contingency Research Grant"],
            selectionProcess: "Direct Verification by State Nodal Officer",
            sponsoringBody: "Central Ministry",
            tags: eligibleArray.length > 0 ? eligibleArray : [categoryVal],
            genderEligibility: "All",
            status: statusVal as any,
            is_active: statusVal === "active",
          };
        });
      }

      setScholarshipList(mapped);
    } catch (err: any) {
      console.error("Error fetching scholarships:", err);
      setFetchError("Failed to load scholarships.");
      setScholarshipList([]);
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

  // Open Modal for Creating a New Scheme
  const handleOpenAddModal = () => {
    setEditingScheme(null);
    setFormTitle("");
    setFormMinistry("Ministry of Tribal Affairs & Government of India");
    setFormDescription("");
    setFormAmount(10000);
    setFormCategory("ST");
    setFormLevel("Post-Matric");
    setFormDeadline("2026-11-30");
    setFormStatus("active");
    setIsSchemeModalOpen(true);
  };

  // Open Modal for Editing an Existing Scheme
  const handleOpenEditModal = (scholarship: Scholarship) => {
    setEditingScheme(scholarship);
    setFormTitle(scholarship.title);
    setFormMinistry(scholarship.ministry || "Ministry of Tribal Affairs");
    setFormDescription(scholarship.description || "");

    const parsedAmt = typeof scholarship.amount === "number"
      ? scholarship.amount
      : parseInt(String(scholarship.amount || "").replace(/[^0-9]/g, ""), 10);
    setFormAmount(!isNaN(parsedAmt) && parsedAmt > 0 ? parsedAmt : 10000);

    setFormCategory(scholarship.category || "ST");

    const rawLvl = (scholarship as any).education_level || (scholarship as any).level || scholarship.educationLevel;
    const uiLevel = DB_TO_UI_LEVEL[rawLvl] || rawLvl || "Post-Matric";
    setFormLevel(uiLevel);

    setFormDeadline(scholarship.deadline || "2026-11-30");

    const currStatus = (scholarship as any).status || ((scholarship as any).is_active ? "active" : "closed");
    setFormStatus(currStatus === "active" ? "active" : "closed");

    setIsSchemeModalOpen(true);
  };

  // Save Scheme to Supabase (Add or Update)
  const handleSaveScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDeadline) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    setIsSavingScheme(true);

    try {
      const dbLevel = UI_TO_DB_LEVEL[formLevel] || formLevel;
      let payload: Record<string, any> = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        amount: parseAmount(formAmount, 10000),
        category_eligible: [formCategory],
        education_level: dbLevel,
        deadline: formDeadline,
        status: formStatus,
      };

      if (editingScheme) {
        // Update existing scheme
        let { error } = await supabase
          .from("scholarships")
          .update(payload)
          .eq("id", editingScheme.id);

        if (error && error.message.includes("category_eligible")) {
          delete payload.category_eligible;
          payload.category = formCategory;
          const fallbackRes = await supabase
            .from("scholarships")
            .update(payload)
            .eq("id", editingScheme.id);
          error = fallbackRes.error;
        }

        if (error && error.message.includes("education_level")) {
          delete payload.education_level;
          payload.level = dbLevel;
          const fallbackRes = await supabase
            .from("scholarships")
            .update(payload)
            .eq("id", editingScheme.id);
          error = fallbackRes.error;
        }

        if (error) {
          throw new Error(error.message);
        }

        toast.success("Scholarship scheme updated successfully!");
      } else {
        // Insert new scheme
        let { error } = await supabase
          .from("scholarships")
          .insert(payload);

        if (error && error.message.includes("category_eligible")) {
          delete payload.category_eligible;
          payload.category = formCategory;
          const fallbackRes = await supabase.from("scholarships").insert(payload);
          error = fallbackRes.error;
        }

        if (error && error.message.includes("education_level")) {
          delete payload.education_level;
          payload.level = dbLevel;
          const fallbackRes = await supabase.from("scholarships").insert(payload);
          error = fallbackRes.error;
        }

        if (error) {
          throw new Error(error.message);
        }

        toast.success("New scholarship scheme created successfully!");
      }

      await fetchScholarshipsAndApplications();
      setIsSchemeModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save scholarship scheme.");
    } finally {
      setIsSavingScheme(false);
    }
  };

  // Toggle Active / Closed Status
  const handleToggleStatus = async (scholarship: Scholarship) => {
    const currentStatus = (scholarship as any).status === "active" ? "active" : "closed";
    const newStatus = currentStatus === "active" ? "closed" : "active";

    // Optimistic UI update
    setScholarshipList((prev) =>
      prev.map((s) => (s.id === scholarship.id ? { ...s, status: newStatus as any } : s))
    );

    try {
      const { error } = await supabase
        .from("scholarships")
        .update({ status: newStatus })
        .eq("id", scholarship.id);

      if (error) {
        throw new Error(error.message);
      }
      toast.success(`Scheme "${scholarship.title}" set to ${newStatus.toUpperCase()}`);
      await fetchScholarshipsAndApplications();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update scheme status.");
      await fetchScholarshipsAndApplications();
    }
  };

  // Delete Scheme
  const handleDeleteScheme = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete scheme "${title}"?`)) return;

    setScholarshipList((prev) => prev.filter((s) => s.id !== id));

    try {
      const { error } = await supabase.from("scholarships").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
      toast.success(`Scheme "${title}" removed.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete scheme.");
      await fetchScholarshipsAndApplications();
    }
  };

  const filteredScholarships = useMemo(() => {
    return scholarshipList
      .filter((s) => {
        // If student, filter out closed schemes
        if (!isOfficerOrAdmin && (s as any).status === "closed") return false;

        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.ministry.toLowerCase().includes(q) ||
          (Array.isArray(s.tags) && s.tags.some((t) => t.toLowerCase().includes(q)));

        const matchesCategory =
          selectedCategory === "All" ||
          (Array.isArray(s.tags) && s.tags.includes(selectedCategory)) ||
          s.category === selectedCategory;

        const matchesLevel =
          selectedLevel === "All" ||
          s.educationLevel.toLowerCase().includes(selectedLevel.toLowerCase());

        const matchesStatus =
          selectedStatus === "All" || (s as any).status === selectedStatus;

        return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "amount") return b.amount - a.amount;
        if (sortBy === "match") return b.matchScore - a.matchScore;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
  }, [scholarshipList, searchQuery, selectedCategory, selectedLevel, selectedStatus, sortBy, isOfficerOrAdmin]);

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
              ? "High-density management table for affirmative action schemes, eligibility rules, and applicant queues."
              : "Browse verified Central and State affirmative action scholarships for ST/SC/OBC students."}
          </p>
        </div>

        {/* Top Right Action Button: Add New Scheme for Admin vs Grid Controls for Student */}
        {isOfficerOrAdmin ? (
          <Button
            size="sm"
            onClick={handleOpenAddModal}
            className="bg-[#064e3b] hover:bg-[#053d2e] text-white text-xs gap-1.5 dark:bg-emerald-600 shadow-md h-10 px-4"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Scheme</span>
          </Button>
        ) : (
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
        )}
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
            placeholder="Search scholarships by title, keyword, or ministry..."
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

        {/* Status Filter Chip for Officer View */}
        {isOfficerOrAdmin && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100 dark:border-[#193c30]">
            <span className="text-xs font-semibold text-stone-400 mr-2">Status:</span>
            {[
              { key: "All", label: "All Schemes" },
              { key: "active", label: "Active Only" },
              { key: "closed", label: "Closed Only" },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setSelectedStatus(st.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedStatus === st.key
                    ? "bg-amber-700 text-white shadow-sm dark:bg-amber-600"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-[#132820] dark:text-stone-300 dark:hover:bg-[#193c30]"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400 px-1">
        <span>Showing {filteredScholarships.length} scholarship schemes</span>
      </div>

      {/* Skeletons while loading */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      ) : isOfficerOrAdmin ? (
        /* ========================================================= */
        /* ADMIN HIGH-DENSITY DATA TABLE FOR ADMIN / NODAL OFFICERS  */
        /* ========================================================= */
        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
          {filteredScholarships.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <GraduationCap className="h-12 w-12 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                No matching scholarship schemes found
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedLevel("All");
                  setSelectedStatus("All");
                }}
                className="text-xs"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200/80 text-stone-400 dark:border-[#193c30]">
                    <th className="py-3 px-3 font-bold uppercase tracking-wider">Scheme & Department</th>
                    <th className="py-3 px-3 font-bold uppercase tracking-wider">Category & Level</th>
                    <th className="py-3 px-3 font-bold uppercase tracking-wider">Disbursed Amount</th>
                    <th className="py-3 px-3 font-bold uppercase tracking-wider">Closing Date</th>
                    <th className="py-3 px-3 font-bold uppercase tracking-wider text-center">Status</th>
                    <th className="py-3 px-3 font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-[#193c30]">
                  {filteredScholarships.map((s) => {
                    const isActive = (s as any).status === "active";

                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-stone-50/70 dark:hover:bg-[#132820]/60 transition-colors"
                      >
                        {/* Scheme & Department */}
                        <td className="py-4 px-3 max-w-xs sm:max-w-md">
                          <span className="font-bold text-sm text-stone-900 dark:text-white block line-clamp-1">
                            {(s as any).name || s.title}
                          </span>
                          <span className="text-[11px] text-stone-500 dark:text-stone-400 block mt-0.5 truncate">
                            {s.ministry || "Ministry of Tribal Affairs & Government of India"}
                          </span>
                        </td>

                        {/* Category & Level */}
                        <td className="py-4 px-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="mint" size="sm">
                              {(s as any).category || (s as any).category_eligible || "All Categories"}
                            </Badge>
                            <Badge variant="subtle" size="sm">
                              {(s as any).education_level || (s as any).educationLevel || (s as any).level || "All Levels"}
                            </Badge>
                          </div>
                        </td>

                        {/* Disbursed Amount */}
                        <td className="py-4 px-3 font-bold text-emerald-800 dark:text-emerald-400 whitespace-nowrap">
                          {typeof (s as any).amount === 'string' && (s as any).amount.includes('₹')
                            ? (s as any).amount
                            : (s.amountFormatted || (typeof s.amount === 'number' && !isNaN(s.amount) ? `₹${s.amount.toLocaleString("en-IN")} / month` : `₹${s.amount || '0'} / month`))}
                        </td>

                        {/* Deadline */}
                        <td className="py-4 px-3 text-stone-600 dark:text-stone-300 whitespace-nowrap">
                          {((s as any).closing_date || s.deadline)
                            ? `Closes ${new Date((s as any).closing_date || s.deadline).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}`
                            : "Ongoing"}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(s)}
                            className="inline-flex items-center gap-1.5 cursor-pointer group"
                            title="Click to toggle status"
                          >
                            <Badge
                              variant={isActive ? "mint" : "danger"}
                              size="sm"
                              className="group-hover:opacity-80 transition-opacity"
                            >
                              {isActive ? "Active" : "Closed"}
                            </Badge>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditModal(s)}
                              className="h-8 text-xs gap-1 border-stone-200 text-stone-700 hover:bg-stone-100 dark:border-[#193c30] dark:text-stone-300 dark:hover:bg-[#132820]"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </Button>

                            {/* View Applicants Link */}
                            <Link href="/admin/applications">
                              <Button
                                type="button"
                                size="sm"
                                className="h-8 bg-[#064e3b] hover:bg-[#053d2e] text-white text-xs gap-1 px-3 dark:bg-emerald-600"
                              >
                                <Users className="h-3.5 w-3.5" />
                                <span>Applicants</span>
                              </Button>
                            </Link>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteScheme(s.id, s.title)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                              title="Delete scheme"
                            >
                              <Trash2 className="h-4 w-4" />
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
      ) : filteredScholarships.length === 0 ? (
        /* Student Empty State */
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
        /* Student Card Grid */
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

      {/* Student Detail Modal */}
      {selectedScholarship && (
        <DetailModal
          scholarship={selectedScholarship}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Admin Add / Edit Scheme Form Modal */}
      <Modal
        isOpen={isSchemeModalOpen}
        onClose={() => setIsSchemeModalOpen(false)}
        title={editingScheme ? "Edit Scholarship Scheme" : "Create New Scholarship Scheme"}
        description={
          editingScheme
            ? "Update scheme attributes, monthly disbursement grant, and active status in Supabase database."
            : "Add a new affirmative action scholarship scheme directly into the portal database."
        }
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveScheme} className="space-y-4 pt-2">
          {/* Scheme Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Scheme Name / Title *
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. National Fellowship for ST Students"
              className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs sm:text-sm text-stone-900 focus:border-[#064e3b] focus:outline-none dark:border-[#193c30] dark:bg-[#0f231c] dark:text-white"
            />
          </div>

          {/* Ministry / Department */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Ministry / Sponsoring Department *
            </label>
            <input
              type="text"
              required
              value={formMinistry}
              onChange={(e) => setFormMinistry(e.target.value)}
              placeholder="e.g. Ministry of Tribal Affairs"
              className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs sm:text-sm text-stone-900 focus:border-[#064e3b] focus:outline-none dark:border-[#193c30] dark:bg-[#0f231c] dark:text-white"
            />
          </div>

          {/* Amount & Deadline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Monthly Amount */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Monthly Disbursed Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formAmount}
                onChange={(e) => setFormAmount(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs sm:text-sm text-stone-900 focus:border-[#064e3b] focus:outline-none dark:border-[#193c30] dark:bg-[#0f231c] dark:text-white"
              />
            </div>

            {/* Application Deadline */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Application Closing Date *
              </label>
              <input
                type="date"
                required
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
                className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs sm:text-sm text-stone-900 focus:border-[#064e3b] focus:outline-none dark:border-[#193c30] dark:bg-[#0f231c] dark:text-white"
              />
            </div>
          </div>

          {/* Category & Level Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Category */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Target Category *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs sm:text-sm text-stone-900 focus:border-[#064e3b] focus:outline-none dark:border-[#193c30] dark:bg-[#0f231c] dark:text-white"
              >
                <option value="ST">Scheduled Tribe (ST)</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="OBC">Other Backward Class (OBC)</option>
                <option value="General">General / EWS</option>
                <option value="Minority">Minority</option>
                <option value="All">All Categories</option>
              </select>
            </div>

            {/* Education Level */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Education Level *
              </label>
              <select
                value={formLevel}
                onChange={(e) => setFormLevel(e.target.value)}
                className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs sm:text-sm text-stone-900 focus:border-[#064e3b] focus:outline-none dark:border-[#193c30] dark:bg-[#0f231c] dark:text-white"
              >
                <option value="Pre-Matric">Pre-Matric (Class IX & X)</option>
                <option value="Post-Matric">Post-Matric</option>
                <option value="Undergraduate">Undergraduate (UG)</option>
                <option value="Postgraduate">Postgraduate (PG)</option>
                <option value="Ph.D. / Fellowship">Ph.D. / Fellowship</option>
              </select>
            </div>
          </div>

          {/* Active Status */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Scheme Status *
            </label>
            <select
              value={formStatus}
              onChange={(e: any) => setFormStatus(e.target.value)}
              className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs sm:text-sm text-stone-900 focus:border-[#064e3b] focus:outline-none dark:border-[#193c30] dark:bg-[#0f231c] dark:text-white"
            >
              <option value="active">Active (Visible to Students)</option>
              <option value="closed">Closed / Archived</option>
            </select>
          </div>

          {/* Scheme Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Scheme Description & Guidelines
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Provide official scholarship scheme overview and eligibility criteria..."
              className="w-full rounded-xl border border-stone-200 bg-white p-3 text-xs sm:text-sm text-stone-900 focus:border-[#064e3b] focus:outline-none dark:border-[#193c30] dark:bg-[#0f231c] dark:text-white"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex justify-end gap-2 border-t border-stone-100 dark:border-[#193c30]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsSchemeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSavingScheme}
              className="bg-[#064e3b] text-white dark:bg-emerald-600 gap-1.5"
            >
              {isSavingScheme ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingScheme ? "Save Changes" : "Create Scheme"}</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function ScholarshipDiscoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-stone-500 text-xs font-semibold">
          Loading scholarship portal...
        </div>
      }
    >
      <ScholarshipsContent />
    </Suspense>
  );
}
