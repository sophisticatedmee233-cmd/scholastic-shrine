import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SiteLayout, PageIntro } from "@/components/site/SiteLayout";
import { Step, FeeRow } from "./index";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Admissions — Daniel's Primary School" },
      { name: "description", content: "How to apply to Daniel's Primary School: entry requirements, key dates, fee structure and an online enquiry form." },
      { property: "og:title", content: "Admissions — Daniel's Primary School" },
      { property: "og:description", content: "Entry requirements, key dates, fees and enquiry form." },
    ],
  }),
  component: AdmissionsPage,
});

const inputCls = "mt-1 h-11 w-full rounded-lg border border-input bg-paper px-4 text-sm text-ink outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-ring";

function AdmissionsPage() {
  const [sent, setSent] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
    toast.success("Enquiry received. The registrar will call you within two working days.");
  }

  return (
    <SiteLayout>
      <PageIntro eyebrow="Admissions" title="Joining is simple." lede="Places open each January for Grade 7 and Grade 10. Apply online and our registrar will guide you through the transition." />

      <section className="bg-cream py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-2 text-4xl text-ink">Three steps to a place.</h2>
            <ol className="mt-6 space-y-3">
              <Step n={1} title="Submit the online application" text="with the learner's birth certificate and latest report." />
              <Step n={2} title="Attend the placement interview" text="and subject selection session." />
              <Step n={3} title="Confirm your place" text="and settle the first term's fees." />
            </ol>
            <h3 className="mt-10 text-2xl text-ink">Key dates 2027 intake</h3>
            <ul className="mt-4 divide-y divide-border text-sm">
              {[
                ["1 Oct 2026", "Applications open"],
                ["30 Nov 2026", "Applications close"],
                ["9–10 Dec 2026", "Placement interviews"],
                ["5 Jan 2027", "Term 1 begins"],
              ].map(([d, l]) => (
                <li key={d} className="flex justify-between py-3"><span className="font-semibold text-brand">{d}</span><span className="text-ink/70">{l}</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-brand p-8 text-cream">
            <p className="eyebrow">Fee structure (per term)</p>
            <div className="mt-5 divide-y divide-cream/15">
              <FeeRow label="Junior School (Grade 7–9)" value="KSh 34,000" />
              <FeeRow label="Senior School (Grade 10–12)" value="KSh 46,500" />
              <FeeRow label="Boarding supplement" value="KSh 22,000" />
              <FeeRow label="Admission fee (once)" value="KSh 5,000" />
            </div>
            <p className="mt-5 text-xs text-cream/60">Government capitation supported. Sibling &amp; hardship bursaries available. Pay via M-Pesa Paybill 522522.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-paper py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="eyebrow">Enquire</p>
          <h2 className="mt-2 text-4xl text-ink">Start your application.</h2>
          {sent ? (
            <div className="mt-8 rounded-2xl bg-cream p-6">
              <p className="font-display text-xl text-brand">Thank you — we've received your enquiry.</p>
              <p className="mt-2 text-sm text-ink/70">The registrar will call you within two working days. Meanwhile, explore <Link to="/academics" className="font-semibold text-brand underline-offset-4 hover:underline">our academics</Link>.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="text-xs uppercase tracking-wider text-ink/50">Parent / guardian name</span><input required className={inputCls} /></label>
              <label className="block"><span className="text-xs uppercase tracking-wider text-ink/50">Phone</span><input required type="tel" className={inputCls} placeholder="+254 7…" /></label>
              <label className="block"><span className="text-xs uppercase tracking-wider text-ink/50">Learner's name</span><input required className={inputCls} /></label>
              <label className="block"><span className="text-xs uppercase tracking-wider text-ink/50">Grade applying for</span>
                <select className={inputCls} defaultValue="Grade 7">
                  {["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"].map((g) => <option key={g}>{g}</option>)}
                </select>
              </label>
              <label className="block sm:col-span-2"><span className="text-xs uppercase tracking-wider text-ink/50">Message (optional)</span><textarea rows={4} className="mt-1 w-full rounded-lg border border-input bg-paper px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-ring" /></label>
              <button type="submit" className="pill-gold sm:col-span-2">Send enquiry</button>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
