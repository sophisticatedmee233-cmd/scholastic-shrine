import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageIntro({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <section className="relative overflow-hidden bg-brand">
      <div className="hero-glow absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl leading-[1.05] text-cream md:text-5xl">{title}</h1>
        {lede && <p className="mt-5 max-w-xl text-lg text-cream/80">{lede}</p>}
      </div>
    </section>
  );
}
