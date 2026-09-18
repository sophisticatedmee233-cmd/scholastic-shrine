import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { profileQuery } from "@/lib/portal.queries";
import { supabase } from "@/integrations/supabase/client";
import { Crest } from "@/components/site/Crest";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "Student Portal — Limuru Town School" },
      { name: "description", content: "Grades, timetable, fee statements and announcements for Limuru Town School learners." },
      { property: "og:title", content: "Student Portal — Limuru Town School" },
      { property: "og:description", content: "Grades, timetable, fee statements and announcements in one place." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalLayout,
});

const tabs = [
  { to: "/portal", label: "Overview" },
  { to: "/portal/grades", label: "Grades" },
  { to: "/portal/timetable", label: "Timetable" },
  { to: "/portal/fees", label: "Fees" },
  { to: "/portal/announcements", label: "Announcements" },
] as const;

function PortalLayout() {
  const { data: profile } = useQuery(profileQuery);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-border bg-cream">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <Crest size="sm" />
            <div>
              <p className="font-display font-semibold leading-none text-ink">Student Portal</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-sage">Limuru Town School</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">{profile?.full_name ?? "Student"}</p>
              <p className="text-xs text-ink/50">{profile?.admission_number}</p>
            </div>
            <button
              type="button"
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-ink"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 md:px-4">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: t.to === "/portal" }}
              className="whitespace-nowrap rounded-t-lg px-4 py-3 text-sm font-medium text-ink/60 hover:text-brand"
              activeProps={{ className: "text-brand border-b-2 border-brand" }}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 md:px-6">
        <Outlet />
      </main>
    </div>
  );
}
