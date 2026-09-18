"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fcfbf9] p-6 text-center dark:bg-[#07130e]">
      <div className="max-w-md space-y-6 rounded-3xl border border-stone-200 bg-white p-8 shadow-xl dark:border-[#193c30] dark:bg-[#0f231c]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-stone-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            {error.message || "An unexpected system error occurred while processing your request."}
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={reset}
            className="text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>

          <Link href="/dashboard">
            <Button size="sm" className="bg-[#064e3b] text-white text-xs gap-1.5 dark:bg-emerald-600">
              <Home className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
