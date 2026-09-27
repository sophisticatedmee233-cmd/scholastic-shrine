import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { logFailedSignIn, logSignIn } from "@/lib/audit.functions";
import { Crest } from "@/components/site/Crest";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Student Portal Sign In — Daniel's Primary School" },
      { name: "description", content: "Sign in to the Daniel's Primary School student portal to view grades, timetable, fees and announcements." },
      { property: "og:title", content: "Student Portal Sign In — Daniel's Primary School" },
      { property: "og:description", content: "Access your grades, timetable, fee statements and school notices." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/portal", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          logFailedSignIn({ data: { email, reason: error.message } }).catch(() => {});
          throw error;
        }
        await logSignIn({ data: { method: "password" } }).catch(() => {});
        navigate({ to: "/portal", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: fullName } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/portal", replace: true });
        else setCheckEmail(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      logFailedSignIn({ data: { email: "", reason: "Google sign-in failed" } }).catch(() => {});
      toast.error("Google sign-in failed. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    await logSignIn({ data: { method: "google" } }).catch(() => {});
    navigate({ to: "/portal", replace: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-brand lg:block">
        <div className="hero-glow absolute inset-0" />
        <div className="relative flex h-full flex-col justify-between p-12 text-cream">
          <Link to="/" className="flex items-center gap-3">
            <Crest size="md" className="bg-gold text-ink" />
            <span className="font-display text-xl font-semibold">Daniel's Primary School</span>
          </Link>
          <div>
            <p className="eyebrow">Student portal</p>
            <h1 className="mt-3 max-w-md text-5xl leading-[1.05]">
              Your grades, timetable and fees — <span className="italic text-gold">in one place.</span>
            </h1>
            <p className="mt-5 max-w-sm text-cream/70">
              Sign in with your school email. New learners can create an account and their class records will be linked by the office.
            </p>
          </div>
          <p className="text-xs text-cream/50">
            Need help? Contact the ICT desk · ict@limurutown.ac.ke ·{" "}
            <Link to="/auth/teacher" className="underline">Teacher sign-in</Link> ·{" "}
            <Link to="/admin" className="underline">Administrator sign-in</Link>
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-cream px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <Crest size="sm" />
            <span className="font-display font-semibold text-ink">Daniel's Primary School</span>
          </Link>

          {checkEmail ? (
            <div className="rounded-2xl bg-paper p-6 shadow-card">
              <p className="eyebrow">One more step</p>
              <h2 className="mt-2 text-2xl text-ink">Check your email</h2>
              <p className="mt-3 text-sm text-ink/70">
                We sent a confirmation link to <span className="font-semibold text-ink">{email}</span>. Click it to activate your portal account, then sign in.
              </p>
              <button type="button" onClick={() => { setCheckEmail(false); setMode("signin"); }} className="pill-brand mt-6 w-full text-sm">
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <p className="eyebrow">Student portal</p>
              <h2 className="mt-2 text-3xl text-ink">{mode === "signin" ? "Welcome back." : "Create your account."}</h2>
              <p className="mt-2 text-sm text-ink/60">
                {mode === "signin" ? "Sign in to view your dashboard." : "Use the email registered with the school office."}
              </p>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className="mt-6 flex h-11 w-full items-center justify-center gap-3 rounded-full border border-input bg-paper text-sm font-medium text-ink transition hover:bg-secondary disabled:opacity-60"
              >
                <GoogleMark />
                Continue with Google
              </button>

              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-sage">
                <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "signup" && (
                  <Field label="Full name">
                    <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="e.g. Janelle Mwangi" />
                  </Field>
                )}
                <Field label="Email">
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
                </Field>
                <Field label="Password">
                  <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
                </Field>
                <button type="submit" disabled={busy} className="pill-gold h-11 w-full text-sm disabled:opacity-60">
                  {busy ? "Please wait…" : mode === "signin" ? "Log in" : "Create account"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-ink/60">
                {mode === "signin" ? "New learner? " : "Already registered? "}
                <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-semibold text-brand underline-offset-4 hover:underline">
                  {mode === "signin" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

const inputCls =
  "mt-1 h-11 w-full rounded-lg border border-input bg-paper px-4 text-sm text-ink outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-ink/50">{label}</span>
      {children}
    </label>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.4 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.3 0 11.7-2.1 15.6-5.7l-7.5-5.8c-2.1 1.4-4.8 2.3-8.1 2.3-6.3 0-11.6-3.9-13.5-9.3l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}
