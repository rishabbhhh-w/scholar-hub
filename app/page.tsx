"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Bot,
  Search,
  ShieldCheck,
  Award,
  ChevronRight,
  Users,
  IndianRupee,
  Clock,
  HelpCircle,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SCHOLARSHIPS } from "@/lib/data/scholarships";
import { ScholarshipCard } from "@/components/shared/ScholarshipCard";
import { Logo } from "@/components/shared/Logo";
import { DetailModal } from "@/components/shared/DetailModal";
import { SarthiChatWidget } from "@/components/shared/SarthiChatWidget";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

interface HeroScholarship {
  id: string;
  title: string;
  amount_monthly: number;
  deadline: string;
  category_eligible?: string[] | string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning, Scholar";
  if (hour >= 12 && hour < 17) return "Good afternoon, Scholar";
  return "Good evening, Scholar";
}

function formatDeadline(dateStr: string): string {
  if (!dateStr) return "Soon";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

export default function LandingPage() {
  const [selectedScholarship, setSelectedScholarship] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // Hero Card Real Supabase Scholarships State
  const [heroScholarships, setHeroScholarships] = useState<HeroScholarship[]>([]);
  const [loadingHero, setLoadingHero] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchHeroScholarships = async () => {
      setLoadingHero(true);
      try {
        const { data, error } = await supabase
          .from("scholarships")
          .select("id, title, amount_monthly, deadline, category_eligible")
          .eq("status", "active")
          .order("deadline", { ascending: true });

        if (!error && data && data.length > 0) {
          setHeroScholarships(data as HeroScholarship[]);
        } else {
          // Graceful fallback if database empty or fetch fails
          setHeroScholarships([
            {
              id: "hero-1",
              title: "National Fellowship for ST Students",
              amount_monthly: 37000,
              deadline: "2026-09-28",
              category_eligible: ["ST"],
            },
            {
              id: "hero-2",
              title: "Post-Matric Scholarship for ST/SC",
              amount_monthly: 12000,
              deadline: "2026-10-15",
              category_eligible: ["ST", "SC"],
            },
            {
              id: "hero-3",
              title: "National Overseas Scholarship",
              amount_monthly: 45000,
              deadline: "2026-10-30",
              category_eligible: ["ST", "OBC"],
            },
            {
              id: "hero-4",
              title: "Post-Doctoral Fellowship for ST",
              amount_monthly: 47000,
              deadline: "2026-11-10",
              category_eligible: ["ST"],
            },
            {
              id: "hero-5",
              title: "Central Sector Scheme of Scholarships",
              amount_monthly: 20000,
              deadline: "2026-11-25",
              category_eligible: ["General", "OBC"],
            },
          ]);
        }
      } catch (err) {
        // Graceful fallback
        setHeroScholarships([
          {
            id: "hero-1",
            title: "National Fellowship for ST Students",
            amount_monthly: 37000,
            deadline: "2026-09-28",
            category_eligible: ["ST"],
          },
          {
            id: "hero-2",
            title: "Post-Matric Scholarship for ST/SC",
            amount_monthly: 12000,
            deadline: "2026-10-15",
            category_eligible: ["ST", "SC"],
          },
          {
            id: "hero-3",
            title: "National Overseas Scholarship",
            amount_monthly: 45000,
            deadline: "2026-10-30",
            category_eligible: ["ST", "OBC"],
          },
        ]);
      } finally {
        setLoadingHero(false);
      }
    };

    fetchHeroScholarships();
  }, []);

  const faqs = [
    {
      q: "Who is eligible for the National Fellowship for ST Students?",
      a: "Any candidate belonging to a notified Scheduled Tribe (ST) category who has secured admission to regular and full-time M.Phil or Ph.D. degrees in a UGC-recognized university is eligible. Annual family income must not exceed ₹6.0 Lakhs.",
    },
    {
      q: "How does the Scholar AI Matching algorithm work?",
      a: "Scholar AI evaluates your demographic profile, state domicile, community category, parent income, and current degree against over 140 central and state affirmative action schemes to calculate match percentages and identify missing documents.",
    },
    {
      q: "Is there any charge for students using Scholar Hub?",
      a: "No. Scholar Hub is 100% free and open for all eligible students. It is dedicated to democratizing access to government fellowships and scholarships without intermediaries.",
    },
    {
      q: "How are scholarship funds disbursed?",
      a: "Funds are transferred directly into your Aadhaar-seeded bank account through the Public Financial Management System (PFMS) and Direct Benefit Transfer (DBT) with zero delays or agent commissions.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 dark:bg-[#07130e] dark:text-stone-100 selection:bg-emerald-200">
      {/* Dynamic Keyframes for Marquee Ticker */}
      <style jsx>{`
        @keyframes scrollUp {
          0% {
            transform: translateY(0%);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .animate-ticker-up {
          animation: scrollUp ${Math.max(16, heroScholarships.length * 4)}s linear infinite;
        }
        .animate-ticker-up:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Top Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Ambient background mesh */}
        <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl dark:bg-emerald-950/20" />
        <div className="pointer-events-none absolute top-1/2 left-0 h-96 w-96 rounded-full bg-amber-100/30 blur-3xl dark:bg-amber-950/10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Headline, Subtitle, Actions, Badges */}
            <div className="lg:col-span-7 space-y-8">
              {/* Mint Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf5ea] px-3.5 py-1.5 text-xs font-semibold text-[#064e3b] border border-[#d2ebd2] dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60 shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI-powered scholarship guidance</span>
              </div>

              {/* Display Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-[1.08]">
                Every opportunity.
                <br />
                <span className="text-stone-900 dark:text-stone-100">One clear path</span>
                <br />
                forward.
              </h1>

              {/* Subtitle */}
              <p className="max-w-xl text-lg sm:text-xl font-normal text-stone-600 dark:text-stone-300 leading-relaxed">
                Discover scholarships made for you, understand eligibility, organise documents, and track every application with confidence.
              </p>

              {/* Dual Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/dashboard">
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#064e3b] px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-[#053d2e] hover:shadow-md transition-all active:scale-[0.98] dark:bg-emerald-600 dark:hover:bg-emerald-500">
                    <span>Start your journey</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>

                <Link href="/scholarships">
                  <button className="inline-flex items-center justify-center rounded-xl border border-stone-300/90 bg-white px-7 py-3.5 text-base font-semibold text-stone-800 shadow-sm hover:bg-stone-50 hover:border-stone-400 transition-all dark:border-[#193c30] dark:bg-[#0f231c] dark:text-stone-100 dark:hover:bg-[#142f26]">
                    Explore scholarships
                  </button>
                </Link>
              </div>

              {/* Trust Checkmarks */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Verified opportunities</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Free for students</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Guidance in every step</span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Student Overview Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-md rounded-3xl border border-stone-200/90 bg-white p-6 shadow-2xl shadow-stone-200/60 dark:border-[#193c30] dark:bg-[#0c1c16] dark:shadow-black/40">
                {/* Header with Time-Based Greeting */}
                <div className="mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    STUDENT OVERVIEW
                  </span>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    {getGreeting()}
                  </h3>
                </div>

                {/* Infinite Auto-Scrolling Marquee Container */}
                <div className="relative h-[210px] overflow-hidden rounded-2xl border border-stone-200/90 bg-stone-50/40 dark:border-[#193c30] dark:bg-[#081510]">
                  {loadingHero ? (
                    <div className="p-3 space-y-2.5">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-stone-200/80 bg-white p-3 space-y-2 dark:border-[#193c30] dark:bg-[#0f231c]"
                        >
                          <Skeleton className="h-4 w-3/4" />
                          <div className="flex justify-between">
                            <Skeleton className="h-3 w-1/3" />
                            <Skeleton className="h-3 w-1/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="animate-ticker-up flex flex-col space-y-2.5 p-3">
                      {/* Duplicated list to form seamless infinite loop */}
                      {[...heroScholarships, ...heroScholarships].map((s, index) => {
                        const formattedDeadline = formatDeadline(s.deadline);
                        const categoryTag = Array.isArray(s.category_eligible)
                          ? s.category_eligible.join(" / ")
                          : s.category_eligible || "ST / SC / OBC";

                        return (
                          <div
                            key={`${s.id}-${index}`}
                            onClick={() => {
                              setSelectedScholarship(s);
                              setModalOpen(true);
                            }}
                            className="cursor-pointer shrink-0 rounded-xl border border-stone-200/90 bg-white p-3.5 transition-all hover:border-emerald-600/40 hover:bg-stone-50/90 dark:border-[#193c30] dark:bg-[#0f231c] dark:hover:bg-[#132d23]"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="truncate text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                                {s.title}
                              </h4>
                              <span className="shrink-0 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700 dark:bg-[#153228] dark:text-stone-200 border border-stone-200 dark:border-[#193c30]">
                                {categoryTag}
                              </span>
                            </div>

                            <div className="mt-2 flex items-center justify-between text-xs">
                              <span className="font-semibold text-[#064e3b] dark:text-emerald-400">
                                ₹{(s.amount_monthly || 0).toLocaleString("en-IN")} / month
                              </span>
                              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                                Closes {formattedDeadline}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Soft Highlighted Box Below */}
                <div className="mt-4 rounded-2xl bg-[#eaf5ea] p-4 border border-[#d2ebd2] dark:bg-[#0f281e] dark:border-[#193c30]">
                  <h4 className="text-xs font-bold text-[#064e3b] dark:text-emerald-300">
                    Want to check your eligibility?
                  </h4>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                    Create a free account or sign in to apply
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <Link href="/auth?mode=login" className="flex-1">
                      <button className="w-full rounded-xl border border-[#064e3b] px-3 py-2 text-xs font-semibold text-[#064e3b] hover:bg-[#064e3b]/10 transition-colors dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-950">
                        Sign In
                      </button>
                    </Link>

                    <Link href="/auth?mode=register" className="flex-1">
                      <button className="w-full rounded-xl bg-[#064e3b] px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#04382a] transition-colors dark:bg-emerald-600 dark:hover:bg-emerald-500">
                        Register Free →
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Real-time Impact Numbers */}
      <section id="impact" className="border-y border-stone-200/80 bg-white py-14 dark:border-[#193c30] dark:bg-[#081510]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#064e3b] dark:text-emerald-400">
                ₹148.5 Cr+
              </p>
              <p className="mt-1 text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400">
                Direct Benefit Transferred
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white">
                85,400+
              </p>
              <p className="mt-1 text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400">
                Tribal Scholars Enrolled
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#064e3b] dark:text-emerald-400">
                99.4%
              </p>
              <p className="mt-1 text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400">
                Document Verification Rate
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white">
                142+
              </p>
              <p className="mt-1 text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400">
                Active Verified Schemes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Featured Opportunities Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                VERIFIED OPPORTUNITIES
              </span>
              <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
                Featured National & State Fellowships
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 mt-1 max-w-xl">
                Real-time synchronized opportunities from Ministry of Tribal Affairs, UGC, DST, and state departments.
              </p>
            </div>
            <Link href="/scholarships">
              <Button variant="secondary" className="gap-2">
                <span>View all 142 schemes</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SCHOLARSHIPS.slice(0, 3).map((scholarship) => (
              <ScholarshipCard
                key={scholarship.id}
                scholarship={scholarship}
                onViewDetails={(s) => {
                  setSelectedScholarship(s);
                  setModalOpen(true);
                }}
                onQuickApply={(s) => {
                  setSelectedScholarship(s);
                  setModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section id="how-it-works" className="bg-[#f4f7f4] py-20 dark:bg-[#0c1c16]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              SIMPLE 4-STEP PROCESS
            </span>
            <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
              How Scholar Hub Guides Your Education
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 mt-2">
              From discovering schemes matching your specific tribal community to direct account disbursement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Complete Your Profile",
                desc: "Enter your academic level, community category, and state of domicile in under 2 minutes.",
              },
              {
                step: "02",
                title: "Instant AI Matching",
                desc: "Scholar AI maps criteria across 140+ schemes, highlighting highest awards & deadlines.",
              },
              {
                step: "03",
                title: "Verify DigiLocker Docs",
                desc: "Auto-fetch Aadhaar, Caste and Income certificates with real-time discrepancy detection.",
              },
              {
                step: "04",
                title: "Track DBT Payments",
                desc: "Follow institute approval, district sanction, and PFMS bank deposit with live updates.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative rounded-3xl border border-stone-200/80 bg-white p-6 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]"
              >
                <span className="text-2xl font-black text-[#064e3b]/30 dark:text-emerald-500/40">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: FAQ Accordion */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
              Clear Answers for Scholars
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = faqOpen === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-stone-200/80 bg-white transition-all dark:border-[#193c30] dark:bg-[#0f231c]"
                >
                  <button
                    type="button"
                    onClick={() => setFaqOpen(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight
                      className={`h-5 w-5 text-stone-400 transition-transform ${
                        isOpen ? "rotate-90 text-emerald-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-stone-600 leading-relaxed dark:text-stone-300 border-t border-stone-100 dark:border-[#193c30]">
                      <p className="pt-3">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 6: CTA Pre-Footer */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-[#064e3b] p-8 sm:p-14 text-white shadow-2xl dark:bg-[#092b21]">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold tracking-wider text-amber-300 border border-amber-400/30">
              START TODAY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Ready to claim the fellowship funding you deserve?
            </h2>
            <p className="text-base text-emerald-100/90 leading-relaxed">
              Create your profile in 2 minutes, get instant AI eligibility assessments, and prepare your application with expert guidance.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/auth?mode=register">
                <Button className="bg-white text-[#064e3b] hover:bg-stone-100 rounded-xl px-7 py-3 text-sm font-bold shadow-lg">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-xl px-7 py-3 text-sm font-medium">
                  Explore Student Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-stone-50/70 py-12 dark:border-[#193c30] dark:bg-[#050d0a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Logo size="sm" />

            <div className="flex flex-wrap gap-6 text-xs font-medium text-stone-600 dark:text-stone-400">
              <Link href="/scholarships" className="hover:text-emerald-700">Opportunities</Link>
              <Link href="/eligibility" className="hover:text-emerald-700">Eligibility Checker</Link>
              <Link href="/documents" className="hover:text-emerald-700">Document Locker</Link>
              <Link href="/admin" className="hover:text-emerald-700">Nodal Desk</Link>
            </div>

            <p className="text-xs text-stone-400">
              © 2026 Scholar Hub. Built for Indian scholars.
            </p>
          </div>
        </div>
      </footer>

      {/* Scholarship Detail Modal */}
      <DetailModal
        scholarship={selectedScholarship}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Sarthi AI Chat */}
      <SarthiChatWidget />
    </div>
  );
}
