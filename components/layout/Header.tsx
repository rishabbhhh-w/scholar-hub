"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { NOTIFICATIONS } from "@/lib/data/notifications";
import { Badge } from "@/components/ui/badge";

import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { Skeleton } from "@/components/ui/skeleton";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({
  onOpenMobileSidebar,
  title = "Dashboard",
  subtitle,
}: HeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profile = useUserProfile();
  const unreadCount = NOTIFICATIONS.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-stone-200/80 bg-[#fcfbf9]/95 px-4 backdrop-blur-sm sm:px-8 dark:border-[#193c30] dark:bg-[#07130e]/95">
      {/* Left: Mobile Toggle & Page Breadcrumb/Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-xl p-2 text-stone-600 hover:bg-stone-100 lg:hidden dark:text-stone-300 dark:hover:bg-[#132820]"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center Search bar */}
      <div className="hidden md:flex max-w-md flex-1 items-center px-6">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 140+ national and state scholarships..."
            className="h-10 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#064e3b] focus:outline-none focus:ring-1 focus:ring-[#064e3b] dark:border-[#193c30] dark:bg-[#0f231c] dark:text-stone-100 dark:placeholder:text-stone-500"
          />
        </div>
      </div>

      {/* Right: Actions (DBT badge, Theme Toggle, Notification Bell, User Avatar) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* DBT Verified Badge */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>DBT Active (SBI **9412)</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-[#132820] dark:hover:text-stone-100 transition-colors"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-stone-600" />
          )}
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-[#132820] dark:hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#07130e]" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-stone-200 bg-white p-4 shadow-2xl z-50 dark:border-[#193c30] dark:bg-[#0c1c16]">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-[#193c30]">
                <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                  Notifications ({unreadCount} new)
                </h4>
                <Link
                  href="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  View all
                </Link>
              </div>
              <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto dark:divide-[#193c30]">
                {NOTIFICATIONS.slice(0, 3).map((n) => (
                  <div key={n.id} className="py-3">
                    <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-stone-500 line-clamp-2 dark:text-stone-400">
                      {n.description}
                    </p>
                    <span className="mt-1 block text-[10px] text-stone-400">
                      {n.timeAgo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Real Supabase Profile Avatar */}
        {profile.loading ? (
          <Skeleton className="h-10 w-10 rounded-full" />
        ) : (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 pl-2"
            title={profile.fullName || "User Profile"}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dcfce7] text-xs font-bold text-[#166534] ring-2 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300">
              {profile.initials || "SH"}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
