import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Grade = Database["public"]["Tables"]["grades"]["Row"];
export type TimetableEntry = Database["public"]["Tables"]["timetable_entries"]["Row"];
export type FeeInvoice = Database["public"]["Tables"]["fee_invoices"]["Row"];
export type FeePayment = Database["public"]["Tables"]["fee_payments"]["Row"];
export type ParentLink = Database["public"]["Tables"]["parent_students"]["Row"];

export type Child = { link: ParentLink; profile: Profile | null };

/** Children linked to the signed-in parent. */
export const getMyChildren = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Child[]> => {
    const { data: links, error } = await context.supabase
      .from("parent_students")
      .select("*")
      .eq("parent_id", context.userId);
    if (error) throw error;
    if (!links.length) return [];
    const { data: profiles } = await context.supabase
      .from("profiles")
      .select("*")
      .in("id", links.map((l) => l.student_id));
    return links.map((link) => ({
      link,
      profile: profiles?.find((p) => p.id === link.student_id) ?? null,
    }));
  });

/** Guardians linked to the signed-in student. */
export const getMyGuardians = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ParentLink[]> => {
    const { data, error } = await context.supabase
      .from("parent_students")
      .select("*")
      .eq("student_id", context.userId);
    if (error) throw error;
    return data;
  });

export const getChildRecords = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { studentId: string }) => d)
  .handler(async ({ data, context }): Promise<{
    profile: Profile | null;
    grades: Grade[];
    timetable: TimetableEntry[];
    invoices: FeeInvoice[];
    payments: FeePayment[];
  }> => {
    const { data: allowed, error: checkErr } = await context.supabase.rpc("is_parent_of", {
      _parent_id: context.userId,
      _student_id: data.studentId,
    });
    if (checkErr) throw checkErr;
    if (!allowed) throw new Error("Forbidden: not linked to this learner");

    const [profile, grades, invoices, payments] = await Promise.all([
      context.supabase.from("profiles").select("*").eq("id", data.studentId).maybeSingle(),
      context.supabase
        .from("grades")
        .select("*")
        .eq("student_id", data.studentId)
        .order("year", { ascending: false })
        .order("term", { ascending: false })
        .order("subject"),
      context.supabase.from("fee_invoices").select("*").eq("student_id", data.studentId).order("due_date"),
      context.supabase
        .from("fee_payments")
        .select("*")
        .eq("student_id", data.studentId)
        .order("paid_at", { ascending: false }),
    ]);

    const { data: timetable } = await context.supabase
      .from("timetable_entries")
      .select("*")
      .eq("class_name", profile.data?.class_name ?? "Grade 10")
      .order("day_of_week")
      .order("start_time");

    return {
      profile: profile.data ?? null,
      grades: grades.data ?? [],
      timetable: timetable ?? [],
      invoices: invoices.data ?? [],
      payments: payments.data ?? [],
    };
  });
