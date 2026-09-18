"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface UserProfileData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  category: string;
  state: string;
  institution: string;
  initials: string;
  unreadCount: number;
  loading: boolean;
}

export function getInitials(name: string): string {
  if (!name || !name.trim()) return "SH";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export function useUserProfile(): UserProfileData {
  const [profile, setProfile] = useState<UserProfileData>({
    id: "",
    email: "",
    fullName: "",
    role: "student",
    category: "ST",
    state: "Jharkhand",
    institution: "Central University of Jharkhand",
    initials: "",
    unreadCount: 0,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function fetchProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && isMounted) {
          let fullName = "";
          let role = "student";
          let category = "ST";
          let state = "Jharkhand";
          let institution = "Central University of Jharkhand";

          // Fetch from Supabase profiles table
          const { data: dbProfile } = await supabase
            .from("profiles")
            .select("full_name, role, category, state, institution")
            .eq("id", user.id)
            .single();

          if (dbProfile?.full_name) {
            fullName = dbProfile.full_name;
          } else if (user.user_metadata?.full_name) {
            fullName = user.user_metadata.full_name;
          } else if (user.email) {
            fullName = user.email.split("@")[0];
          }

          if (dbProfile?.role) {
            role = dbProfile.role;
          } else if (user.user_metadata?.role) {
            role = user.user_metadata.role;
          } else if (user.app_metadata?.role) {
            role = user.app_metadata.role;
          }

          if (dbProfile?.category) category = dbProfile.category;
          if (dbProfile?.state) state = dbProfile.state;
          if (dbProfile?.institution) institution = dbProfile.institution;

          // Unread notifications count
          const { count } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("is_read", false);

          setProfile({
            id: user.id,
            email: user.email || "",
            fullName,
            role,
            category,
            state,
            institution,
            initials: getInitials(fullName),
            unreadCount: count || 0,
            loading: false,
          });
        } else if (isMounted) {
          setProfile((prev) => ({ ...prev, loading: false }));
        }
      } catch (err) {
        if (isMounted) {
          setProfile((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return profile;
}
