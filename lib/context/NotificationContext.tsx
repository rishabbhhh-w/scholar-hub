"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface DBNotification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: "deadline" | "verification" | "disbursement" | "info";
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

interface NotificationContextType {
  notifications: DBNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);
        const { data, error: dbError } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (dbError) throw dbError;
        if (data) {
          setNotifications(data as DBNotification[]);
        }
      } else {
        setNotifications([]);
        setCurrentUserId(null);
      }
    } catch (err: any) {
      console.error("Error fetching notifications context:", err);
      setError(err?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const handleUpdate = () => {
      fetchNotifications();
    };

    window.addEventListener("notificationsUpdated", handleUpdate);
    return () => {
      window.removeEventListener("notificationsUpdated", handleUpdate);
    };
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    // Optimistic state update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    try {
      const { error: updateErr } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (updateErr) {
        console.error("Failed to mark notification as read in DB:", updateErr);
      }
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUserId) return;

    // Optimistic state update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      const { error: updateErr } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", currentUserId)
        .eq("is_read", false);

      if (updateErr) {
        console.error("Failed to mark all notifications as read in DB:", updateErr);
      }
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
