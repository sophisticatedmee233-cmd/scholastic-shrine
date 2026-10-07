import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { publicAnnouncementsQuery, formatDate } from "@/lib/portal.queries";
import heroImg from "@/assets/hero-students.jpg";
import labImg from "@/assets/about-lab.jpg";
import sportImg from "@/assets/news-sport.jpg";
import scienceImg from "@/assets/news-science.jpg";
import cultureImg from "@/assets/news-culture.jpg";
import aerialImg from "@/assets/campus-aerial.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Daniel's Primary School — Where Limuru's brightest futures begin" },
      { name: "description", content: "A CBC-aligned day and boarding school in Limuru, Kiambu County. Explore academics, admissions, news and the student portal." },
      { property: "og:title", content: "Daniel's Primary School" },
      { property: "og:description", content: "Nurturing minds in the hills of Kiambu since 1965. Academics, admissions, news and student portal." },
    ],
  }),
  component: HomePage,
});

const newsImages: Record<string, string> = { Sport: sportImg, Academics: scienceImg, Culture: cultureImg };

function HomePage() {
  const { data: notices } = useQuery(publicAnnouncementsQuery);
  const featured = (notices ?? []).filter((n) => newsImages[n.category]).slice(0, 3);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand">
        <div className="hero-glow absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:py-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="eyebrow">Nurturing minds since 1965</span>
            <h1 className="mt-4 text-5xl leading-[1.02] text-cream md:text-6xl">
              Where Limuru's <span className="italic text-gold">brightest</span> futures begin.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-cream/80">
              A community of learners, teachers and families rooted in the hills of Kiambu — delivering excellence from Junior School through KCSE.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/admissions" className="pill-gold">Apply for admission</Link>
              <Link to="/auth" className="pill-outline-light">Student login</Link>
            </div>
            <div className="mt-10 flex gap-8 text-cream">
              <Stat value="1,240" label="Enrolled learners" />
              <Stat value="96%" label="KCSE pass rate" />
              <Stat value="18:1" label="Class size" />
            </div>
          </div>
          <div className="lg:col-span-5">
            <img
              src={heroImg}
              alt="Daniel's Primary School students walking along a tree-lined campus path"
              width={1024}
              height={1280}
              className="aspect-[4/5] w-full rounded-2xl object-cover shadow-card ring-1 ring-cream/20"
            />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-cream py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <img src={labImg} alt="Students in a chemistry lesson" loading="lazy" width={1024} height={1024} className="aspect-square w-full rounded-xl object-cover" />
          </div>
          <div className="lg:col-span-7">
            <p className="eyebrow">About the school</p>
            <h2 className="mt-2 text-4xl text-ink">Discipline, curiosity and character — in equal measure.</h2>
            <p className="mt-5 leading-relaxed text-ink/70">
              Founded on the cool slopes of Limuru, we pair a rigorous CBC-aligned curriculum with pastoral care, sport and the arts. Our learners leave ready for university and ready for life.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Pillar title="Holistic growth" text="Academics, sport & arts in balance." />
              <Pillar title="Mentorship" text="Every learner has a guide." />
              <Pillar title="Community" text="Families at the centre." />
            </div>
            <Link to="/about" className="mt-6 inline-block text-sm font-semibold text-brand underline-offset-4 hover:underline">
              More about us →
            </Link>
          </div>
        </div>
      </section>

      {/* Academics */}
      <section className="border-y border-border bg-paper py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Academics</p>
              <h2 className="mt-2 text-4xl text-ink">Streams &amp; senior subjects</h2>
            </div>
            <p className="text-sm text-ink/50">CBC-aligned · KCSE preparation</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <StreamCard eyebrow="Junior School" title="Grade 7–9" text="Core subjects, life skills and early guidance counselling." />
            <StreamCard eyebrow="Senior School" title="STEM Cluster" text="Mathematics, Physics, Chemistry, Biology & Geography." dark />
            <StreamCard eyebrow="Senior School" title="Arts & Humanities" text="Literature, History, CRE, Business & Computer Science." />
          </div>
        </div>
      </section>

      {/* Admissions */}
      <section className="bg-cream py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Admissions</p>
            <h2 className="mt-2 text-4xl text-ink">Joining is simple.</h2>
            <p className="mt-4 text-ink/60">Places open each January. Apply online and our registrar will guide you through the transition.</p>
            <ol className="mt-6 space-y-3">
              <Step n={1} title="Submit the online application" text="with the learner's birth certificate." />
              <Step n={2} title="Attend the placement interview" text="and subject selection session." />
              <Step n={3} title="Confirm your place" text="and settle the first term's fees." />
            </ol>
            <Link to="/admissions" className="pill-brand mt-7">Start your application</Link>
          </div>
          <div className="rounded-2xl bg-brand p-8 text-cream">
            <p className="eyebrow">Fee structure (per term)</p>
            <div className="mt-5 divide-y divide-cream/15">
              <FeeRow label="Junior School (Grade 7–9)" value="KSh 34,000" />
              <FeeRow label="Senior School (Grade 10–12)" value="KSh 46,500" />
              <FeeRow label="Boarding supplement" value="KSh 22,000" />
            </div>
            <p className="mt-5 text-xs text-cream/60">Government capitation supported. Sibling &amp; hardship bursaries available.</p>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="border-y border-border bg-paper py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">News &amp; announcements</p>
              <h2 className="mt-2 text-4xl text-ink">From the campus</h2>
            </div>
            <Link to="/news" className="text-sm font-semibold text-brand underline-offset-4 hover:underline">All news →</Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featured.map((n) => (
              <article key={n.id} className="overflow-hidden rounded-2xl border border-border bg-cream">
                <img src={newsImages[n.category]} alt="" loading="lazy" width={992} height={672} className="aspect-[3/2] w-full object-cover" />
                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-clay">{n.category} · {formatDate(n.published_at)}</p>
                  <h3 className="mt-1 text-lg text-ink">{n.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-ink/60">{n.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Portal CTA */}
      <section className="bg-ink py-20 text-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow">Student portal</p>
            <h2 className="mt-2 text-4xl">Sign in to your dashboard.</h2>
            <p className="mt-4 text-sm text-cream/60">Access grades, your timetable, fee statements and school announcements in one place.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/auth" className="pill-gold">Log in to the portal</Link>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-cream p-6 text-ink">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-brand font-display font-semibold text-cream">JM</div>
                  <div>
                    <p className="font-display font-semibold">Janelle Mwangi</p>
                    <p className="text-xs text-ink/50">Grade 10 · STEM cluster</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sage">Term 2</span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <Tile eyebrow="Term average" value="84.2%" note="B+ · up 3.1%" dark />
                <Tile eyebrow="Attendance" value="98%" note="3 days absent" />
                <Tile eyebrow="Fees balance" value="KSh 8,500" note="Due 12 Mar" clay />
                <Tile eyebrow="Announcements" value="4 new" note="1 urgent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-cream py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow">Contact</p>
            <h2 className="mt-2 text-4xl text-ink">Come and see us.</h2>
            <dl className="mt-6 space-y-4 text-ink/70">
              <Info label="Address" value="Limuru Town, Kiambu County, Kenya" />
              <Info label="Phone" value="+254 700 118 224" />
              <Info label="Email" value="info@limurutown.ac.ke" />
              <Info label="Office hours" value="Mon–Fri · 7:30am – 4:30pm" />
            </dl>
            <Link to="/contact" className="pill-brand mt-7">Book a campus tour</Link>
          </div>
          <div className="lg:col-span-7">
            <img src={aerialImg} alt="Aerial view of the Daniel's Primary School campus among tea farms" loading="lazy" width={1200} height={704} className="aspect-[12/7] w-full rounded-2xl object-cover" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl">{value}</p>
      <p className="text-xs uppercase tracking-wider text-cream/60">{label}</p>
    </div>
  );
}

function Pillar({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-paper/70 p-4">
      <p className="font-semibold text-brand">{title}</p>
      <p className="mt-1 text-sm text-ink/60">{text}</p>
    </div>
  );
}

export function StreamCard({ eyebrow, title, text, dark }: { eyebrow: string; title: string; text: string; dark?: boolean }) {
  return (
    <div className={dark ? "rounded-2xl bg-brand p-6 text-cream" : "rounded-2xl border border-border bg-cream p-6"}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">{eyebrow}</p>
      <h3 className={`mt-1 text-xl ${dark ? "" : "text-ink"}`}>{title}</h3>
      <p className={`mt-2 text-sm ${dark ? "text-cream/70" : "text-ink/60"}`}>{text}</p>
    </div>
  );
}

export function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <li className="flex gap-4">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-cream">{n}</span>
      <p className="text-ink/70"><span className="font-semibold text-ink">{title}</span> {text}</p>
    </li>
  );
}

export function FeeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3">
      <span className="text-cream/80">{label}</span>
      <span className="font-display font-semibold">{value}</span>
    </div>
  );
}

function Tile({ eyebrow, value, note, dark, clay }: { eyebrow: string; value: string; note: string; dark?: boolean; clay?: boolean }) {
  return (
    <div className={dark ? "rounded-xl bg-brand p-4 text-cream" : "rounded-xl border border-border bg-cream p-4"}>
      <p className={`text-[11px] uppercase tracking-wider ${dark ? "text-gold" : "text-sage"}`}>{eyebrow}</p>
      <p className={`mt-1 font-display text-2xl ${clay ? "text-clay" : ""}`}>{value}</p>
      <p className={`text-[10px] ${dark ? "text-cream/60" : "text-ink/50"}`}>{note}</p>
    </div>
  );
}

export function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-sage">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
