import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Video, BookOpen } from "lucide-react";
import { profileQuery, formatDate } from "@/lib/portal.queries";
import { assignmentsQuery, formatWhen, videoClassesQuery } from "@/lib/classwork";

export const Route = createFileRoute("/_authenticated/portal/classwork")({
  head: () => ({
    meta: [
      { title: "Classwork — Daniel's Primary School" },
      { name: "description", content: "Assignments and live video classes from your teachers." },
      { property: "og:title", content: "Classwork — Daniel's Primary School" },
      { property: "og:description", content: "Assignments and live video classes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Classwork,
});

function Classwork() {
  const { data: profile } = useQuery(profileQuery);
  const cls = profile?.class_name;
  const { data: live } = useQuery({ ...videoClassesQuery(cls), enabled: Boolean(cls) });
  const { data: work } = useQuery({ ...assignmentsQuery(cls), enabled: Boolean(cls) });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Classwork</h1>
        <p className="text-sm text-ink/60">{cls} · live classes and assignments from your teachers</p>
      </div>
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-display text-xl text-ink"><Video className="size-5 text-brand" /> Video classes</h2>
        {!live?.length && <p className="text-sm text-ink/50">No upcoming video classes.</p>}
        {live?.map((v) => (
          <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-cream p-4">
            <div>
              <p className="font-semibold text-ink">{v.title}</p>
              <p className="text-xs text-ink/60">{v.subject} · {v.teacher_name} · {formatWhen(v.starts_at)}</p>
            </div>
            <a href={v.meeting_url} target="_blank" rel="noreferrer" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-cream">Join class</a>
          </div>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-display text-xl text-ink"><BookOpen className="size-5 text-brand" /> Assignments</h2>
        {!work?.length && <p className="text-sm text-ink/50">No assignments yet.</p>}
        {work?.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-cream p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-semibold text-ink">{a.title}</p>
              <span className="text-xs font-semibold text-brand">Due {formatDate(a.due_date)}</span>
            </div>
            <p className="text-xs text-ink/60">{a.subject} · {a.teacher_name}</p>
            {a.instructions && <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">{a.instructions}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}
