import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";

export type AuditEntry = {
  actorId?: string | null;
  actorEmail?: string;
  action: string;
  category: "auth" | "roles" | "accounts" | "students" | "grades" | "fees" | "parents" | "announcements";
  targetId?: string | null;
  targetLabel?: string;
  details?: Record<string, unknown>;
};

/** Writes an audit row with the service client. Never throws — logging must not break the action. */
export async function writeAudit(entry: AuditEntry) {
  try {
    const req = getRequest();
    const ip =
      req?.headers.get("cf-connecting-ip") ||
      req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "";
    let actorEmail = entry.actorEmail ?? "";
    if (!actorEmail && entry.actorId) {
      const { data } = await supabaseAdmin.auth.admin.getUserById(entry.actorId);
      actorEmail = data?.user?.email ?? "";
    }
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: entry.actorId ?? null,
      actor_email: actorEmail.slice(0, 320),
      action: entry.action,
      category: entry.category,
      target_id: entry.targetId ?? null,
      target_label: (entry.targetLabel ?? "").slice(0, 200),
      details: (entry.details ?? {}) as Json,
      ip_address: ip.slice(0, 64),
      user_agent: (req?.headers.get("user-agent") ?? "").slice(0, 300),
    });
  } catch (e) {
    console.error("[audit] failed to write", e);
  }
}
