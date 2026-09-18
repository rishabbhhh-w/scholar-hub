"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  inverted?: boolean; // For dark backgrounds
  asLink?: boolean;
  href?: string;
}

export function Logo({
  className,
  size = "md",
  showTagline = true,
  inverted = false,
  asLink = true,
  href = "/",
}: LogoProps) {
  const iconSizes = {
    sm: "h-9 w-9",
    md: "h-11 w-11",
    lg: "h-14 w-14",
    xl: "h-18 w-18",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const taglineSizes = {
    sm: "text-[8px] tracking-widest",
    md: "text-[9px] tracking-[0.2em]",
    lg: "text-[11px] tracking-[0.25em]",
    xl: "text-xs tracking-[0.3em]",
  };

  const content = (
    <div className={cn("flex items-center gap-3 group select-none", className)}>
      {/* Official Logo Emblem with White Circular/Rounded Framing */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-white shadow-xs border border-stone-200/80 p-1 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0",
          iconSizes[size]
        )}
      >
        <img
          src="/logo.jpg"
          alt="Scholar Hub Official Logo"
          className="h-full w-full object-contain"
        />
      </div>

      {/* Styled Brand Typography matching official logo colorway */}
      <div className="flex flex-col">
        <div className={cn("font-extrabold tracking-tight leading-none flex items-center gap-1", textSizes[size])}>
          <span className={inverted ? "text-white" : "text-[#11223f] dark:text-white"}>
            Scholar
          </span>
          <span className="text-[#DE972C]">
            Hub
          </span>
        </div>
        {showTagline && (
          <span
            className={cn(
              "font-bold uppercase mt-1 font-mono",
              taglineSizes[size],
              inverted ? "text-stone-300/90" : "text-stone-500 dark:text-stone-400"
            )}
          >
            LEARN • CONNECT • GROW
          </span>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link href={href} className="inline-flex focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
