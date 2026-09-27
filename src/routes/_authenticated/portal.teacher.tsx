import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Video, BookOpen, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { accessQuery, adminStudentsQuery } from "@/lib/admin.queries";
import { profileQuery, formatDate } from "@/lib/portal.queries";
import { assignmentsQuery, CLASSES, formatWhen, newMeetingUrl, videoClassesQuery } from "@/lib/classwork";

export const Route = createFileRoute("/_authenticated/portal/teacher")({
  head: () => ({
    meta: [
      { title: "Teacher's Panel — Daniel's Primary School" },
      { name: "description", content: "Teachers send assignments and start live video classes." },
      { property: "og:title", content: "Teacher's Panel — Daniel's Primary School" },
      { property: "og:description", content: "Send assignments and start video classes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TeacherPanel,
});

const input = "w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand";
const btn = "rounded-full bg-brand px-4 py-2 text-sm font-semibold text-cream disabled:opacity-50";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-sage">{label}</span>
      {children}
    </label>
  );
}

function Card({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-cream p-5">
      <h2 className="mb-4 flex items-center gap-2 font-display text-xl text-ink">{icon}{title}</h2>
      {children}
    </section>
  );
}

function TeacherPanel() {
  const { data: access, isLoading } = useQuery(accessQuery);
  const { data: profile } = useQuery(profileQuery);
  const allowed = Boolean(access?.isTeacher || access?.isAdmin);
  const { data: live } = useQuery({ ...videoClassesQuery(), enabled: allowed });
  const { data: work } = useQuery({ ...assignmentsQuery(), enabled: allowed });
  const { data: students } = useQuery({ ...adminStudentsQuery, enabled: Boolean(access?.isAdmin) });
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [a, setA] = useState({ class_name: "Grade 4", subject: "", title: "", instructions: "", due_date: today });
  const [v, setV] = useState({ class_name: "Grade 4", subject: "", title: "", starts_at: "" });

  if (isLoading) return <p className="text-sm text-ink/60">Loading…</p>;
  if (!allowed)
    return <p className="rounded-xl border border-border bg-cream p-6 text-sm text-ink/70">This panel is for teachers. Ask the administrator to give your account the teacher role.</p>;

  const me = async () => {
    const { data } = await supabase.auth.getUser();
    return { teacher_id: data.user!.id, teacher_name: profile?.full_name || data.user?.email || "Teacher" };
  };
  const refresh = () => qc.invalidateQueries({ queryKey: ["classwork"] });

  const sendAssignment = async (e: FormEvent) => {
    e.preventDefault();
    if (!a.subject || !a.title) { toast.error("Add a subject and title"); return; }
    setBusy(true);
    const { error } = await supabase.from("assignments").insert({ ...a, ...(await me()) });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Assignment sent to " + a.class_name);
    setA({ ...a, title: "", instructions: "" });
    refresh();
  };

  const scheduleClass = async (startNow: boolean) => {
    if (!v.subject || !v.title) { toast.error("Add a subject and title"); return; }
    if (!startNow && !v.starts_at) { toast.error("Pick a date and time"); return; }
    const meeting_url = newMeetingUrl();
    setBusy(true);
    const { error } = await supabase.from("video_classes").insert({
      class_name: v.class_name, subject: v.subject, title: v.title, meeting_url,
      starts_at: startNow ? new Date().toISOString() : new Date(v.starts_at).toISOString(),
      ...(await me()),
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(startNow ? "Class started — learners can join now" : "Class scheduled");
    if (startNow) window.open(meeting_url, "_blank", "noopener");
    setV({ ...v, title: "", starts_at: "" });
    refresh();
  };

  const remove = async (table: "assignments" | "video_classes", id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };

  const classPicker = (value: string, onChange: (c: string) => void) => (
    <select className={input} value={value} onChange={(e) => onChange(e.target.value)}>
      {CLASSES.map((c) => <option key={c}>{c}</option>)}
    </select>
  );

  const classSize = (c: string) => students?.filter((s) => s.class_name === c).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Teacher's Panel</h1>
        <p className="text-sm text-ink/60">Send assignments and run live video classes. Learners see them under Classwork.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Video class" icon={<Video className="size-5 text-brand" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Class">{classPicker(v.class_name, (c) => setV({ ...v, class_name: c }))}</Field>
            <Field label="Subject"><input className={input} value={v.subject} onChange={(e) => setV({ ...v, subject: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Topic"><input className={input} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} /></Field></div>
            <div className="sm:col-span-2"><Field label="Schedule for later (optional)"><input type="datetime-local" className={input} value={v.starts_at} onChange={(e) => setV({ ...v, starts_at: e.target.value })} /></Field></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={busy} className={btn} onClick={() => scheduleClass(true)}>Start class now</button>
            <button disabled={busy} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink" onClick={() => scheduleClass(false)}>Schedule</button>
          </div>
        </Card>

        <Card title="New assignment" icon={<BookOpen className="size-5 text-brand" />}>
          <form onSubmit={sendAssignment} className="grid gap-3 sm:grid-cols-2">
            <Field label="Class">{classPicker(a.class_name, (c) => setA({ ...a, class_name: c }))}</Field>
            <Field label="Subject"><input className={input} value={a.subject} onChange={(e) => setA({ ...a, subject: e.target.value })} /></Field>
            <Field label="Title"><input className={input} value={a.title} onChange={(e) => setA({ ...a, title: e.target.value })} /></Field>
            <Field label="Due date"><input type="date" className={input} value={a.due_date} onChange={(e) => setA({ ...a, due_date: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Instructions"><textarea rows={4} className={input} value={a.instructions} onChange={(e) => setA({ ...a, instructions: e.target.value })} /></Field></div>
            <div><button disabled={busy} className={btn}>Send assignment</button></div>
          </form>
        </Card>
      </div>

      <Card title="Upcoming video classes" icon={<Video className="size-5 text-brand" />}>
        {!live?.length && <p className="text-sm text-ink/50">None scheduled.</p>}
        <ul className="divide-y divide-border">
          {live?.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-semibold text-ink">{c.title}</p>
                <p className="text-xs text-ink/60">{c.class_name} · {c.subject} · {formatWhen(c.starts_at)} · {c.teacher_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={c.meeting_url} target="_blank" rel="noreferrer" className={btn}>Open</a>
                <button aria-label="Remove class" onClick={() => remove("video_classes", c.id)} className="p-2 text-ink/50 hover:text-destructive"><Trash2 className="size-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Assignments sent" icon={<BookOpen className="size-5 text-brand" />}>
        {!work?.length && <p className="text-sm text-ink/50">No assignments yet.</p>}
        <ul className="divide-y divide-border">
          {work?.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-semibold text-ink">{w.title}</p>
                <p className="text-xs text-ink/60">{w.class_name}{classSize(w.class_name) ? ` (${classSize(w.class_name)} learners)` : ""} · {w.subject} · due {formatDate(w.due_date)} · {w.teacher_name}</p>
              </div>
              <button aria-label="Remove assignment" onClick={() => remove("assignments", w.id)} className="p-2 text-ink/50 hover:text-destructive"><Trash2 className="size-4" /></button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
