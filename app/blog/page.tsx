import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock } from "lucide-react";
import {
  JsonLd,
  SectionHeading,
  SitePage,
} from "@/components/site/public-site";
import { ButtonLink } from "@/components/ui/button";
import { blogPosts } from "@/data/blog-posts";
import {
  blogSeoKeywords,
  brandLogoUrl,
  buildBlogJsonLd,
  buildBreadcrumbJsonLd,
  businessJsonLd,
  siteUrl,
  websiteJsonLd,
} from "@/lib/seo";

const pageUrl = `${siteUrl}/blog`;
const pageDescription =
  "Guides om batteritest, SoH og AVILOO til dig, der skal købe eller sælge en brugt elbil. Skrevet af EV-Check.dk, der udfører mobil batteritest på Sjælland.";

export const metadata: Metadata = {
  title: "Blog om batteritest af elbil",
  description: pageDescription,
  keywords: blogSeoKeywords,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Blog om batteritest af elbil | EV-Check.dk",
    description: pageDescription,
    url: pageUrl,
    siteName: "EV-Check.dk",
    locale: "da_DK",
    type: "website",
    images: [
      {
        url: brandLogoUrl,
        width: 1200,
        height: 630,
        alt: "EV-Check.dk blog om batteritest af elbil",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog om batteritest af elbil | EV-Check.dk",
    description: pageDescription,
    images: [brandLogoUrl],
  },
};

export default function BlogIndexPage() {
  const sortedPosts = [...blogPosts].sort(
    (a, b) =>
      new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime(),
  );

  return (
    <SitePage>
      <JsonLd
        data={[
          businessJsonLd,
          websiteJsonLd,
          buildBreadcrumbJsonLd([
            { name: "Forside", url: siteUrl },
            { name: "Blog", url: pageUrl },
          ]),
          buildBlogJsonLd(sortedPosts),
        ]}
      />

      <section className="px-4 pt-14 pb-4 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Blog"
            title="Guides om batteritest og brugt elbil"
            description="Alt du skal vide om SoH, AVILOO-batteritest og køb eller salg af brugt elbil, skrevet af EV-Check.dk. Vi kommer ud til dig med mobil batteritest på Sjælland."
          />
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2">
          {sortedPosts.map((post) => (
            <article
              key={post.slug}
              className="glass-card group flex flex-col overflow-hidden rounded-lg transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-950/8"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="relative block h-56 w-full overflow-hidden sm:h-64"
              >
                <Image
                  src={post.image.src}
                  alt={post.image.alt}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </Link>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.1em] text-sky-700 uppercase">
                  <time dateTime={post.datePublished}>
                    {new Date(post.datePublished).toLocaleDateString("da-DK", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  <span className="flex items-center gap-1 text-slate-400 normal-case">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readingTime}
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-bold text-slate-950">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition hover:text-sky-700"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-700 transition hover:text-sky-900"
                >
                  Læs artiklen
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="glass-shell mx-auto mt-12 max-w-7xl rounded-lg p-6 text-center sm:p-8">
          <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
            Klar til at få batteriet testet?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            EV-Check kommer ud til dig på Sjælland med AVILOO-baseret
            batteritest og en klar PDF-rapport samme dag.
          </p>
          <ButtonLink href="/book-tid" className="mt-6">
            <CalendarCheck className="h-4 w-4" />
            Book batteritest
          </ButtonLink>
        </div>
      </section>
    </SitePage>
  );
}
