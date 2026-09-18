import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "mint" | "saffron" | "outline" | "subtle" | "success" | "warning" | "danger" | "neutral";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "mint",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const baseStyles = "inline-flex items-center font-medium transition-colors";

  const variants = {
    mint: "bg-[#eaf5ea] text-[#064e3b] border border-[#d2ebd2] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60",
    saffron: "bg-amber-100/80 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60",
    outline: "border border-stone-200 text-stone-700 dark:border-emerald-900/50 dark:text-stone-300",
    subtle: "bg-stone-100 text-stone-700 dark:bg-[#132820] dark:text-stone-300",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    warning: "bg-amber-50 text-amber-900 border border-amber-300/80 dark:bg-amber-950/60 dark:text-amber-300",
    danger: "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
    neutral: "bg-stone-100 text-stone-600 dark:bg-[#152e24] dark:text-stone-300",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-xs rounded-full gap-1",
    md: "px-3 py-1 text-xs rounded-full gap-1.5",
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
