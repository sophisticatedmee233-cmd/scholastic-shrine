import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, ShieldCheck, ArrowLeft } from "lucide-react";
import { Crest } from "@/components/site/Crest";
import studentsPhoto from "@/assets/hero-students.jpg";
import teacherPhoto from "@/assets/about-lab.jpg";
import campusPhoto from "@/assets/campus-aerial.jpg";

const entrances = {
  student: { label: "Student", icon: BookOpen, photo: studentsPhoto, welcome: "A new day. A new discovery.", message: "Welcome to your school community. Keep learning, stay curious, and make today count." },
  teacher: { label: "Teacher", icon: GraduationCap, photo: teacherPhoto, welcome: "Inspiring minds, every day.", message: "Welcome to the staff community. Thank you for the care and dedication you bring to every learner." },
  administrator: { label: "Administrator", icon: ShieldCheck, photo: campusPhoto, welcome: "Leading our school forward.", message: "Welcome to the school office. Your care helps our learners and school community thrive." },
};

export function SignInLayout({ role, children }: { role: keyof typeof entrances; children: ReactNode }) {
  const entrance = entrances[role];
  const Icon = entrance.icon;
  return (
    <main data-role={role} className="sign-in-entrance grid min-h-screen bg-paper lg:grid-cols-2">
      <section className="relative flex flex-col overflow-hidden bg-entrance text-entrance-foreground lg:min-h-screen">
        <img src={entrance.photo} alt="" className="absolute inset-0 hidden h-full w-full object-cover lg:block" />
        <div className="entrance-photo-overlay absolute inset-0 hidden lg:block" />
        <div className="relative flex flex-1 flex-col justify-between gap-12 p-6 sm:p-10 lg:p-12">
          <Link to="/" className="flex max-w-sm items-center gap-3">
            <Crest size="md" className="rounded-lg bg-entrance-foreground text-entrance" />
            <span className="font-display text-2xl leading-tight">Daniel's<br />Primary School</span>
          </Link>
          <div className="hidden max-w-md lg:block">
            <span className="inline-flex items-center gap-2 border-l-4 border-entrance-foreground pl-3 text-sm font-medium"><Icon className="size-5" />{entrance.label} entrance</span>
            <h2 className="mt-6 text-5xl leading-tight tracking-normal">{entrance.welcome}</h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-entrance-foreground/85">{entrance.message}</p>
          </div>
          <p className="hidden text-sm text-entrance-foreground/70 lg:block">Daniel's Primary School · {entrance.label} portal</p>
        </div>
      </section>
      <section className="flex min-w-0 flex-col px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
        <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-entrance"><ArrowLeft className="size-4" />Back to school</Link>
        <div className="mx-auto my-auto w-full min-w-0 max-w-sm py-8 lg:py-12 [&_h1]:break-words">
          <div className="mb-5 flex items-center gap-3 text-entrance">
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-entrance-soft"><Icon className="size-6" /></span>
            <p className="text-xs font-semibold uppercase tracking-normal">{entrance.label} entrance</p>
          </div>
          {children}
          <nav aria-label="Other sign-in entrances" className="mt-8 border-t border-border pt-5">
            <p className="mb-3 text-xs text-muted-foreground">Other school entrances</p>
            <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium">
              {role !== "student" && <Link to="/auth" className="text-entrance hover:underline">Student sign-in</Link>}
              {role !== "teacher" && <Link to="/auth/teacher" className="text-entrance hover:underline">Teacher sign-in</Link>}
              {role !== "administrator" && <Link to="/admin" className="text-entrance hover:underline">Administrator sign-in</Link>}
            </div>
          </nav>
        </div>
      </section>
    </main>
  );
}