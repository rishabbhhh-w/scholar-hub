"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  User,
  Sliders,
  ShieldCheck,
  Save,
  CheckCircle,
  AlertCircle,
  Key,
  Mail,
  Bell,
  Eye,
  Clock,
  Calendar,
  Lock,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "platform" | "security">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Tab 1 State: Profile
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Tab 2 State: Platform Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showStudentCount, setShowStudentCount] = useState(true);
  const [deadlineReminderDays, setDeadlineReminderDays] = useState("3");

  // Tab 3 State: Security Metadata
  const [lastSignInAt, setLastSignInAt] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchProfileAndUser = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
          setEmail(user.email || "");
          setNewEmail(user.email || "");
          setLastSignInAt(user.last_sign_in_at || null);
          setCreatedAt(user.created_at || null);

          // Query profiles
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (profile) {
            setFullName(profile.full_name || "");
            if (profile.settings) {
              const s = profile.settings as Record<string, unknown>;
              if (typeof s.email_notifications === "boolean") setEmailNotifications(s.email_notifications);
              if (typeof s.show_student_count === "boolean") setShowStudentCount(s.show_student_count);
              if (typeof s.deadline_reminder_days === "string") setDeadlineReminderDays(s.deadline_reminder_days);
            }
          }
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndUser();
  }, []);

  // Save Tab 1 — Profile Settings
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setToastMessage(null);

    try {
      // 1. Update Full Name & Email in profiles table
      const { error: profErr } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          email: newEmail,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profErr) throw profErr;

      // 2. If new email provided and changed, update auth email
      if (newEmail && newEmail !== email) {
        const { error: authEmailErr } = await supabase.auth.updateUser({ email: newEmail });
        if (authEmailErr) throw authEmailErr;
        setEmail(newEmail);
      }

      // 3. If password change requested
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("New password and confirmation do not match.");
        }
        if (newPassword.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }

        const { error: authPassErr } = await supabase.auth.updateUser({ password: newPassword });
        if (authPassErr) throw authPassErr;

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      setToastMessage({
        type: "success",
        text: "Profile settings updated successfully!",
      });
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setToastMessage({
        type: "error",
        text: errObj.message || "Failed to update profile settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Save Tab 2 — Platform Settings
  const handleSavePlatform = async () => {
    if (!userId) return;
    setSaving(true);
    setToastMessage(null);

    const newSettings = {
      email_notifications: emailNotifications,
      show_student_count: showStudentCount,
      deadline_reminder_days: deadlineReminderDays,
    };

    try {
      // Attempt to save to profiles settings jsonb column or fallback gracefully
      const { error } = await supabase
        .from("profiles")
        .update({
          settings: newSettings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        // If settings column doesn't exist yet, save locally
        localStorage.setItem("scholar_platform_settings", JSON.stringify(newSettings));
      }

      setToastMessage({
        type: "success",
        text: "Platform preferences saved successfully!",
      });
    } catch (err) {
      localStorage.setItem("scholar_platform_settings", JSON.stringify(newSettings));
      setToastMessage({
        type: "success",
        text: "Platform preferences saved to local preferences.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2.5">
          <Settings className="h-7 w-7 text-[#064e3b] dark:text-emerald-400" />
          Admin Settings & Preferences
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Manage your nodal officer account credentials, platform configurations, and security details.
        </p>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-stone-200 dark:border-[#193c30] gap-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === "profile"
              ? "border-[#064e3b] text-[#064e3b] dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
          }`}
        >
          <User className="h-4 w-4" />
          Profile Settings
        </button>

        <button
          onClick={() => setActiveTab("platform")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === "platform"
              ? "border-[#064e3b] text-[#064e3b] dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
          }`}
        >
          <Sliders className="h-4 w-4" />
          Platform Settings
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === "security"
              ? "border-[#064e3b] text-[#064e3b] dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Security & Audit
        </button>
      </div>

      {/* Tab Content Panels */}
      {loading ? (
        <div className="p-8 rounded-3xl border border-stone-200 bg-white dark:border-[#193c30] dark:bg-[#0f231c] space-y-4">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ) : (
        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 dark:border-[#193c30] dark:bg-[#0f231c] shadow-sm">
          {/* TAB 1: Profile Settings */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-white">
                  Profile Information
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Update your display name and registered email address.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 dark:text-stone-300">Full Name</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nodal Officer Name"
                    className="text-xs bg-stone-50 dark:bg-[#081510] border-stone-200 dark:border-[#193c30]"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 dark:text-stone-300">Email Address</label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="admin@scholarhub.in"
                    className="text-xs bg-stone-50 dark:bg-[#081510] border-stone-200 dark:border-[#193c30]"
                    required
                  />
                  <p className="text-[10px] text-stone-400">
                    Updating email will update both your Supabase auth profile and portal contact.
                  </p>
                </div>
              </div>

              {/* Password Section */}
              <div className="border-t border-stone-200 dark:border-[#193c30] pt-6 space-y-4 text-xs">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <Key className="h-4 w-4 text-[#064e3b] dark:text-emerald-400" />
                    Change Password
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Leave blank if you do not want to modify your current password.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-stone-700 dark:text-stone-300">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="text-xs bg-stone-50 dark:bg-[#081510] border-stone-200 dark:border-[#193c30]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-stone-700 dark:text-stone-300">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="text-xs bg-stone-50 dark:bg-[#081510] border-stone-200 dark:border-[#193c30]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#064e3b] hover:bg-[#04382a] text-white text-xs font-semibold rounded-xl dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  {saving ? "Saving Changes..." : "Save Profile Settings"}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: Platform Settings */}
          {activeTab === "platform" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-white">
                  Platform Preferences
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Configure notification behaviors and portal dashboard displays.
                </p>
              </div>

              <div className="space-y-5 text-xs">
                {/* Toggle 1: Email Notifications */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-[#081510] border border-stone-200 dark:border-[#193c30]">
                  <div className="space-y-0.5">
                    <p className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                      <Bell className="h-4 w-4 text-[#064e3b] dark:text-emerald-400" />
                      Email Notifications
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Receive daily digest notifications for newly submitted student applications.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-5 w-5 accent-[#064e3b] rounded cursor-pointer"
                  />
                </div>

                {/* Toggle 2: Show Student Count */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-[#081510] border border-stone-200 dark:border-[#193c30]">
                  <div className="space-y-0.5">
                    <p className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                      <Eye className="h-4 w-4 text-[#064e3b] dark:text-emerald-400" />
                      Show Student Count on Dashboard
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Display live total registered student counter card on the Nodal Officer overview.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showStudentCount}
                    onChange={(e) => setShowStudentCount(e.target.checked)}
                    className="h-5 w-5 accent-[#064e3b] rounded cursor-pointer"
                  />
                </div>

                {/* Application Deadline Reminder Dropdown */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#081510] border border-stone-200 dark:border-[#193c30] space-y-2">
                  <label className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#064e3b] dark:text-emerald-400" />
                    Application Deadline Reminder Window
                  </label>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Send automated alert notifications to pending applicants before scholarship deadlines.
                  </p>
                  <select
                    value={deadlineReminderDays}
                    onChange={(e) => setDeadlineReminderDays(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs text-stone-900 dark:bg-[#0f231c] dark:border-[#193c30] dark:text-stone-100"
                  >
                    <option value="1">1 day before deadline</option>
                    <option value="3">3 days before deadline</option>
                    <option value="7">7 days before deadline</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSavePlatform}
                  disabled={saving}
                  className="bg-[#064e3b] hover:bg-[#04382a] text-white text-xs font-semibold rounded-xl dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  {saving ? "Saving Preferences..." : "Save Platform Preferences"}
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: Security & Audit */}
          {activeTab === "security" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-white">
                  Security & Account Audit
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  View session timestamps and authentication audit logs.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Last Login Time */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-[#081510] border border-stone-200 dark:border-[#193c30]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-[#064e3b] dark:bg-emerald-950 dark:text-emerald-300">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white">Last Login Time</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Timestamp of your last successful session authentication
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-stone-800 dark:text-stone-200 bg-white dark:bg-[#153228] px-3 py-1.5 rounded-xl border border-stone-200 dark:border-[#193c30]">
                    {lastSignInAt
                      ? new Date(lastSignInAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Active Session"}
                  </span>
                </div>

                {/* Account Created Date */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-[#081510] border border-stone-200 dark:border-[#193c30]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-[#064e3b] dark:bg-emerald-950 dark:text-emerald-300">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white">Account Created Date</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Date when this Nodal Officer account was provisioned
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-stone-800 dark:text-stone-200 bg-white dark:bg-[#153228] px-3 py-1.5 rounded-xl border border-stone-200 dark:border-[#193c30]">
                    {createdAt
                      ? new Date(createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Sep 2026"}
                  </span>
                </div>

                {/* Role Badge */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#064e3b] text-white dark:bg-emerald-600">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white">Authorization Role</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        System permissions level granted to this account
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-300/40">
                    Nodal Officer / Admin
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
