"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  IndianRupee,
  ShieldCheck,
  Check,
  Info,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useNotifications, DBNotification } from "@/lib/context/NotificationContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const {
    notifications: items,
    loading,
    error: fetchError,
    fetchNotifications,
    markAsRead: markSingleRead,
    markAllAsRead: markAllRead,
  } = useNotifications();

  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !item.is_read;
    return item.type === activeTab;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white">
            Notifications Center
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Real-time deadline warnings, nodal officer remarks, and direct benefit disbursement advisories.
          </p>
        </div>

        {items.some((i) => !i.is_read) && (
          <Button
            variant="secondary"
            size="sm"
            onClick={markAllRead}
            className="text-xs gap-1.5"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {/* Error state */}
      {fetchError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 flex items-center justify-between dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-1 rounded-lg bg-rose-200 px-3 py-1 font-semibold text-rose-900 hover:bg-rose-300 dark:bg-rose-900 dark:text-rose-100"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All Alerts" },
          { key: "unread", label: "Unread" },
          { key: "deadline", label: "Deadlines" },
          { key: "verification", label: "Verifications" },
          { key: "disbursement", label: "Disbursements" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-[#064e3b] text-white shadow-xs dark:bg-emerald-600"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-[#132820] dark:text-stone-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-stone-200 bg-white p-5 dark:border-[#193c30] dark:bg-[#0f231c] space-y-2"
            >
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.length === 0 ? (
            /* Empty State */
            <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center dark:border-[#193c30] dark:bg-[#0f231c]">
              <Bell className="h-10 w-10 text-stone-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
                No notifications yet
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                When you submit scholarship applications or receive updates from nodal officers, your notifications will appear here.
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center text-xs text-stone-500 dark:border-[#193c30] dark:bg-[#0f231c]">
              No notifications in this filter category.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isUnread = !item.is_read;

              return (
                <div
                  key={item.id}
                  onClick={() => isUnread && markSingleRead(item.id)}
                  className={`flex flex-col sm:flex-row items-start justify-between gap-4 rounded-3xl border p-5 transition-all bg-white shadow-soft cursor-pointer dark:bg-[#0f231c] ${
                    isUnread
                      ? "border-emerald-300/80 bg-emerald-50/20 dark:border-emerald-900/60 dark:bg-emerald-950/20"
                      : "border-stone-200/90 dark:border-[#193c30]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        item.type === "deadline"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : item.type === "disbursement"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : item.type === "verification"
                          ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                          : "bg-stone-100 text-stone-700 dark:bg-[#132820] dark:text-stone-300"
                      }`}
                    >
                      {item.type === "deadline" ? (
                        <Calendar className="h-5 w-5" />
                      ) : item.type === "disbursement" ? (
                        <IndianRupee className="h-5 w-5" />
                      ) : item.type === "verification" ? (
                        <ShieldCheck className="h-5 w-5" />
                      ) : (
                        <Info className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                          {item.title || "Notification"}
                        </h4>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-emerald-600" />
                        )}
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                      <span className="mt-2 block text-[10px] text-stone-400">
                        {new Date(item.created_at).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {item.action_url && (
                      <Link href={item.action_url}>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isUnread) markSingleRead(item.id);
                          }}
                          className="bg-[#064e3b] text-white text-xs dark:bg-emerald-600"
                        >
                          <span>View Details</span>
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                    {isUnread && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markSingleRead(item.id);
                        }}
                        className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-white text-xs font-semibold flex items-center gap-1"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                        <span className="text-[11px]">Mark read</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
