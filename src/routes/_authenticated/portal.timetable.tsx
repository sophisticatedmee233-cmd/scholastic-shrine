import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DAY_NAMES, formatTime, timetableQuery } from "@/lib/portal.queries";

export const Route = createFileRoute("/_authenticated/portal/timetable")({
  head: () => ({
    meta: [
      { title: "Student Timetable — Daniel's Primary School" },
      { name: "description", content: "View your weekly class timetable." },
      { property: "og:title", content: "Student Timetable — Daniel's Primary School" },
      { property: "og:description", content: "View your weekly class timetable." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TimetablePage,
});

function TimetablePage() {
  const { data: entries } = useQuery(timetableQuery);
  const days = [...new Set((entries ?? []).map((e) => e.day_of_week))].sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Weekly schedule</p>
        <h1 className="mt-2 text-4xl text-ink">Timetable</h1>
      </div>

      {days.length === 0 && <p className="text-sm text-ink/60">No timetable has been published for your class yet.</p>}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {days.map((d) => (
          <section key={d} className="rounded-2xl border border-border bg-cream p-5">
            <h2 className="font-display text-lg text-ink">{DAY_NAMES[d]}</h2>
            <ul className="mt-3 divide-y divide-border">
              {(entries ?? [])
                .filter((e) => e.day_of_week === d)
                .map((e) => (
                  <li key={e.id} className="py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-medium text-ink">{e.subject}</p>
                      <p className="text-xs text-ink/50">
                        {formatTime(e.start_time)}–{formatTime(e.end_time)}
                      </p>
                    </div>
                    <p className="text-xs text-ink/50">
                      {e.room} · {e.teacher}
                    </p>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
