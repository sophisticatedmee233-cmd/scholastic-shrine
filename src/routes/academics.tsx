import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageIntro } from "@/components/site/SiteLayout";
import { StreamCard } from "./index";

export const Route = createFileRoute("/academics")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Academics — Daniel's Primary School" },
      { name: "description", content: "CBC-aligned Junior and Senior School programmes, STEM and Arts pathways, and co-curricular life at Daniel's Primary School." },
      { property: "og:title", content: "Academics at Daniel's Primary School" },
      { property: "og:description", content: "Junior School, Senior School pathways and co-curricular programmes." },
    ],
  }),
  component: AcademicsPage,
});

const subjects = {
  "Junior School (Grade 7–9)": ["Mathematics", "English", "Kiswahili", "Integrated Science", "Social Studies", "Pre-Technical Studies", "Agriculture", "Creative Arts", "CRE / IRE"],
  "STEM Pathway (Grade 10–12)": ["Mathematics", "Physics", "Chemistry", "Biology", "Geography", "Computer Science"],
  "Arts & Humanities Pathway": ["Literature in English", "History & Government", "CRE", "Business Studies", "Kiswahili Fasihi", "Music"],
};

const clubs = ["Debating Society", "Science & Robotics Club", "Choir & Music", "Rugby & Football", "Athletics", "Scouts", "Environmental Club", "Drama"];

function AcademicsPage() {
  return (
    <SiteLayout>
      <PageIntro eyebrow="Academics" title="A rigorous, CBC-aligned curriculum with room to grow." lede="Two pathways in Senior School, small classes and a teacher who knows every learner by name." />

      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-5 md:grid-cols-3">
            <StreamCard eyebrow="Junior School" title="Grade 7–9" text="Core subjects, life skills and early guidance counselling." />
            <StreamCard eyebrow="Senior School" title="STEM Cluster" text="Mathematics, Physics, Chemistry, Biology & Geography." dark />
            <StreamCard eyebrow="Senior School" title="Arts & Humanities" text="Literature, History, CRE, Business & Computer Science." />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-paper py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="eyebrow">Subjects offered</p>
          <h2 className="mt-2 text-4xl text-ink">What learners study.</h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {Object.entries(subjects).map(([group, list]) => (
              <div key={group}>
                <h3 className="text-xl text-brand">{group}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {list.map((s) => (
                    <li key={s} className="rounded-full border border-border bg-cream px-3 py-1.5 text-sm text-ink/80">{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Co-curricular</p>
            <h2 className="mt-2 text-4xl text-ink">Beyond the classroom.</h2>
            <p className="mt-4 text-ink/60">Every learner joins at least one club and one sport. Wednesday and Friday afternoons are reserved for games and societies.</p>
            <ul className="mt-6 grid grid-cols-2 gap-3">
              {clubs.map((c) => (
                <li key={c} className="flex items-center gap-2 text-sm text-ink/80">
                  <span className="size-1.5 rounded-full bg-gold" />{c}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-brand p-8 text-cream">
            <p className="eyebrow">School day</p>
            <div className="mt-5 divide-y divide-cream/15 text-sm">
              {[
                ["07:15", "Arrival & assembly"],
                ["08:00 – 10:00", "Lessons 1–3"],
                ["10:00 – 10:30", "Tea break"],
                ["10:30 – 12:30", "Lessons 4–6"],
                ["12:30 – 14:00", "Lunch & prep"],
                ["14:00 – 15:20", "Lessons 7–8 / Games"],
                ["15:30 – 16:30", "Clubs & remedial"],
              ].map(([t, a]) => (
                <div key={t} className="flex justify-between py-3">
                  <span className="font-mono text-gold">{t}</span>
                  <span className="text-cream/80">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
