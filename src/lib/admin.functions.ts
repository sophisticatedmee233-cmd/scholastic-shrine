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

async function hasRole(context: Ctx, role: string) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: role });
  return Boolean(data);
}

/** Only the dean records results. Returns the service client for the write after the role check. */
async function assertDean(context: Ctx) {
  if (!(await hasRole(context, "dean"))) throw new Error("Forbidden: only the dean can record results");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function audit(context: Ctx, e: Omit<import("./audit.server").AuditEntry, "actorId">) {
  const { writeAudit } = await import("./audit.server");
  await writeAudit({ actorId: context.userId, ...e });
}

/** Whether the signed-in user is an admin and/or a linked parent. */
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ isAdmin: boolean; isDean: boolean; isTeacher: boolean; childCount: number }> => {
    const [role, dean, teacher, links] = await Promise.all([
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "dean" }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "teacher" }),
      context.supabase.from("parent_students").select("id").eq("parent_id", context.userId),
    ]);
    return { isAdmin: Boolean(role.data), isDean: Boolean(dean.data), isTeacher: Boolean(teacher.data), childCount: links.data?.length ?? 0 };
  });

/* ---------------- Students ---------------- */

export const adminListStudents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Profile[]> => {
    let db = context.supabase;
    if (!(await hasRole(context, "admin"))) db = await assertDean(context);
    const { data, error } = await db.from("profiles").select("*").order("full_name");
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
    await audit(context, { action: "student_created", category: "students", targetId: id, targetLabel: data.full_name, details: { email: data.email, class_name: data.class_name } });
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
    await audit(context, { action: "student_updated", category: "students", targetId: data.id, targetLabel: data.full_name, details: { class_name: data.class_name, stream: data.stream } });
    return { ok: true };
  });

/* ---------------- Grades ---------------- */

export const adminListGrades = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { studentId: string }) => d)
  .handler(async ({ data, context }) => {
    const db = await assertDean(context);
    const { data: rows, error } = await db
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
    const db = await assertDean(context);
    const { error } = await db.from("grades").insert(data);
    if (error) throw error;
    await audit(context, { action: "grade_recorded", category: "grades", targetId: data.student_id, details: { subject: data.subject, term: data.term, year: data.year, score: data.score, grade: data.grade } });
    return { ok: true };
  });

export const adminDeleteGrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const db = await assertDean(context);
    const { data: old } = await db.from("grades").select("*").eq("id", data.id).maybeSingle();
    const { error } = await db.from("grades").delete().eq("id", data.id);
    if (error) throw error;
    await audit(context, { action: "grade_deleted", category: "grades", targetId: old?.student_id ?? null, details: old ? { subject: old.subject, term: old.term, year: old.year, score: old.score } : { id: data.id } });
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
    await audit(context, { action: "invoice_added", category: "fees", targetId: data.student_id, details: { description: data.description, amount: data.amount } });
    return { ok: true };
  });

export const adminAddPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { student_id: string; amount: number; method: string; reference: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("fee_payments").insert(data);
    if (error) throw error;
    await audit(context, { action: "payment_recorded", category: "fees", targetId: data.student_id, details: { amount: data.amount, method: data.method, reference: data.reference } });
    return { ok: true };
  });

export const adminDeleteFeeRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; kind: "invoice" | "payment" }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const table = data.kind === "invoice" ? "fee_invoices" : "fee_payments";
    const { data: old } = await context.supabase.from(table).select("student_id, amount").eq("id", data.id).maybeSingle();
    const { error } = await context.supabase.from(table).delete().eq("id", data.id);
    if (error) throw error;
    await audit(context, { action: `${data.kind}_deleted`, category: "fees", targetId: old?.student_id ?? null, details: { amount: old?.amount ?? null } });
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
    await audit(context, { action: existing ? "parent_linked" : "parent_created", category: "parents", targetId: parentId, targetLabel: data.email, details: { student_id: data.student_id, relationship: data.relationship } });
    return { ok: true, reused: Boolean(existing) };
  });

export const adminDeleteParentLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: old } = await context.supabase.from("parent_students").select("*").eq("id", data.id).maybeSingle();
    const { error } = await context.supabase.from("parent_students").delete().eq("id", data.id);
    if (error) throw error;
    await audit(context, { action: "parent_unlinked", category: "parents", targetId: old?.parent_id ?? null, targetLabel: old?.parent_email ?? "", details: { student_id: old?.student_id ?? null } });
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
    await audit(context, { action: "password_reset", category: "accounts", targetId: data.userId });
    return { ok: true };
  });

/** Grant or revoke a role on an account. */
export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: "admin" | "dean" | "teacher" | "student" | "parent"; grant: boolean }) => d)
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
    await audit(context, { action: data.grant ? "role_granted" : "role_revoked", category: "roles", targetId: data.userId, details: { role: data.role } });
    return { ok: true };
  });
