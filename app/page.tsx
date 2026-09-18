"use client";

import React, { useState } from "react";
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

export default function LandingPage() {
  const [selectedScholarship, setSelectedScholarship] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const featuredScholarship = SCHOLARSHIPS[0]; // National Fellowship for ST Students

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
      {/* Top Navbar strictly matching Reference Image 1 */}
      <Navbar />

      {/* Hero Section - Exact Replica of Reference Image 1 */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle background ambient mesh */}
        <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl dark:bg-emerald-950/20" />
        <div className="pointer-events-none absolute top-1/2 left-0 h-96 w-96 rounded-full bg-amber-100/30 blur-3xl dark:bg-amber-950/10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Headline, Subtitle, Actions, Badges */}
            <div className="lg:col-span-7 space-y-8">
              {/* Mint Badge - Matching Image 1 */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf5ea] px-3.5 py-1.5 text-xs font-semibold text-[#064e3b] border border-[#d2ebd2] dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60 shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI-powered scholarship guidance</span>
              </div>

              {/* Huge Bold Display Heading - Exact Replica of Image 1 */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-[1.08]">
                Every opportunity.
                <br />
                <span className="text-stone-900 dark:text-stone-100">One clear path</span>
                <br />
                forward.
              </h1>

              {/* Subtitle - Exact Replica of Image 1 */}
              <p className="max-w-xl text-lg sm:text-xl font-normal text-stone-600 dark:text-stone-300 leading-relaxed">
                Discover scholarships made for you, understand eligibility, organise documents, and track every application with confidence.
              </p>

              {/* Dual Action Buttons - Exact Replica of Image 1 */}
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

              {/* Trust Checkmarks - Exact Replica of Image 1 */}
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

            {/* Right Column: Floating Student Overview Card - Exact Replica of Image 1 */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-md rounded-3xl border border-stone-200/90 bg-white p-6 shadow-2xl shadow-stone-200/60 dark:border-[#193c30] dark:bg-[#0c1c16] dark:shadow-black/40">
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                        STUDENT OVERVIEW
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                        Demo Preview
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                      Good afternoon, Scholar
                    </h3>
                  </div>
                  {/* Generic Graduation Cap Avatar */}
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dcfce7] text-[#166534] dark:bg-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-500/20">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                </div>

                {/* 3 Metric Pills - Matching Image 1 */}
                <div className="mt-5 grid grid-cols-3 gap-2.5">
                  <div className="rounded-2xl bg-stone-100/80 p-3 text-center dark:bg-[#132820]">
                    <p className="text-lg font-bold text-stone-900 dark:text-stone-100">24</p>
                    <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Matches</p>
                  </div>
                  <div className="rounded-2xl bg-stone-100/80 p-3 text-center dark:bg-[#132820]">
                    <p className="text-lg font-bold text-stone-900 dark:text-stone-100">9</p>
                    <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Applied</p>
                  </div>
                  <div className="rounded-2xl bg-stone-100/80 p-3 text-center dark:bg-[#132820]">
                    <p className="text-lg font-bold text-stone-900 dark:text-stone-100">82%</p>
                    <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Profile</p>
                  </div>
                </div>

                {/* Featured Scholarship Inner Card - Matching Image 1 */}
                <div
                  onClick={() => {
                    setSelectedScholarship(featuredScholarship);
                    setModalOpen(true);
                  }}
                  className="mt-5 cursor-pointer rounded-2xl border border-stone-200/90 p-4 transition-all hover:border-emerald-600/40 hover:shadow-md dark:border-[#193c30] dark:bg-[#0f231c]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold text-stone-900 dark:text-stone-100">
                        National Fellowship for ST Students
                      </h4>
                      <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                        Ministry of Tribal Affairs
                      </p>
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#064e3b] dark:text-emerald-400">96% match</span>
                    <span className="text-stone-500 dark:text-stone-400 font-normal">Closes 28 Sep</span>
                  </div>

                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-[#193c30]">
                    <div className="h-full rounded-full bg-[#064e3b] dark:bg-emerald-500 w-[96%]" />
                  </div>
                </div>

                {/* Two Mini Action Cards Below - Matching Image 1 */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    href="/documents"
                    className="flex flex-col rounded-2xl border border-stone-200/90 p-3.5 transition-all hover:border-emerald-600/40 hover:bg-stone-50/50 dark:border-[#193c30] dark:bg-[#0f231c] dark:hover:bg-[#132d23]"
                  >
                    <FileText className="h-5 w-5 text-emerald-800 dark:text-emerald-400 mb-1" />
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      8 documents ready
                    </span>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                      2 need attention
                    </span>
                  </Link>

                  <Link
                    href="/assistant"
                    className="flex flex-col rounded-2xl border border-stone-200/90 p-3.5 transition-all hover:border-emerald-600/40 hover:bg-stone-50/50 dark:border-[#193c30] dark:bg-[#0f231c] dark:hover:bg-[#132d23]"
                  >
                    <Bot className="h-5 w-5 text-emerald-800 dark:text-emerald-400 mb-1" />
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Ask Scholar AI
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      Personal guidance
                    </span>
                  </Link>
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
