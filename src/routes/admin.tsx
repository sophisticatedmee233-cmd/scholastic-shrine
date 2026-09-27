import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess } from "@/lib/admin.functions";
import { logFailedSignIn, logSignIn } from "@/lib/audit.functions";
import { Crest } from "@/components/site/Crest";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administrator Sign In — Daniel's Primary School" },
      { name: "description", content: "Staff and administrator sign-in for the Daniel's Primary School management dashboard." },
      { property: "og:title", content: "Administrator Sign In — Daniel's Primary School" },
      { property: "og:description", content: "Secure sign-in for school administrators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        logFailedSignIn({ data: { email, reason: `Admin sign-in: ${error.message}` } }).catch(() => {});
        throw error;
      }
      const access = await getMyAccess();
      if (!access?.isAdmin) {
        logFailedSignIn({ data: { email, reason: "Admin sign-in: account is not an administrator" } }).catch(() => {});
        await supabase.auth.signOut();
        throw new Error("This account does not have administrator access.");
      }
      await logSignIn({ data: { method: "password" } }).catch(() => {});
      navigate({ to: "/portal/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-cream p-8 shadow-card">
        <Link to="/" className="flex items-center gap-3">
          <Crest size="sm" />
          <span className="font-display font-semibold text-ink">Daniel's Primary School</span>
        </Link>
        <div className="mt-8 flex items-center gap-2 text-brand">
          <ShieldCheck className="size-5" />
          <p className="eyebrow">Administrator access</p>
        </div>
        <h1 className="mt-2 text-3xl text-ink">Staff sign in.</h1>
        <p className="mt-2 text-sm text-ink/60">Only school administrators can sign in here.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-ink/50">Email</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-ink/50">Password</span>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
          </label>
          <button type="submit" disabled={busy} className="pill-brand h-11 w-full text-sm disabled:opacity-60">
            {busy ? "Checking…" : "Sign in to admin"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-ink/60">
          Student or parent? <Link to="/auth" className="font-semibold text-brand hover:underline">Use the portal sign-in</Link>
        </p>
      </div>
    </div>
  );
}

const inputCls =
  "mt-1 h-11 w-full rounded-lg border border-input bg-paper px-4 text-sm text-ink outline-none focus:ring-2 focus:ring-ring";
