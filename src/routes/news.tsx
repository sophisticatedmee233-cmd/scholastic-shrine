import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageIntro } from "@/components/site/SiteLayout";
import { publicAnnouncementsQuery, formatDate } from "@/lib/portal.queries";
import sportImg from "@/assets/news-sport.jpg";
import scienceImg from "@/assets/news-science.jpg";
import cultureImg from "@/assets/news-culture.jpg";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "News & Announcements — Daniel's Primary School" },
      { name: "description", content: "The latest news, notices and events from Daniel's Primary School." },
      { property: "og:title", content: "News & Announcements — Daniel's Primary School" },
      { property: "og:description", content: "Latest news, notices and events from the campus." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(publicAnnouncementsQuery),
  errorComponent: () => (
    <SiteLayout><div className="mx-auto max-w-7xl px-6 py-20 text-ink/70">News is unavailable right now. Please try again shortly.</div></SiteLayout>
  ),
  notFoundComponent: () => <SiteLayout><div className="mx-auto max-w-7xl px-6 py-20">Not found.</div></SiteLayout>,
  component: NewsPage,
});

const images: Record<string, string> = { Sport: sportImg, Academics: scienceImg, Culture: cultureImg };

function NewsPage() {
  const { data } = useSuspenseQuery(publicAnnouncementsQuery);
  return (
    <SiteLayout>
      <PageIntro eyebrow="News & announcements" title="From the campus." lede="Notices, results and events across the school year." />
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-6">
          {data.length === 0 ? (
            <p className="text-ink/60">No news posted yet.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {data.map((n) => (
                <article key={n.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-paper">
                  {images[n.category] && <img src={images[n.category]} alt="" loading="lazy" width={992} height={672} className="aspect-[3/2] w-full object-cover" />}
                  <div className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-clay">{n.category} · {formatDate(n.published_at)}</p>
                    <h2 className="mt-1 text-xl text-ink">{n.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink/70">{n.body}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
