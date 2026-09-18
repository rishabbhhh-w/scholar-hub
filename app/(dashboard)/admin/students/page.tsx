"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  UserCheck,
  Mail,
  Building,
  MapPin,
  Calendar,
  FileText,
  Clock,
  ChevronRight,
  X,
  BadgeCheck,
  Award,
  BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  category: string;
  state: string;
  institution: string;
  created_at: string;
  applicationsCount?: number;
  documentsCount?: number;
}

export interface StudentApplication {
  id: string;
  status: string;
  tracking_number: string;
  submitted_at: string;
  scholarships?: {
    title: string;
    amount_monthly: number;
  };
}

export default function AllStudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Side Panel state
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [studentApps, setStudentApps] = useState<StudentApplication[]>([]);
  const [studentDocCount, setStudentDocCount] = useState<number>(0);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const supabase = createClient();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // 1. Fetch profiles where role = 'student' (or not admin)
      const { data: profs, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("role", "admin")
        .neq("role", "nodal_officer")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (profs && profs.length > 0) {
        // 2. Fetch application counts grouped by user_id
        const { data: apps } = await supabase.from("applications").select("user_id");

        const appCountMap = new Map<string, number>();
        (apps || []).forEach((app) => {
          appCountMap.set(app.user_id, (appCountMap.get(app.user_id) || 0) + 1);
        });

        const studentList = profs.map((st) => ({
          ...st,
          applicationsCount: appCountMap.get(st.id) || 0,
        }));

        setStudents(studentList);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch detailed application list & document count when student panel opens
  const openStudentPanel = async (student: StudentProfile) => {
    setSelectedStudent(student);
    setLoadingDetails(true);
    try {
      // Fetch student applications
      const { data: apps } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          tracking_number,
          submitted_at,
          scholarships:scholarship_id (title, amount_monthly)
        `)
        .eq("user_id", student.id)
        .order("submitted_at", { ascending: false });

      setStudentApps((apps as unknown as StudentApplication[]) || []);

      // Fetch student document count
      const { count: docCount } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", student.id);

      setStudentDocCount(docCount || 0);
    } catch (err) {
      console.error("Error fetching student details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter((st) => {
    const q = searchQuery.toLowerCase();
    const name = st.full_name?.toLowerCase() || "";
    const email = st.email?.toLowerCase() || "";
    const state = st.state?.toLowerCase() || "";
    const category = st.category || "";

    const matchesSearch = name.includes(q) || email.includes(q) || state.includes(q) || category.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === "All" ? true : category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2.5">
            <Users className="h-7 w-7 text-[#064e3b] dark:text-emerald-400" />
            All Registered Students
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Directory of registered student scholars, application history, and profile records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-[#064e3b] text-white dark:bg-emerald-600 px-3 py-1 text-xs">
            {students.length} Total Scholars
          </Badge>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white dark:bg-[#0f231c] p-4 rounded-2xl border border-stone-200 dark:border-[#193c30]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search student name, email, category, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs bg-stone-50 dark:bg-[#081510] border-stone-200 dark:border-[#193c30] rounded-xl"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <Filter className="h-4 w-4 text-stone-400 shrink-0 mr-1" />
          {["All", "ST", "SC", "OBC", "General", "Minority"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? "bg-[#064e3b] text-white dark:bg-emerald-600"
                  : "bg-stone-100 text-stone-600 dark:bg-[#132820] dark:text-stone-300 hover:bg-stone-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Student List Table */}
      <div className="rounded-2xl border border-stone-200 bg-white dark:border-[#193c30] dark:bg-[#0f231c] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-[#153228] dark:text-stone-500">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-stone-800 dark:text-stone-100">
              No students found
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              {searchQuery || categoryFilter !== "All"
                ? "No student records match your current search or category filter."
                : "Registered students will appear here once they sign up on Scholar Hub."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50/70 text-stone-500 dark:border-[#193c30] dark:bg-[#081510] dark:text-stone-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">State</th>
                  <th className="px-5 py-3.5">Institution</th>
                  <th className="px-5 py-3.5">Joined Date</th>
                  <th className="px-5 py-3.5">Applications</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-[#193c30]">
                {filteredStudents.map((st) => {
                  const initials = st.full_name
                    ? st.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "SH";

                  return (
                    <tr
                      key={st.id}
                      onClick={() => openStudentPanel(st)}
                      className="hover:bg-stone-50/80 transition-colors cursor-pointer dark:hover:bg-[#132820]/60"
                    >
                      {/* Avatar + Full Name + Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#064e3b]/10 text-[#064e3b] font-bold text-xs dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900 dark:text-stone-100">
                              {st.full_name || "Scholar Student"}
                            </p>
                            <p className="text-[10px] text-stone-400 dark:text-stone-500">
                              {st.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-stone-100 text-stone-800 dark:bg-[#153228] dark:text-stone-200 border border-stone-200 dark:border-[#193c30]">
                          {st.category || "ST"}
                        </span>
                      </td>

                      {/* State */}
                      <td className="px-5 py-4 text-stone-700 dark:text-stone-300 font-medium">
                        {st.state || "Jharkhand"}
                      </td>

                      {/* Institution */}
                      <td className="px-5 py-4 text-stone-600 dark:text-stone-400 max-w-xs truncate">
                        {st.institution || "Central University"}
                      </td>

                      {/* Joined Date */}
                      <td className="px-5 py-4 text-stone-500 dark:text-stone-400 whitespace-nowrap">
                        {st.created_at
                          ? new Date(st.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Sep 2026"}
                      </td>

                      {/* Total Applications Count */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
                          <BookOpen className="h-3 w-3" />
                          {st.applicationsCount || 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                          <UserCheck className="h-3 w-3" /> Active
                        </span>
                      </td>

                      {/* Details Arrow */}
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                        >
                          <ChevronRight className="h-4 w-4" />
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

      {/* Student Details Side Panel / Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg h-full bg-white dark:bg-[#0f231c] border-l border-stone-200 dark:border-[#193c30] p-6 shadow-2xl flex flex-col space-y-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-[#193c30] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#064e3b] text-white font-extrabold text-sm dark:bg-emerald-600">
                  {selectedStudent.full_name
                    ? selectedStudent.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "SH"}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 dark:text-white">
                    {selectedStudent.full_name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {selectedStudent.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-[#153228] dark:hover:text-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Overview Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-stone-50 dark:bg-[#081510] p-3.5 border border-stone-200 dark:border-[#193c30]">
                <p className="text-[10px] text-stone-400 uppercase font-bold">Applications</p>
                <p className="text-lg font-extrabold text-stone-900 dark:text-white mt-0.5">
                  {selectedStudent.applicationsCount || 0}
                </p>
              </div>

              <div className="rounded-2xl bg-stone-50 dark:bg-[#081510] p-3.5 border border-stone-200 dark:border-[#193c30]">
                <p className="text-[10px] text-stone-400 uppercase font-bold">Vault Documents</p>
                <p className="text-lg font-extrabold text-stone-900 dark:text-white mt-0.5">
                  {studentDocCount} Files
                </p>
              </div>
            </div>

            {/* Complete Profile Details */}
            <div className="rounded-2xl bg-stone-50 dark:bg-[#081510] p-4 border border-stone-200 dark:border-[#193c30] space-y-3 text-xs">
              <p className="font-bold text-stone-400 uppercase text-[10px] tracking-wider">
                Profile Credentials
              </p>

              <div className="space-y-2 text-stone-800 dark:text-stone-200">
                <div className="flex items-center justify-between py-1 border-b border-stone-200/60 dark:border-[#193c30]">
                  <span className="text-stone-500">Social Category:</span>
                  <span className="font-bold">{selectedStudent.category || "ST"}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-200/60 dark:border-[#193c30]">
                  <span className="text-stone-500">Domicile State:</span>
                  <span className="font-bold">{selectedStudent.state || "Jharkhand"}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-200/60 dark:border-[#193c30]">
                  <span className="text-stone-500">Institution:</span>
                  <span className="font-bold max-w-[200px] truncate">{selectedStudent.institution}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-stone-500">Account Registered:</span>
                  <span className="font-semibold">
                    {selectedStudent.created_at
                      ? new Date(selectedStudent.created_at).toLocaleDateString("en-IN")
                      : "Sep 2026"}
                  </span>
                </div>
              </div>
            </div>

            {/* Submitted Applications History */}
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              <h4 className="text-xs font-extrabold text-stone-900 dark:text-white flex items-center justify-between">
                <span>Application History</span>
                <span className="text-[10px] text-stone-400 font-normal">
                  {studentApps.length} records
                </span>
              </h4>

              {loadingDetails ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ) : studentApps.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-300 dark:border-[#193c30] p-6 text-center text-xs text-stone-400">
                  No applications submitted yet by this student.
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                  {studentApps.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-2xl border border-stone-200 dark:border-[#193c30] bg-stone-50/50 dark:bg-[#081510] p-3 text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-stone-900 dark:text-stone-100">
                          {app.scholarships?.title || "Scholarship Application"}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          Ref: {app.tracking_number}
                        </p>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === "approved"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : app.status === "rejected"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Close */}
            <div className="pt-2">
              <Button
                onClick={() => setSelectedStudent(null)}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl dark:bg-[#153228] dark:text-stone-200"
              >
                Close Panel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
