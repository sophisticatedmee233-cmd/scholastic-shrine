import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { announcementsQuery, formatDate } from "@/lib/portal.queries";

export const Route = createFileRoute("/_authenticated/portal/announcements")({
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const { data: notices } = useQuery(announcementsQuery);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Noticeboard</p>
        <h1 className="mt-2 text-4xl text-ink">Announcements</h1>
      </div>

      <div className="space-y-4">
        {(notices ?? []).map((n) => (
          <article
            key={n.id}
            className={`rounded-2xl border p-6 ${n.is_urgent ? "border-clay/40 bg-clay/5" : "border-border bg-cream"}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-clay">
              {n.category} · {formatDate(n.published_at)} {n.is_urgent ? "· Urgent" : ""}
            </p>
            <h2 className="mt-1 font-display text-xl text-ink">{n.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{n.body}</p>
          </article>
        ))}
        {(notices ?? []).length === 0 && <p className="text-sm text-ink/60">No announcements right now.</p>}
      </div>
    </div>
  );
}
