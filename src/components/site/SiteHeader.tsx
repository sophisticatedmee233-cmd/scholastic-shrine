import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useSession } from "@/hooks/useSession";
import { Crest } from "./Crest";

const links = [
  { to: "/about", label: "About" },
  { to: "/academics", label: "Academics" },
  { to: "/admissions", label: "Admissions" },
  { to: "/news", label: "News" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-6">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Crest size="sm" />
          <div>
            <p className="font-display font-semibold leading-none text-ink">Daniel's Primary School</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-sage">Kenya</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-ink/80 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-brand" activeProps={{ className: "text-brand" }}>
              {l.label}
            </Link>
          ))}
          <Link to={user ? "/portal" : "/auth"} className="rounded-full bg-gold px-4 py-2 font-semibold text-ink">
            {user ? "My Portal" : "Student Portal"}
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded-full p-2 text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-cream px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-ink hover:bg-paper"
                activeProps={{ className: "text-brand" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to={user ? "/portal" : "/auth"}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-gold px-4 py-3 text-center font-semibold text-ink"
            >
              {user ? "My Portal" : "Student Portal"}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
