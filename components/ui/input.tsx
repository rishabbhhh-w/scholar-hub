import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 flex items-center text-stone-400 dark:text-stone-500">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 transition-colors placeholder:text-stone-400 focus:border-[#074635] focus:outline-none focus:ring-2 focus:ring-[#074635]/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#193c30] dark:bg-[#0f231c] dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20",
              leftIcon && "pl-11",
              rightIcon && "pr-11",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-stone-400 dark:text-stone-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-stone-500 dark:text-stone-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
