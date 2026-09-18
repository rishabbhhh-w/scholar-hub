"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Search,
  Sparkles,
  CheckSquare,
  FileText,
  Clock,
  Bell,
  Bot,
  ShieldCheck,
  LogOut,
  FileCheck,
  Award,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const profile = useUserProfile();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const isOfficerOrAdmin = profile.role === "admin" || profile.role === "nodal_officer";

  const studentNavItems = [
    {
      label: "Student Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Scholarship Discovery",
      href: "/scholarships",
      icon: Search,
    },
    {
      label: "AI Recommendations",
      href: "/recommendations",
      icon: Sparkles,
      badge: "96%",
      badgeColor: "mint",
    },
    {
      label: "Eligibility Checker",
      href: "/eligibility",
      icon: CheckSquare,
    },
    {
      label: "My Documents",
      href: "/documents",
      icon: FileText,
      badge: "Vault",
      badgeColor: "amber",
    },
    {
      label: "Applications & Tracking",
      href: "/applications",
      icon: Clock,
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: profile.unreadCount > 0 ? `${profile.unreadCount} unread` : undefined,
      badgeColor: "rose",
    },
    {
      label: "Scholar AI",
      href: "/assistant",
      icon: Bot,
    },
  ];

  const adminNavItems = [
    {
      label: "Admin Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Applications Review",
      href: "/admin/applications",
      icon: FileCheck,
      badge: "Review",
      badgeColor: "amber",
    },
    {
      label: "Manage Scholarships",
      href: "/scholarships",
      icon: Award,
    },
    {
      label: "All Students",
      href: "/admin/students",
      icon: Users,
    },
    {
      label: "Notifications Manager",
      href: "/admin/notifications",
      icon: Bell,
      badge: profile.unreadCount > 0 ? `${profile.unreadCount} unread` : undefined,
      badgeColor: "rose",
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="flex h-full w-72 flex-col border-r border-stone-200/80 bg-[#fcfbf9] dark:border-[#193c30] dark:bg-[#081510] select-none">
      {/* Brand Header with Official Logo */}
      <div className="flex h-20 items-center px-6 border-b border-stone-200/60 dark:border-[#193c30]">
        <Logo size="sm" />
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {!isOfficerOrAdmin ? (
          /* STUDENT SPACE (ONLY FOR STUDENTS) */
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Student Space
            </p>
            <div className="mt-2 space-y-1">
              {studentNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-[#064e3b] text-white shadow-sm dark:bg-emerald-600"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-[#0f231c] dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive
                            ? "text-white"
                            : "text-stone-400 group-hover:text-stone-700 dark:text-stone-400 dark:group-hover:text-stone-200"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          isActive
                            ? "bg-white/20 text-white"
                            : item.badgeColor === "amber"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : item.badgeColor === "rose"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          /* ADMINISTRATION SECTION (ONLY FOR ADMINS / NODAL OFFICERS) */
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Administration
            </p>
            <div className="mt-2 space-y-1">
              {adminNavItems.map((item) => {
                const isActive = item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-[#064e3b] text-white shadow-sm dark:bg-emerald-600"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-[#0f231c] dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          isActive
                            ? "bg-white/20 text-white"
                            : item.badgeColor === "amber"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* User Profile Card at Bottom - Real Supabase User Profile */}
      <div className="border-t border-stone-200/80 p-4 dark:border-[#193c30]">
        <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-soft border border-stone-200/70 dark:bg-[#0f231c] dark:border-[#193c30]">
          {profile.loading ? (
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] font-bold text-xs text-[#166534] dark:bg-emerald-950 dark:text-emerald-300">
                {profile.initials || "SH"}
              </div>
              <div className="truncate">
                <p className="truncate text-xs font-bold text-stone-900 dark:text-stone-100">
                  {profile.fullName || "Scholar User"}
                </p>
                <p className="truncate text-[11px] text-stone-500 dark:text-stone-400">
                  {profile.role === "admin" || profile.role === "nodal_officer"
                    ? "Nodal Officer"
                    : `${profile.category} Candidate · ${profile.state}`}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-[#153228] dark:hover:text-stone-200 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
