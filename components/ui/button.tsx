import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "saffron" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variants = {
      primary:
        "bg-[#074635] text-white hover:bg-[#053628] shadow-sm hover:shadow-md dark:bg-emerald-600 dark:hover:bg-emerald-500",
      secondary:
        "bg-white text-stone-800 border border-stone-200/80 hover:bg-stone-50 hover:border-stone-300 shadow-sm dark:bg-[#0f231c] dark:text-stone-100 dark:border-[#193c30] dark:hover:bg-[#153228]",
      outline:
        "border border-[#074635] text-[#074635] hover:bg-[#074635]/10 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-500/10",
      ghost:
        "text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-[#153228]",
      saffron:
        "bg-[#d97706] text-white hover:bg-[#b45309] shadow-sm hover:shadow-md",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
    };

    const sizes = {
      sm: "h-9 px-3.5 text-xs rounded-lg gap-1.5",
      md: "h-11 px-5 text-sm rounded-xl gap-2",
      lg: "h-13 px-7 text-base rounded-xl gap-2.5 font-semibold",
      icon: "h-10 w-10 rounded-xl p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
