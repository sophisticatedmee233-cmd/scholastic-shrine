import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess } from "@/lib/admin.functions";
import { logFailedSignIn, logSignIn } from "@/lib/audit.functions";
import { SignInLayout } from "@/components/site/SignInLayout";
import { Button } from "@/components/ui/button";

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
    <SignInLayout role="administrator">
        <h1 className="text-3xl leading-tight text-ink tracking-normal">Welcome, administrator.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">A warm welcome to the Daniel's Primary School office.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-ink/50">Email</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-ink/50">Password</span>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
          </label>
          <Button type="submit" disabled={busy} className="h-11 w-full">
            {busy ? "Checking…" : "Sign in to admin"}
          </Button>
        </form>
    </SignInLayout>
  );
}

const inputCls =
  "mt-1 h-11 w-full rounded-lg border border-input bg-paper px-4 text-sm text-ink outline-none focus:ring-2 focus:ring-ring";
