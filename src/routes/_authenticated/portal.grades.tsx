import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { gradesQuery } from "@/lib/portal.queries";

export const Route = createFileRoute("/_authenticated/portal/grades")({
  component: GradesPage,
});

function GradesPage() {
  const { data: grades } = useQuery(gradesQuery);
  const groups = new Map<string, typeof grades>();
  for (const g of grades ?? []) {
    const key = `Term ${g.term} · ${g.year}`;
    groups.set(key, [...(groups.get(key) ?? []), g]);
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Results</p>
        <h1 className="mt-2 text-4xl text-ink">Grades &amp; reports</h1>
      </div>

      {groups.size === 0 && <p className="text-sm text-ink/60">No results have been published yet.</p>}

      {[...groups.entries()].map(([label, rows]) => {
        const avg = rows!.reduce((s, g) => s + Number(g.score), 0) / rows!.length;
        return (
          <section key={label} className="overflow-hidden rounded-2xl border border-border bg-cream">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-lg text-ink">{label}</h2>
              <p className="text-sm text-ink/60">Average {avg.toFixed(1)}%</p>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-sage">
                <tr>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Grade</th>
                  <th className="hidden px-6 py-3 md:table-cell">Teacher comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows!.map((g) => (
                  <tr key={g.id}>
                    <td className="px-6 py-3 font-medium text-ink">{g.subject}</td>
                    <td className="px-6 py-3 text-ink/70">{g.score}%</td>
                    <td className="px-6 py-3 font-semibold text-brand">{g.grade}</td>
                    <td className="hidden px-6 py-3 text-ink/60 md:table-cell">{g.teacher_comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}
