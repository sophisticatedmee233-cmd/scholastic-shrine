import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import {
  accessQuery,
  adminFeesQuery,
  adminGradesQuery,
  adminParentLinksQuery,
  adminStudentsQuery,
} from "@/lib/admin.queries";
import {
  adminAddInvoice,
  adminAddPayment,
  adminCreateParent,
  adminCreateStudent,
  adminDeleteAnnouncement,
  adminDeleteFeeRow,
  adminDeleteGrade,
  adminDeleteParentLink,
  adminSaveAnnouncement,
  adminSaveGrade,
  adminUpdateStudent,
} from "@/lib/admin.functions";
import { announcementsQuery, formatDate, formatKES } from "@/lib/portal.queries";

export const Route = createFileRoute("/_authenticated/portal/admin")({
  component: AdminDashboard,
});

const TABS = ["Students", "Grades", "Fees", "Announcements", "Parents"] as const;
type Tab = (typeof TABS)[number];

function AdminDashboard() {
  const { data: access, isLoading } = useQuery(accessQuery);
  const [tab, setTab] = useState<Tab>("Students");

  if (isLoading) return <p className="text-sm text-ink/60">Loading…</p>;
  if (!access?.isAdmin) {
    return (
      <div className="rounded-2xl border border-border bg-cream p-8">
        <h1 className="text-2xl text-ink">Staff area</h1>
        <p className="mt-2 text-sm text-ink/60">
          This section is for school administrators only. Ask the school office if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">School administration</p>
        <h1 className="mt-2 text-4xl text-ink">Manage the portal</h1>
        <p className="mt-1 text-sm text-ink/60">Add learners, record results, update fees, publish notices and link parents.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === t ? "bg-brand text-cream" : "border border-border text-ink/70 hover:text-brand"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Students" && <StudentsPanel />}
      {tab === "Grades" && <GradesPanel />}
      {tab === "Fees" && <FeesPanel />}
      {tab === "Announcements" && <AnnouncementsPanel />}
      {tab === "Parents" && <ParentsPanel />}
    </div>
  );
}

/* ---------- shared bits ---------- */

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-cream p-6">
      <h2 className="text-xl text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-sage">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand";

function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button type="submit" disabled={busy} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-cream disabled:opacity-60">
      {busy ? "Saving…" : children}
    </button>
  );
}

function StudentPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { data: students } = useQuery(adminStudentsQuery);
  return (
    <Field label="Learner">
      <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select a learner…</option>
        {(students ?? []).map((s) => (
          <option key={s.id} value={s.id}>
            {s.full_name} · {s.class_name} {s.admission_number ? `· ${s.admission_number}` : ""}
          </option>
        ))}
      </select>
    </Field>
  );
}

function useRefresh() {
  const qc = useQueryClient();
  return (keys: string[][]) => keys.forEach((key) => qc.invalidateQueries({ queryKey: key }));
}

/* ---------- students ---------- */

