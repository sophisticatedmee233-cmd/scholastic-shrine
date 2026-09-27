import { Link } from "@tanstack/react-router";
import { Crest } from "./Crest";

export function SiteFooter() {
  return (
    <footer className="bg-ink py-10 text-cream/70">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <div className="flex items-center gap-3">
          <Crest size="sm" className="size-8 text-xs" />
          <p className="font-display font-semibold text-cream">Daniel's Primary School</p>
        </div>
        <p className="text-center text-xs">© 2026 Daniel's Primary School · CBC-aligned · Registered with the Ministry of Education</p>
        <div className="flex gap-5 text-xs">
          <Link to="/about" className="hover:text-gold">About</Link>
          <Link to="/auth" className="hover:text-gold">Portal</Link>
          <Link to="/contact" className="hover:text-gold">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
