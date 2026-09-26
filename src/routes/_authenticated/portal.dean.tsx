import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { accessQuery, adminGradesQuery, adminStudentsQuery } from "@/lib/admin.queries";
import { adminDeleteGrade, adminSaveGrade } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/portal/dean")({
  head: () => ({
    meta: [
      { title: "Dean's Office — Limuru Town School" },
      { name: "description", content: "The Dean of Studies records and publishes learner results to the student portal." },
      { property: "og:title", content: "Dean's Office — Limuru Town School" },
      { property: "og:description", content: "Record and publish learner results." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeanPortal,
});

const inputClass =
  "w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-sage">{label}</span>
      {children}
    </label>
  );
}

function gradeFor(score: number) {
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "E";
}

function DeanPortal() {
  const { data: access, isLoading } = useQuery(accessQuery);
  const qc = useQueryClient();
  const { data: students } = useQuery({ ...adminStudentsQuery, enabled: Boolean(access?.isDean) });
  const [studentId, setStudentId] = useState("");
  const { data: grades } = useQuery({ ...adminGradesQuery(studentId), enabled: Boolean(studentId && access?.isDean) });
  const year = new Date().getFullYear();
  const [form, setForm] = useState({ subject: "", term: 1, year, score: 0, grade: "", teacher_comment: "" });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "grades", studentId] });
    qc.invalidateQueries({ queryKey: ["portal", "grades"] });
  };

  const save = useMutation({
    mutationFn: () =>
      adminSaveGrade({
        data: { student_id: studentId, ...form, grade: form.grade || gradeFor(form.score), score: Number(form.score), term: Number(form.term), year: Number(form.year) },
      }),
    onSuccess: () => {
      toast.success("Result published to the student portal");
      setForm({ ...form, subject: "", score: 0, grade: "", teacher_comment: "" });
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteGrade({ data: { id } }),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-ink/60">Loading…</p>;
  if (!access?.isDean) {
    return (
      <div className="rounded-2xl border border-border bg-cream p-8">
        <h1 className="text-2xl text-ink">Dean's office</h1>
        <p className="mt-2 text-sm text-ink/60">Only the Dean of Studies can record and publish results.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Dean of Studies</p>
        <h1 className="mt-2 text-4xl text-ink">Record &amp; publish results</h1>
        <p className="mt-1 text-sm text-ink/60">Saved results appear immediately in the learner's and parents' portal.</p>
      </div>

      <section className="rounded-2xl border border-border bg-cream p-6">
        <h2 className="text-xl text-ink">New result</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            if (!studentId) { toast.error("Choose a learner first"); return; }
            save.mutate();
          }}
        >
          <Field label="Learner">
            <select className={inputClass} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">Select a learner…</option>
              {(students ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} · {s.class_name} {s.admission_number ? `· ${s.admission_number}` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Subject">
            <input required className={inputClass} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </Field>
          <Field label="Score (%)">
            <input required type="number" min={0} max={100} className={inputClass} value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} />
          </Field>
          <Field label={`Grade (auto: ${gradeFor(form.score)})`}>
            <input className={inputClass} placeholder={gradeFor(form.score)} value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
          </Field>
          <Field label="Term">
            <select className={inputClass} value={form.term} onChange={(e) => setForm({ ...form, term: Number(e.target.value) })}>
              {[1, 2, 3].map((t) => <option key={t} value={t}>Term {t}</option>)}
            </select>
          </Field>
          <Field label="Year">
            <input type="number" className={inputClass} value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Comment">
              <input className={inputClass} value={form.teacher_comment} onChange={(e) => setForm({ ...form, teacher_comment: e.target.value })} />
            </Field>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" disabled={save.isPending} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-cream disabled:opacity-60">
              {save.isPending ? "Publishing…" : "Publish result"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-cream p-6">
        <h2 className="text-xl text-ink">Published results</h2>
        {!studentId ? (
          <p className="mt-3 text-sm text-ink/60">Choose a learner above to see their results.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {(grades ?? []).map((g) => (
              <li key={g.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-ink">{g.subject} · Term {g.term} {g.year}</span>
                <span className="flex items-center gap-4 text-ink/60">
                  {g.score}% · {g.grade}
                  <button type="button" className="text-clay hover:underline" onClick={() => remove.mutate(g.id)}>Remove</button>
                </span>
              </li>
            ))}
            {!grades?.length && <li className="py-3 text-sm text-ink/60">No results yet.</li>}
          </ul>
        )}
      </section>
    </div>
  );
}
