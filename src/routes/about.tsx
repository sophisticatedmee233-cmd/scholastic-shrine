import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageIntro } from "@/components/site/SiteLayout";
import labImg from "@/assets/about-lab.jpg";
import aerialImg from "@/assets/campus-aerial.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Daniel's Primary School" },
      { name: "description", content: "Our history, values and leadership. Daniel's Primary School has nurtured learners in the Kiambu highlands since 1965." },
      { property: "og:title", content: "About Daniel's Primary School" },
      { property: "og:description", content: "History, values and leadership of Daniel's Primary School." },
    ],
  }),
  component: AboutPage,
});

const values = [
  { title: "Integrity", text: "We do the right thing, especially when no one is watching." },
  { title: "Excellence", text: "High expectations in the classroom, on the field and on stage." },
  { title: "Service", text: "Learners give back to Limuru through community projects every term." },
  { title: "Respect", text: "A safe, inclusive school where every voice matters." },
];

const leaders = [
  { name: "Mrs. Grace Wambui", role: "Principal" },
  { name: "Mr. Peter Kamau", role: "Deputy Principal, Academics" },
  { name: "Ms. Lydia Achieng", role: "Deputy Principal, Student Welfare" },
  { name: "Mr. Samuel Otieno", role: "Dean of Studies" },
];

function AboutPage() {
  return (
    <SiteLayout>
      <PageIntro eyebrow="About the school" title="Six decades of shaping scholars and citizens." lede="Founded in 1965 on the cool slopes of Limuru, we remain a proudly community-rooted school." />

      <section className="bg-cream py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow">Our story</p>
            <h2 className="mt-2 text-4xl text-ink">From a two-classroom start to 1,240 learners.</h2>
            <div className="mt-5 space-y-4 leading-relaxed text-ink/70">
              <p>Daniel's Primary School opened its gates in 1965 with two classrooms and thirty-eight learners. Today it is a mixed day and boarding school serving Junior School (Grade 7–9) and Senior School (Grade 10–12) under the Competency Based Curriculum.</p>
              <p>Our campus sits among the tea estates of Kiambu County — a setting that shapes our calm, disciplined culture and our commitment to environmental stewardship.</p>
            </div>
          </div>
          <div className="lg:col-span-5">
            <img src={labImg} alt="Learners in the chemistry laboratory" loading="lazy" width={1024} height={1024} className="aspect-square w-full rounded-2xl object-cover" />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-paper py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="eyebrow">Our values</p>
          <h2 className="mt-2 text-4xl text-ink">What we stand for.</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-cream p-6">
                <h3 className="text-xl text-brand">{v.title}</h3>
                <p className="mt-2 text-sm text-ink/60">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow">Leadership</p>
            <h2 className="mt-2 text-4xl text-ink">Meet the team.</h2>
            <ul className="mt-6 divide-y divide-border">
              {leaders.map((l) => (
                <li key={l.name} className="flex items-center gap-4 py-4">
                  <div className="grid size-11 place-items-center rounded-full bg-brand font-display font-semibold text-cream">
                    {(l.name.split(" ").slice(-1)[0] ?? l.name).charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{l.name}</p>
                    <p className="text-sm text-ink/60">{l.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <img src={aerialImg} alt="Aerial view of the campus" loading="lazy" width={1200} height={704} className="aspect-[12/7] w-full rounded-2xl object-cover" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
