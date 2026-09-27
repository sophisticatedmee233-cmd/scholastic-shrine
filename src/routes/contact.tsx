import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SiteLayout, PageIntro } from "@/components/site/SiteLayout";
import { Info } from "./index";
import aerialImg from "@/assets/campus-aerial.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Daniel's Primary School" },
      { name: "description", content: "Visit, call or write to Daniel's Primary School in Kiambu County. Office hours, directions and a contact form." },
      { property: "og:title", content: "Contact Daniel's Primary School" },
      { property: "og:description", content: "Address, phone, email, office hours and campus tour bookings." },
    ],
  }),
  component: ContactPage,
});

const inputCls = "mt-1 h-11 w-full rounded-lg border border-input bg-paper px-4 text-sm text-ink outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-ring";

function ContactPage() {
  const [sent, setSent] = useState(false);
  function submit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
    toast.success("Message sent. We'll reply within one working day.");
  }
  return (
    <SiteLayout>
      <PageIntro eyebrow="Contact" title="Come and see us." lede="Campus tours run every Wednesday and Saturday morning. Book ahead and we'll have a prefect show you around." />
      <section className="bg-cream py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <dl className="space-y-4 text-ink/70">
              <Info label="Address" value="Limuru Town, off Limuru–Nakuru Road, Kiambu County, Kenya" />
              <Info label="Postal" value="P.O. Box 41 – 00217, Limuru" />
              <Info label="Phone" value="+254 700 118 224" />
              <Info label="Email" value="info@limurutown.ac.ke" />
              <Info label="Office hours" value="Mon–Fri · 7:30am – 4:30pm" />
            </dl>
            <img src={aerialImg} alt="Aerial view of the campus" loading="lazy" width={1200} height={704} className="mt-8 aspect-[12/7] w-full rounded-2xl object-cover" />
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-paper p-6 shadow-card md:p-8">
              <h2 className="text-2xl text-ink">Send us a message</h2>
              {sent ? (
                <p className="mt-4 text-ink/70">Thank you — your message is on its way to the school office.</p>
              ) : (
                <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="block"><span className="text-xs uppercase tracking-wider text-ink/50">Your name</span><input required className={inputCls} /></label>
                  <label className="block"><span className="text-xs uppercase tracking-wider text-ink/50">Email or phone</span><input required className={inputCls} /></label>
                  <label className="block sm:col-span-2"><span className="text-xs uppercase tracking-wider text-ink/50">I'd like to</span>
                    <select className={inputCls} defaultValue="Book a campus tour">
                      {["Book a campus tour", "Ask about admissions", "Ask about fees", "Something else"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </label>
                  <label className="block sm:col-span-2"><span className="text-xs uppercase tracking-wider text-ink/50">Message</span><textarea required rows={5} className="mt-1 w-full rounded-lg border border-input bg-paper px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-ring" /></label>
                  <button type="submit" className="pill-brand sm:col-span-2">Send message</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
