import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];

/** Record a successful sign-in for the current user. */
export const logSignIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ method: z.enum(["password", "google"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { writeAudit } = await import("./audit.server");
    await writeAudit({
      actorId: context.userId,
      actorEmail: (context.claims["email"] as string | undefined) ?? "",
      action: "sign_in",
      category: "auth",
      details: { method: data.method },
    });
    return { ok: true };
  });

/** Record a failed sign-in attempt (public — caller is not signed in). */
export const logFailedSignIn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ email: z.string().trim().max(320), reason: z.string().max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { writeAudit } = await import("./audit.server");
    await writeAudit({
      actorEmail: data.email.toLowerCase(),
      action: "sign_in_failed",
      category: "auth",
      details: { reason: data.reason },
    });
    return { ok: true };
  });

export const adminListAuditLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ category: z.string().max(40).optional() }).parse(d))
  .handler(async ({ data, context }): Promise<AuditLog[]> => {
    // RLS restricts reads to admins; non-admins get an empty list.
    let q = context.supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(300);
    if (data.category && data.category !== "all") q = q.eq("category", data.category);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows;
  });
