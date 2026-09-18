"use client";

import React, { useState, useEffect } from "react";
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
  Send,
  Plus,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export interface DBNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "deadline" | "verification" | "disbursement" | "info";
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<DBNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Broadcast modal state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastType, setBroadcastType] = useState<"deadline" | "verification" | "disbursement" | "info">("info");
  const [sending, setSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Officers view all system notifications
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setItems(data as DBNotification[]);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", user.id);
      }
    } catch (err) {
      // Handled
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setSending(true);

    try {
      // Fetch all student profile IDs
      const { data: students } = await supabase
        .from("profiles")
        .select("id")
        .neq("role", "admin");

      if (students && students.length > 0) {
        const notificationsToInsert = students.map((s) => ({
          user_id: s.id,
          title: broadcastTitle,
          message: broadcastMessage,
          type: broadcastType,
          is_read: false,
        }));

        const { error } = await supabase.from("notifications").insert(notificationsToInsert);
        if (error) throw error;

        setToastMessage({
          type: "success",
          text: `Notification broadcasted to ${students.length} students!`,
        });

        fetchNotifications();
        setShowBroadcastModal(false);
        setBroadcastTitle("");
        setBroadcastMessage("");
      } else {
        setToastMessage({
          type: "error",
          text: "No registered students found to broadcast notification.",
        });
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setToastMessage({
        type: "error",
        text: errObj.message || "Failed to broadcast notification.",
      });
    } finally {
      setSending(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !item.is_read;
    return item.type === activeTab;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-200"
          }`}
        >
          <span className="text-sm font-semibold">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2.5">
            <Bell className="h-7 w-7 text-[#064e3b] dark:text-emerald-400" />
            Notifications Manager
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Manage system alert feeds and broadcast updates to student applicants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowBroadcastModal(true)}
            className="bg-[#064e3b] text-white hover:bg-[#04382a] text-xs font-semibold rounded-xl dark:bg-emerald-600 dark:hover:bg-emerald-700 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Broadcast Alert</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={markAllRead}
            className="text-xs gap-1.5 rounded-xl"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Mark all read</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All Notifications" },
          { key: "unread", label: "Unread" },
          { key: "deadline", label: "Deadlines" },
          { key: "verification", label: "Verifications" },
          { key: "disbursement", label: "Disbursements" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-[#064e3b] text-white shadow-xs dark:bg-emerald-600"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-[#132820] dark:text-stone-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-[#193c30] dark:bg-[#0f231c] space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center dark:border-[#193c30] dark:bg-[#0f231c]">
              <Bell className="h-10 w-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-700 dark:text-stone-200">
                No notifications found in this feed
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-stone-200/90 bg-white p-4 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                      item.type === "deadline"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
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
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="mt-1.5 block text-[10px] text-stone-400">
                      {new Date(item.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Broadcast Alert Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0f231c] border border-stone-200 dark:border-[#193c30] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-[#193c30] pb-3">
              <h3 className="text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                <Send className="h-4 w-4 text-[#064e3b] dark:text-emerald-400" />
                Broadcast Alert to All Students
              </h3>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-[#153228]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">
                  Notification Title
                </label>
                <Input
                  placeholder="e.g. NSP Pre-Matric Application Deadline Extended"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="text-xs bg-stone-50 dark:bg-[#081510] border-stone-200 dark:border-[#193c30]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">
                  Alert Message Content
                </label>
                <textarea
                  rows={3}
                  placeholder="Write clear advisory text for student notifications..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-900 dark:bg-[#081510] dark:border-[#193c30] dark:text-stone-100"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">
                  Category Type
                </label>
                <select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value as DBNotification["type"])}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 dark:bg-[#081510] dark:border-[#193c30] dark:text-stone-100"
                >
                  <option value="info">General Advisory (info)</option>
                  <option value="deadline">Deadline Alert (deadline)</option>
                  <option value="verification">Verification Update (verification)</option>
                  <option value="disbursement">Disbursement Advisory (disbursement)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBroadcastModal(false)}
                  disabled={sending}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={sending}
                  className="bg-[#064e3b] hover:bg-[#04382a] text-white text-xs font-semibold rounded-xl dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  {sending ? "Broadcasting..." : "Broadcast Alert"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
