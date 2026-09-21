import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ParentLink = Database["public"]["Tables"]["parent_students"]["Row"];

type Ctx = { supabase: any; userId: string };

async function assertAdmin(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw error;
  if (!data) throw new Error("Forbidden: admin access required");
}

/** Whether the signed-in user is an admin and/or a linked parent. */
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ isAdmin: boolean; childCount: number }> => {
    const [role, links] = await Promise.all([
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
      context.supabase.from("parent_students").select("id").eq("parent_id", context.userId),
    ]);
    return { isAdmin: Boolean(role.data), childCount: links.data?.length ?? 0 };
  });

/* ---------------- Students ---------------- */

export const adminListStudents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Profile[]> => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("profiles").select("*").order("full_name");
    if (error) throw error;
    return data;
  });

export const adminCreateStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    email: string;
    password: string;
    full_name: string;
    class_name: string;
    stream: string;
    admission_number: string;
  }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (error) throw error;
    const id = created.user!.id;
    const { error: pErr } = await supabaseAdmin.from("profiles").insert({
      id,
      full_name: data.full_name,
      class_name: data.class_name,
      stream: data.stream,
      admission_number: data.admission_number || null,
    });
    if (pErr) throw pErr;
    return { id };
  });

export const adminUpdateStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; full_name: string; class_name: string; stream: string; admission_number: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        class_name: data.class_name,
        stream: data.stream,
        admission_number: data.admission_number || null,
      })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ---------------- Grades ---------------- */

export const adminListGrades = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { studentId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: rows, error } = await context.supabase
      .from("grades")
      .select("*")
      .eq("student_id", data.studentId)
      .order("year", { ascending: false })
      .order("term", { ascending: false })
      .order("subject");
    if (error) throw error;
    return rows;
  });

export const adminSaveGrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    student_id: string;
    subject: string;
    term: number;
    year: number;
    score: number;
    grade: string;
    teacher_comment: string;
  }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("grades").insert(data);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteGrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("grades").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ---------------- Fees ---------------- */

export const adminListFees = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { studentId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const [inv, pay] = await Promise.all([
      context.supabase.from("fee_invoices").select("*").eq("student_id", data.studentId).order("due_date"),
      context.supabase.from("fee_payments").select("*").eq("student_id", data.studentId).order("paid_at", { ascending: false }),
    ]);
    if (inv.error) throw inv.error;
    if (pay.error) throw pay.error;
    return { invoices: inv.data, payments: pay.data };
  });

export const adminAddInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { student_id: string; description: string; amount: number; term: number; year: number; due_date: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("fee_invoices").insert(data);
    if (error) throw error;
    return { ok: true };
  });

export const adminAddPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { student_id: string; amount: number; method: string; reference: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("fee_payments").insert(data);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteFeeRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; kind: "invoice" | "payment" }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const table = data.kind === "invoice" ? "fee_invoices" : "fee_payments";
    const { error } = await context.supabase.from(table).delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ---------------- Announcements ---------------- */

export const adminSaveAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; title: string; body: string; category: string; is_public: boolean; is_urgent: boolean }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = {
      title: data.title,
      body: data.body,
      category: data.category,
      is_public: data.is_public,
      is_urgent: data.is_urgent,
    };
    const { error } = data.id
      ? await context.supabase.from("announcements").update(payload).eq("id", data.id)
      : await context.supabase.from("announcements").insert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("announcements").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ---------------- Parents ---------------- */

export const adminListParentLinks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ParentLink[]> => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("parent_students")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const adminCreateParent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string; password: string; full_name: string; student_id: string; relationship: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Reuse the account when the parent already exists.
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = list?.users?.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());

    let parentId = existing?.id;
    if (!parentId) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { full_name: data.full_name },
      });
      if (error) throw error;
      parentId = created.user!.id;
    }

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: parentId, role: "parent" }, { onConflict: "user_id,role" });
    if (roleErr) throw roleErr;

    const { error: linkErr } = await supabaseAdmin.from("parent_students").upsert(
      {
        parent_id: parentId,
        student_id: data.student_id,
        relationship: data.relationship,
        parent_name: data.full_name,
        parent_email: data.email,
      },
      { onConflict: "parent_id,student_id" },
    );
    if (linkErr) throw linkErr;
    return { ok: true, reused: Boolean(existing) };
  });

export const adminDeleteParentLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("parent_students").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ---------------- Accounts ---------------- */

export type AccountRow = {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  last_sign_in_at: string | null;
  created_at: string;
};

/** All portal logins with their roles. Passwords are hashed by the auth system and can never be read. */
export const adminListAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccountRow[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) throw error;
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name");
    return (list?.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? "",
      full_name:
        profiles?.find((p) => p.id === u.id)?.full_name ||
        (u.user_metadata?.["full_name"] as string | undefined) ||
        "",
      roles: (roles ?? []).filter((r) => r.user_id === u.id).map((r) => String(r.role)),
      last_sign_in_at: u.last_sign_in_at ?? null,
      created_at: u.created_at,
    }));
  });

/** Set a new password for any account (admins cannot read existing passwords). */
export const adminSetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; password: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.password.length < 6) throw new Error("Password must be at least 6 characters");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: data.password });
    if (error) throw error;
    return { ok: true };
  });

/** Grant or revoke a role on an account. */
export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: "admin" | "teacher" | "student" | "parent"; grant: boolean }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.grant) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw error;
    }
    return { ok: true };
  });
