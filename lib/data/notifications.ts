export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  category: "deadline" | "verification" | "disbursement" | "ai_recommendation";
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  priority: "high" | "normal" | "low";
}

// All mock notification objects removed completely. Notifications are fetched from Supabase.
export const NOTIFICATIONS: NotificationItem[] = [];
