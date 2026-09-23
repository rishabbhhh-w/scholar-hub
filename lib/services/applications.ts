import { SupabaseClient } from "@supabase/supabase-js";

export interface ApplyResult {
  success: boolean;
  alreadyApplied?: boolean;
  error?: string;
}

/**
 * Checks for duplicate application, creates entry in `applications` table,
 * and creates corresponding audit notification in `notifications` table.
 */
export async function applyToScholarship(
  supabase: SupabaseClient,
  userId: string,
  scholarshipId: string,
  scholarshipTitle: string
): Promise<ApplyResult> {
  if (!userId || !scholarshipId) {
    return { success: false, error: "Missing user ID or scholarship ID" };
  }

  try {
    // 1. Check if user already applied
    const { data: existingApp, error: checkError } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", userId)
      .eq("scholarship_id", scholarshipId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing application:", checkError);
    }

    if (existingApp) {
      return { success: true, alreadyApplied: true };
    }

    // 2. Insert new application (trigger auto-generates tracking_number)
    const { error: insertError } = await supabase.from("applications").insert({
      user_id: userId,
      scholarship_id: scholarshipId,
      status: "pending",
      submitted_at: new Date().toISOString(),
    });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // 3. Create notification for the student
    const notifMessage = `Your application for ${scholarshipTitle} has been submitted successfully and is under review.`;
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Application Submitted",
      message: notifMessage,
      type: "info",
      action_url: "/applications",
    });

    return { success: true, alreadyApplied: false };
  } catch (err: any) {
    console.error("Exception during applyToScholarship:", err);
    return { success: false, error: err?.message || "Failed to submit application" };
  }
}

/**
 * Fetches the set of scholarship IDs the user has already applied for.
 */
export async function getUserAppliedScholarshipIds(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("applications")
      .select("scholarship_id")
      .eq("user_id", userId);

    if (error || !data) {
      return [];
    }

    return data.map((item) => item.scholarship_id);
  } catch (err) {
    console.error("Failed to fetch applied scholarship IDs:", err);
    return [];
  }
}