function StudentsPanel() {
  const { data: students } = useQuery(adminStudentsQuery);
  const refresh = useRefresh();
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    class_name: "Grade 10",
    stream: "STEM",
    admission_number: "",
  });

  const create = useMutation({
    mutationFn: () => adminCreateStudent({ data: form }),
    onSuccess: () => {
      toast.success("Learner account created");
      setForm({ email: "", password: "", full_name: "", class_name: "Grade 10", stream: "STEM", admission_number: "" });
      refresh([["admin", "students"]]);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: (v: { id: string; full_name: string; class_name: string; stream: string; admission_number: string }) =>
      adminUpdateStudent({ data: v }),
    onSuccess: () => {
      toast.success("Learner updated");
      refresh([["admin", "students"]]);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <Panel title="Add a learner">
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <Field label="Full name">
            <input required className={inputClass} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </Field>
          <Field label="Email">
            <input required type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Temporary password">
            <input required minLength={6} className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <Field label="Class">
            <input className={inputClass} value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })} />
          </Field>
          <Field label="Stream">
            <input className={inputClass} value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })} />
          </Field>
          <Field label="Admission number">
            <input className={inputClass} value={form.admission_number} onChange={(e) => setForm({ ...form, admission_number: e.target.value })} />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <SubmitButton busy={create.isPending}>Create learner</SubmitButton>
          </div>
        </form>
      </Panel>

      <Panel title={`Learners (${students?.length ?? 0})`}>
        <div className="space-y-3">
          {(students ?? []).map((s) => (
            <form
              key={s.id}
              className="grid gap-3 rounded-xl border border-border bg-paper p-4 sm:grid-cols-5"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                const f = new FormData(e.target as HTMLFormElement);
                update.mutate({
                  id: s.id,
                  full_name: String(f.get("full_name")),
                  class_name: String(f.get("class_name")),
                  stream: String(f.get("stream")),
                  admission_number: String(f.get("admission_number")),
                });
              }}
            >
              <input name="full_name" defaultValue={s.full_name} className={inputClass} />
              <input name="class_name" defaultValue={s.class_name} className={inputClass} />
              <input name="stream" defaultValue={s.stream} className={inputClass} />
              <input name="admission_number" defaultValue={s.admission_number ?? ""} className={inputClass} />
              <button type="submit" className="rounded-full border border-border px-4 py-2 text-sm font-medium text-ink">
                Save
              </button>
            </form>
          ))}
          {!students?.length && <p className="text-sm text-ink/60">No learners yet.</p>}
        </div>
      </Panel>
    </div>
  );
}

/* ---------- grades ---------- */

function GradesPanel() {
  const [studentId, setStudentId] = useState("");
  const { data: grades } = useQuery(adminGradesQuery(studentId));
  const refresh = useRefresh();
  const year = new Date().getFullYear();
  const [form, setForm] = useState({ subject: "", term: 1, year, score: 0, grade: "A", teacher_comment: "" });

  const save = useMutation({
    mutationFn: () => adminSaveGrade({ data: { student_id: studentId, ...form, score: Number(form.score), term: Number(form.term), year: Number(form.year) } }),
    onSuccess: () => {
      toast.success("Result recorded");
      refresh([["admin", "grades", studentId], ["portal", "grades"]]);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteGrade({ data: { id } }),
    onSuccess: () => refresh([["admin", "grades", studentId], ["portal", "grades"]]),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <Panel title="Record a result">
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            if (!studentId) return toast.error("Choose a learner first");
            save.mutate();
          }}
        >
          <StudentPicker value={studentId} onChange={setStudentId} />
          <Field label="Subject">
            <input required className={inputClass} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </Field>
          <Field label="Score (%)">
            <input required type="number" min={0} max={100} className={inputClass} value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} />
          </Field>
          <Field label="Grade">
            <input required className={inputClass} value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
          </Field>
          <Field label="Term">
            <select className={inputClass} value={form.term} onChange={(e) => setForm({ ...form, term: Number(e.target.value) })}>
              {[1, 2, 3].map((t) => (
                <option key={t} value={t}>Term {t}</option>
              ))}
            </select>
          </Field>
          <Field label="Year">
            <input type="number" className={inputClass} value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Teacher comment">
              <input className={inputClass} value={form.teacher_comment} onChange={(e) => setForm({ ...form, teacher_comment: e.target.value })} />
            </Field>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <SubmitButton busy={save.isPending}>Save result</SubmitButton>
          </div>
        </form>
      </Panel>

      <Panel title="Recorded results">
        {!studentId ? (
          <p className="text-sm text-ink/60">Choose a learner above to see their results.</p>
        ) : (
          <ul className="divide-y divide-border">
            {(grades ?? []).map((g) => (
              <li key={g.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-ink">
                  {g.subject} · Term {g.term} {g.year}
                </span>
                <span className="flex items-center gap-4 text-ink/60">
                  {g.score}% · {g.grade}
                  <button type="button" className="text-clay hover:underline" onClick={() => remove.mutate(g.id)}>
                    Remove
                  </button>
                </span>
              </li>
            ))}
            {!grades?.length && <p className="text-sm text-ink/60">No results yet.</p>}
          </ul>
        )}
      </Panel>
    </div>
  );
}

/* ---------- fees ---------- */

