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

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Deadline Approaching: National Fellowship for ST Students",
    description: "Only 11 days remaining to complete your final review and submission. Scheme closes on 28 Sep 2026.",
    timeAgo: "2 hours ago",
    category: "deadline",
    isRead: false,
    priority: "high",
    actionUrl: "/scholarships",
    actionLabel: "View Scheme",
  },
  {
    id: "notif-2",
    title: "Action Required: Update Income Certificate",
    description: "Nodal officer flagged your income certificate for Post-Matric ST scheme. Re-upload before 25 Sep.",
    timeAgo: "5 hours ago",
    category: "verification",
    isRead: false,
    priority: "high",
    actionUrl: "/documents",
    actionLabel: "Re-upload Now",
  },
  {
    id: "notif-3",
    title: "New 96% Match Found by Sarthi AI",
    description: "A new fellowship cycle opened for Tribal Scholars in Higher Education. You meet all 5 criteria.",
    timeAgo: "1 day ago",
    category: "ai_recommendation",
    isRead: false,
    priority: "normal",
    actionUrl: "/recommendations",
    actionLabel: "Check Match Breakdown",
  },
  {
    id: "notif-4",
    title: "Institute Level Verification Completed",
    description: "Central University of Jharkhand endorsed your NFST-2026 application dossier. Forwarded to State Directorate.",
    timeAgo: "2 days ago",
    category: "verification",
    isRead: true,
    priority: "normal",
    actionUrl: "/applications",
    actionLabel: "Track Progress",
  },
  {
    id: "notif-5",
    title: "DBT Disbursement Confirmed: ₹2,50,000",
    description: "Top Class Scheme grant successfully settled via PFMS to SBI A/c ending in **9412 (UTR: SBIN26012089412).",
    timeAgo: "3 weeks ago",
    category: "disbursement",
    isRead: true,
    priority: "normal",
    actionUrl: "/applications",
    actionLabel: "View Sanction Receipt",
  }
];
