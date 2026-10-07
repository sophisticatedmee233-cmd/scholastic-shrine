import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { childRecordsQuery, childrenQuery } from "@/lib/admin.queries";
import { DAY_NAMES, formatDate, formatKES, formatTime } from "@/lib/portal.queries";

export const Route = createFileRoute("/_authenticated/portal/family")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Parent Portal — Daniel's Primary School" },
      { name: "description", content: "Parents follow their child's grades, timetable and fee balance at Daniel's Primary School." },
      { property: "og:title", content: "Parent Portal — Daniel's Primary School" },
      { property: "og:description", content: "Follow your child's grades, timetable and fee balance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FamilyPage,
});

function FamilyPage() {
  const { data: children, isLoading } = useQuery(childrenQuery);
  const [selected, setSelected] = useState<string>("");
  const studentId = selected || children?.[0]?.link.student_id || "";
  const { data: records } = useQuery(childRecordsQuery(studentId));

  if (isLoading) return <p className="text-sm text-ink/60">Loading…</p>;

  if (!children?.length) {
    return (
      <div className="rounded-2xl border border-border bg-cream p-8">
        <h1 className="text-2xl text-ink">Parent view</h1>
        <p className="mt-2 text-sm text-ink/60">
          No learner is linked to this account yet. Ask the school office to link your child, then refresh this page.
        </p>
      </div>
    );
  }

  const billed = (records?.invoices ?? []).reduce((s, i) => s + Number(i.amount), 0);
  const paid = (records?.payments ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const balance = billed - paid;

  const latest = records?.grades?.[0];
  const term = (records?.grades ?? []).filter((g) => g.year === latest?.year && g.term === latest?.term);
  const average = term.length ? (term.reduce((s, g) => s + Number(g.score), 0) / term.length).toFixed(1) : "—";

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Parent view</p>
        <h1 className="mt-2 text-3xl text-ink">{records?.profile?.full_name ?? "Your child"}</h1>
        <p className="mt-1 text-sm text-ink/60">
          {records?.profile?.class_name} · {records?.profile?.stream} stream
        </p>
      </div>

      {children.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {children.map((c) => (
            <button
              key={c.link.id}
              type="button"
              onClick={() => setSelected(c.link.student_id)}
              className={`rounded-full border px-4 py-2 text-sm ${
                c.link.student_id === studentId ? "border-brand bg-brand text-cream" : "border-border text-ink"
              }`}
            >
              {c.profile?.full_name ?? "Learner"}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Term average" value={average === "—" ? "—" : `${average}%`} note={latest ? `Term ${latest.term} · ${latest.year}` : "No results yet"} />
        <Stat label="Fees balance" value={formatKES(balance)} note={balance > 0 ? "Payment due" : "Fully settled"} />
        <Stat label="Subjects" value={String(term.length)} note="Graded this term" />
      </div>

      <section className="rounded-2xl border border-border bg-cream p-6">
        <h2 className="text-xl text-ink">Latest results</h2>
        <ul className="mt-4 divide-y divide-border">
          {term.map((g) => (
            <li key={g.id} className="flex items-center justify-between py-3 text-sm">
              <span className="font-medium text-ink">{g.subject}</span>
              <span className="text-ink/60">
                {Number(g.score)}% · {g.grade}
              </span>
            </li>
          ))}
          {term.length === 0 && <li className="py-3 text-sm text-ink/60">No results published yet.</li>}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-cream p-6">
        <h2 className="text-xl text-ink">Weekly timetable</h2>
        <div className="mt-4 space-y-5">
          {[1, 2, 3, 4, 5].map((day) => {
            const lessons = (records?.timetable ?? []).filter((t) => t.day_of_week === day);
            if (!lessons.length) return null;
            return (
              <div key={day}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-sage">{DAY_NAMES[day]}</p>
                <ul className="mt-2 divide-y divide-border">
                  {lessons.map((l) => (
                    <li key={l.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="font-medium text-ink">{l.subject}</span>
                      <span className="text-ink/60">
                        {formatTime(l.start_time)}–{formatTime(l.end_time)} · {l.room}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {(records?.timetable ?? []).length === 0 && <p className="text-sm text-ink/60">No timetable published yet.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-cream p-6">
        <h2 className="text-xl text-ink">Fee statement</h2>
        <ul className="mt-4 divide-y divide-border">
          {(records?.invoices ?? []).map((i) => (
            <li key={i.id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-ink">
                {i.description}
                <span className="block text-xs text-ink/50">Due {formatDate(i.due_date)}</span>
              </span>
              <span className="font-medium text-ink">{formatKES(Number(i.amount))}</span>
            </li>
          ))}
          {(records?.payments ?? []).map((p) => (
            <li key={p.id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-ink">
                Payment · {p.method}
                <span className="block text-xs text-ink/50">
                  {p.reference} · {formatDate(p.paid_at)}
                </span>
              </span>
              <span className="font-medium text-brand">-{formatKES(Number(p.amount))}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-border bg-cream p-5">
      <p className="text-[11px] uppercase tracking-wider text-sage">{label}</p>
      <p className="mt-1 font-display text-2xl text-ink">{value}</p>
      <p className="text-xs text-ink/50">{note}</p>
    </div>
  );
}
