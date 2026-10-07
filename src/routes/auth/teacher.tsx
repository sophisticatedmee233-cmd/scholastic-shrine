import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess } from "@/lib/admin.functions";
import { logFailedSignIn, logSignIn } from "@/lib/audit.functions";
import { SignInLayout } from "@/components/site/SignInLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/teacher")({
  head: () => ({
    meta: [
      { title: "Teacher Sign In — Daniel's Primary School" },
      { name: "description", content: "Teacher sign-in for the Daniel's Primary School staff portal — assignments, video classes and class records." },
      { property: "og:title", content: "Teacher Sign In — Daniel's Primary School" },
      { property: "og:description", content: "Secure sign-in for teachers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TeacherLogin,
});

function TeacherLogin() {
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
        logFailedSignIn({ data: { email, reason: `Teacher sign-in: ${error.message}` } }).catch(() => {});
        throw error;
      }
      const access = await getMyAccess();
      if (!access?.isTeacher && !access?.isAdmin) {
        logFailedSignIn({ data: { email, reason: "Teacher sign-in: account is not a teacher" } }).catch(() => {});
        await supabase.auth.signOut();
        throw new Error("This account does not have teacher access.");
      }
      await logSignIn({ data: { method: "password" } }).catch(() => {});
      navigate({ to: "/portal/teacher", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SignInLayout role="teacher">
        <h1 className="text-3xl leading-tight text-ink tracking-normal">Welcome, teacher.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">It’s good to have you back at Daniel's Primary School.</p>
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
            {busy ? "Checking…" : "Sign in to teacher panel"}
          </Button>
        </form>
    </SignInLayout>
  );
}

const inputCls =
  "mt-1 h-11 w-full rounded-lg border border-input bg-paper px-4 text-sm text-ink outline-none focus:ring-2 focus:ring-ring";
