import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  announcementsQuery,
  feesQuery,
  formatDate,
  formatKES,
  gradesQuery,
  profileQuery,
  timetableQuery,
  DAY_NAMES,
  formatTime,
} from "@/lib/portal.queries";

export const Route = createFileRoute("/_authenticated/portal/")({
  head: () => ({
    meta: [
      { title: "Portal Overview — Daniel's Primary School" },
      { name: "description", content: "Your school records, notices and weekly schedule." },
      { property: "og:title", content: "Portal Overview — Daniel's Primary School" },
      { property: "og:description", content: "Your school records, notices and weekly schedule." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalOverview,
});

function PortalOverview() {
  const { data: profile } = useQuery(profileQuery);
  const { data: grades } = useQuery(gradesQuery);
  const { data: fees } = useQuery(feesQuery);
  const { data: notices } = useQuery(announcementsQuery);
  const { data: timetable } = useQuery(timetableQuery);

  const latestYear = grades?.[0]?.year;
  const latestTerm = grades?.[0]?.term;
  const current = (grades ?? []).filter((g) => g.year === latestYear && g.term === latestTerm);
  const average = current.length
    ? (current.reduce((s, g) => s + Number(g.score), 0) / current.length).toFixed(1)
    : "—";

  const billed = (fees?.invoices ?? []).reduce((s, i) => s + Number(i.amount), 0);
  const paid = (fees?.payments ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const balance = billed - paid;

  const today = new Date().getDay();
  const todayLessons = (timetable ?? []).filter((t) => t.day_of_week === today);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-2 text-4xl text-ink">{profile?.full_name ?? "Student"}</h1>
        <p className="mt-1 text-sm text-ink/60">
          {profile?.class_name} · {profile?.stream} stream
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Term average" value={average === "—" ? "—" : `${average}%`} note={latestTerm ? `Term ${latestTerm} · ${latestYear}` : "No results yet"} />
        <Card label="Subjects graded" value={String(current.length)} note="This term" />
        <Card label="Fees balance" value={formatKES(balance)} note={balance > 0 ? "Payment due" : "Fully settled"} />
        <Card label="Announcements" value={String(notices?.length ?? 0)} note={`${(notices ?? []).filter((n) => n.is_urgent).length} urgent`} />
      </div>

      <section className="rounded-2xl border border-border bg-cream p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-ink">Today's lessons</h2>
          <Link to="/portal/timetable" className="text-sm font-semibold text-brand hover:underline">Full timetable →</Link>
        </div>
        {todayLessons.length === 0 ? (
          <p className="mt-4 text-sm text-ink/60">No lessons scheduled for {DAY_NAMES[today] || "today"}.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {todayLessons.map((l) => (
              <li key={l.id} className="flex items-center justify-between py-3 text-sm">
                <span className="font-medium text-ink">{l.subject}</span>
                <span className="text-ink/60">
                  {formatTime(l.start_time)}–{formatTime(l.end_time)} · {l.room}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-cream p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-ink">Latest announcements</h2>
          <Link to="/portal/announcements" className="text-sm font-semibold text-brand hover:underline">See all →</Link>
        </div>
        <ul className="mt-4 space-y-4">
          {(notices ?? []).slice(0, 3).map((n) => (
            <li key={n.id}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-clay">
                {n.category} · {formatDate(n.published_at)} {n.is_urgent ? "· Urgent" : ""}
              </p>
              <p className="font-display text-lg text-ink">{n.title}</p>
              <p className="text-sm text-ink/60">{n.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Card({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-border bg-cream p-5">
      <p className="text-[11px] uppercase tracking-wider text-sage">{label}</p>
      <p className="mt-1 font-display text-2xl text-ink">{value}</p>
      <p className="text-xs text-ink/50">{note}</p>
    </div>
  );
}
