import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Grade = Database["public"]["Tables"]["grades"]["Row"];
export type TimetableEntry = Database["public"]["Tables"]["timetable_entries"]["Row"];
export type FeeInvoice = Database["public"]["Tables"]["fee_invoices"]["Row"];
export type FeePayment = Database["public"]["Tables"]["fee_payments"]["Row"];
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"];

/** Public notices for the website (no sign-in). */
export const getPublicAnnouncements = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase
    .from("announcements")
    .select("id,title,body,category,is_urgent,published_at")
    .eq("is_public", true)
    .order("published_at", { ascending: false })
    .limit(12);
  if (error) throw error;
  return data;
});

/** Returns the signed-in student's profile, creating one on first visit. */
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Profile> => {
    const { supabase, userId, claims } = context;
    const { data: existing, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    if (existing) return existing;

    const meta = (claims as { user_metadata?: Record<string, unknown>; email?: string }) ?? {};
    const fullName =
      (meta.user_metadata?.["full_name"] as string | undefined) ||
      (meta.user_metadata?.["name"] as string | undefined) ||
      (meta.email ? meta.email.split("@")[0] : "Student");
    const admission = `LTS/2026/${String(Math.floor(1000 + Math.random() * 9000))}`;

    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert({ id: userId, full_name: fullName, admission_number: admission })
      .select("*")
      .single();
    if (insertError) throw insertError;
    return created;
  });

export const getMyGrades = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Grade[]> => {
    const { data, error } = await context.supabase
      .from("grades")
      .select("*")
      .eq("student_id", context.userId)
      .order("year", { ascending: false })
      .order("term", { ascending: false })
      .order("subject");
    if (error) throw error;
    return data;
  });

export const getMyTimetable = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TimetableEntry[]> => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("class_name")
      .eq("id", context.userId)
      .maybeSingle();
    const { data, error } = await context.supabase
      .from("timetable_entries")
      .select("*")
      .eq("class_name", profile?.class_name ?? "Grade 10")
      .order("day_of_week")
      .order("start_time");
    if (error) throw error;
    return data;
  });

export const getMyFees = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ invoices: FeeInvoice[]; payments: FeePayment[] }> => {
    const [inv, pay] = await Promise.all([
      context.supabase.from("fee_invoices").select("*").eq("student_id", context.userId).order("due_date"),
      context.supabase
        .from("fee_payments")
        .select("*")
        .eq("student_id", context.userId)
        .order("paid_at", { ascending: false }),
    ]);
    if (inv.error) throw inv.error;
    if (pay.error) throw pay.error;
    return { invoices: inv.data, payments: pay.data };
  });

export const getAnnouncements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Announcement[]> => {
    const { data, error } = await context.supabase
      .from("announcements")
      .select("*")
      .order("is_urgent", { ascending: false })
      .order("published_at", { ascending: false });
    if (error) throw error;
    return data;
  });