function FeesPanel() {
  const [studentId, setStudentId] = useState("");
  const { data: fees } = useQuery(adminFeesQuery(studentId));
  const refresh = useRefresh();
  const year = new Date().getFullYear();
  const [inv, setInv] = useState({ description: "", amount: 0, term: 1, year, due_date: "" });
  const [pay, setPay] = useState({ amount: 0, method: "M-Pesa", reference: "" });

  const keys = () => [["admin", "fees", studentId], ["portal", "fees"]];

  const addInvoice = useMutation({
    mutationFn: () =>
      adminAddInvoice({
        data: { student_id: studentId, description: inv.description, amount: Number(inv.amount), term: Number(inv.term), year: Number(inv.year), due_date: inv.due_date },
      }),
    onSuccess: () => {
      toast.success("Fee item added");
      refresh(keys());
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addPayment = useMutation({
    mutationFn: () => adminAddPayment({ data: { student_id: studentId, amount: Number(pay.amount), method: pay.method, reference: pay.reference } }),
    onSuccess: () => {
      toast.success("Payment recorded");
      refresh(keys());
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (v: { id: string; kind: "invoice" | "payment" }) => adminDeleteFeeRow({ data: v }),
    onSuccess: () => refresh(keys()),
    onError: (e: Error) => toast.error(e.message),
  });

  const billed = (fees?.invoices ?? []).reduce((s, i) => s + Number(i.amount), 0);
  const paid = (fees?.payments ?? []).reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <Panel title="Choose a learner">
        <StudentPicker value={studentId} onChange={setStudentId} />
        {studentId && (
          <p className="mt-3 text-sm text-ink/60">
            Billed {formatKES(billed)} · Paid {formatKES(paid)} · Balance {formatKES(billed - paid)}
          </p>
        )}
      </Panel>

      <Panel title="Add a fee item">
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            if (!studentId) return toast.error("Choose a learner first");
            addInvoice.mutate();
          }}
        >
          <Field label="Description">
            <input required className={inputClass} value={inv.description} onChange={(e) => setInv({ ...inv, description: e.target.value })} />
          </Field>
          <Field label="Amount (KSh)">
            <input required type="number" className={inputClass} value={inv.amount} onChange={(e) => setInv({ ...inv, amount: Number(e.target.value) })} />
          </Field>
          <Field label="Due date">
            <input required type="date" className={inputClass} value={inv.due_date} onChange={(e) => setInv({ ...inv, due_date: e.target.value })} />
          </Field>
          <Field label="Term">
            <select className={inputClass} value={inv.term} onChange={(e) => setInv({ ...inv, term: Number(e.target.value) })}>
              {[1, 2, 3].map((t) => (
                <option key={t} value={t}>Term {t}</option>
              ))}
            </select>
          </Field>
          <Field label="Year">
            <input type="number" className={inputClass} value={inv.year} onChange={(e) => setInv({ ...inv, year: Number(e.target.value) })} />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <SubmitButton busy={addInvoice.isPending}>Add fee item</SubmitButton>
          </div>
        </form>
      </Panel>

      <Panel title="Record a payment">
        <form
          className="grid gap-4 sm:grid-cols-3"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            if (!studentId) return toast.error("Choose a learner first");
            addPayment.mutate();
          }}
        >
          <Field label="Amount (KSh)">
            <input required type="number" className={inputClass} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: Number(e.target.value) })} />
          </Field>
          <Field label="Method">
            <input className={inputClass} value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })} />
          </Field>
          <Field label="Reference">
            <input className={inputClass} value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} />
          </Field>
          <div className="sm:col-span-3">
            <SubmitButton busy={addPayment.isPending}>Record payment</SubmitButton>
          </div>
        </form>
      </Panel>

      {studentId && (
        <Panel title="Statement">
          <ul className="divide-y divide-border">
            {(fees?.invoices ?? []).map((i) => (
              <li key={i.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-ink">
                  {i.description} · due {formatDate(i.due_date)}
                </span>
                <span className="flex items-center gap-4 text-ink/60">
                  {formatKES(Number(i.amount))}
                  <button type="button" className="text-clay hover:underline" onClick={() => remove.mutate({ id: i.id, kind: "invoice" })}>
                    Remove
                  </button>
                </span>
              </li>
            ))}
            {(fees?.payments ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-ink">
                  Payment · {p.method} {p.reference}
                </span>
                <span className="flex items-center gap-4 text-brand">
                  -{formatKES(Number(p.amount))}
                  <button type="button" className="text-clay hover:underline" onClick={() => remove.mutate({ id: p.id, kind: "payment" })}>
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

/* ---------- announcements ---------- */

function AnnouncementsPanel() {
  const { data: notices } = useQuery(announcementsQuery);
  const refresh = useRefresh();
  const [form, setForm] = useState({ title: "", body: "", category: "General", is_public: false, is_urgent: false });

  const keys = () => [["portal", "announcements"], ["announcements", "public"]];

  const save = useMutation({
    mutationFn: () => adminSaveAnnouncement({ data: form }),
    onSuccess: () => {
      toast.success("Notice published");
      setForm({ title: "", body: "", category: "General", is_public: false, is_urgent: false });
      refresh(keys());
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteAnnouncement({ data: { id } }),
    onSuccess: () => refresh(keys()),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <Panel title="Publish a notice">
        <form
          className="grid gap-4"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <Field label="Title">
            <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Message">
            <textarea required rows={4} className={inputClass} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Category">
              <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })} />
              Show on the public website
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={form.is_urgent} onChange={(e) => setForm({ ...form, is_urgent: e.target.checked })} />
              Mark as urgent
            </label>
          </div>
          <div>
            <SubmitButton busy={save.isPending}>Publish notice</SubmitButton>
          </div>
        </form>
      </Panel>

      <Panel title="Published notices">
        <ul className="divide-y divide-border">
          {(notices ?? []).map((n) => (
            <li key={n.id} className="flex items-start justify-between gap-4 py-3 text-sm">
              <span>
                <span className="block font-medium text-ink">{n.title}</span>
                <span className="text-ink/60">
                  {n.category} · {formatDate(n.published_at)} {n.is_public ? "· Public" : "· Portal only"} {n.is_urgent ? "· Urgent" : ""}
                </span>
              </span>
              <button type="button" className="text-clay hover:underline" onClick={() => remove.mutate(n.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

/* ---------- parents ---------- */

function ParentsPanel() {
  const { data: links } = useQuery(adminParentLinksQuery);
  const { data: students } = useQuery(adminStudentsQuery);
  const refresh = useRefresh();
  const [form, setForm] = useState({ email: "", password: "", full_name: "", student_id: "", relationship: "Parent" });

  const create = useMutation({
    mutationFn: () => adminCreateParent({ data: form }),
    onSuccess: () => {
      toast.success("Parent linked");
      setForm({ email: "", password: "", full_name: "", student_id: "", relationship: "Parent" });
      refresh([["admin", "parent-links"]]);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteParentLink({ data: { id } }),
    onSuccess: () => refresh([["admin", "parent-links"]]),
    onError: (e: Error) => toast.error(e.message),
  });

  const nameFor = (id: string) => students?.find((s) => s.id === id)?.full_name ?? "Learner";

  return (
    <div className="space-y-6">
      <Panel title="Give a parent access">
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            if (!form.student_id) return toast.error("Choose a learner first");
            create.mutate();
          }}
        >
          <Field label="Parent name">
            <input required className={inputClass} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </Field>
          <Field label="Parent email">
            <input required type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Temporary password">
            <input required minLength={6} className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <StudentPicker value={form.student_id} onChange={(v) => setForm({ ...form, student_id: v })} />
          <Field label="Relationship">
            <input className={inputClass} value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <SubmitButton busy={create.isPending}>Link parent</SubmitButton>
          </div>
        </form>
        <p className="mt-3 text-xs text-ink/50">
          If the email already has an account, it is reused and simply linked to the learner.
        </p>
      </Panel>

      <Panel title="Linked parents">
        <ul className="divide-y divide-border">
          {(links ?? []).map((l) => (
            <li key={l.id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-ink">
                {l.parent_name} ({l.relationship}) · {l.parent_email} → {nameFor(l.student_id)}
              </span>
              <button type="button" className="text-clay hover:underline" onClick={() => remove.mutate(l.id)}>
                Unlink
              </button>
            </li>
          ))}
          {!links?.length && <p className="text-sm text-ink/60">No parents linked yet.</p>}
        </ul>
      </Panel>
    </div>
  );
}
