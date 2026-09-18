"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GraduationCap, Menu, X, Sun, Moon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Logo } from "@/components/shared/Logo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/60 bg-[#fcfbf9]/90 backdrop-blur-md transition-colors dark:border-[#193c30] dark:bg-[#07130e]/90">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Official Brand Logo */}
        <Logo size="md" />

        {/* Center Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-stone-600 dark:text-stone-300">
          <Link
            href="/scholarships"
            className="transition-colors hover:text-[#064e3b] dark:hover:text-emerald-400"
          >
            Opportunities
          </Link>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-[#064e3b] dark:hover:text-emerald-400"
          >
            How it works
          </a>
          <a
            href="#impact"
            className="transition-colors hover:text-[#064e3b] dark:hover:text-emerald-400"
          >
            Impact
          </a>
          <Link
            href="/assistant"
            className="flex items-center gap-1.5 transition-colors hover:text-[#064e3b] dark:hover:text-emerald-400"
          >
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Scholar AI</span>
          </Link>
        </nav>

        {/* Right CTA Actions - Replicating Image 1 */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-[#132820] dark:hover:text-stone-200 transition-colors"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-stone-600" />
            )}
          </button>

          <Link href="/auth?mode=login">
            <span className="text-[15px] font-medium text-stone-700 hover:text-[#064e3b] transition-colors dark:text-stone-200 dark:hover:text-emerald-400 px-3 py-2">
              Sign in
            </span>
          </Link>

          <Link href="/auth?mode=register">
            <Button
              className="bg-[#064e3b] hover:bg-[#053d2e] text-white rounded-xl px-5 h-11 text-sm font-medium shadow-sm transition-all dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              Create account
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 text-stone-600 dark:text-stone-300"
          >
            {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-700 dark:text-stone-200"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-stone-200 bg-[#fcfbf9] px-4 pt-2 pb-6 md:hidden dark:border-[#193c30] dark:bg-[#07130e]">
          <div className="flex flex-col space-y-3 pt-2">
            <Link
              href="/scholarships"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-stone-700 dark:text-stone-200"
            >
              Opportunities
            </Link>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-stone-700 dark:text-stone-200"
            >
              How it works
            </a>
            <a
              href="#impact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-stone-700 dark:text-stone-200"
            >
              Impact
            </a>
            <Link
              href="/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" /> Scholar AI Assistant
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-stone-200 dark:border-[#193c30]">
              <Link href="/auth?mode=login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full justify-center">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth?mode=register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center bg-[#064e3b]">
                  Create account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
