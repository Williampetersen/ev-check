import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck, Clock } from "lucide-react";
import {
  FaqSection,
  JsonLd,
  SitePage,
} from "@/components/site/public-site";
import { ButtonLink } from "@/components/ui/button";
import { blogPosts, getBlogPost, type BlogBlock } from "@/data/blog-posts";
import {
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  businessJsonLd,
  siteUrl,
  websiteJsonLd,
} from "@/lib/seo";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    return { title: "Artikel ikke fundet | EV-Check.dk" };
  }

  const pageUrl = `${siteUrl}/blog/${post.slug}`;
  const imageUrl = `${siteUrl}${post.image.src}`;
  const socialTitle = `${post.metaTitle} | EV-Check.dk`;

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: socialTitle,
      description: post.metaDescription,
      url: pageUrl,
      siteName: "EV-Check.dk",
      locale: "da_DK",
      type: "article",
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: post.metaDescription,
      images: [imageUrl],
    },
  };
}

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[æ]/g, "ae")
    .replace(/[ø]/g, "oe")
    .replace(/[å]/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function BlockRenderer({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          id={slugifyHeading(block.text)}
          className="mt-10 scroll-mt-28 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
        >
          {block.text}
        </h2>
      );
    case "p":
      return (
        <p className="mt-4 text-base leading-7 text-slate-600">
          {block.text}
        </p>
      );
    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag
          className={
            block.ordered
              ? "mt-4 list-decimal space-y-2 pl-5 text-base leading-7 text-slate-600"
              : "mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-slate-600"
          }
        >
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ListTag>
      );
    }
    case "table":
      return (
        <div className="glass-card mt-5 overflow-x-auto rounded-lg p-2">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                {block.headers.map((header) => (
                  <th
                    key={header}
                    className="border-b border-sky-100 px-4 py-3 font-bold text-slate-950"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="odd:bg-white/40">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border-b border-sky-50 px-4 py-3 text-slate-600"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout":
      return (
        <div className="glass-shell mt-8 rounded-lg p-5 sm:p-6">
          <p className="text-sm font-bold tracking-[0.14em] text-sky-700 uppercase">
            {block.title}
          </p>
          <p className="mt-2 text-base leading-7 text-slate-700">
            {block.text}
          </p>
          <ButtonLink href="/book-tid" className="mt-5">
            <CalendarCheck className="h-4 w-4" />
            Book batteritest
          </ButtonLink>
        </div>
      );
    default:
      return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const pageUrl = `${siteUrl}/blog/${post.slug}`;
  const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug);

  return (
    <SitePage>
      <JsonLd
        data={[
          businessJsonLd,
          websiteJsonLd,
          buildBreadcrumbJsonLd([
            { name: "Forside", url: siteUrl },
            { name: "Blog", url: `${siteUrl}/blog` },
            { name: post.title, url: pageUrl },
          ]),
          buildBlogPostingJsonLd(post),
          buildFaqJsonLd(post.faqs),
        ]}
      />

      <article className="px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-20">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 transition hover:text-sky-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Tilbage til bloggen
          </Link>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-semibold tracking-[0.1em] text-sky-700 uppercase">
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

          <div className="relative mt-8 h-64 w-full overflow-hidden rounded-lg shadow-xl shadow-sky-950/10 sm:h-96">
            <Image
              src={post.image.src}
              alt={post.image.alt}
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>

          <div className="mt-8">
            {post.blocks.map((block, index) => (
              <BlockRenderer key={index} block={block} />
            ))}
          </div>
        </div>
      </article>

      <FaqSection
        eyebrow="Spørgsmål"
        title="Ofte stillede spørgsmål"
        description="Kort svar på det, læsere typisk spørger om i forlængelse af denne artikel."
        items={post.faqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        }))}
      />

      <section className="px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
            Flere artikler fra EV-Check
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="glass-card group overflow-hidden rounded-lg transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-950/8"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={related.image.src}
                    alt={related.image.alt}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-bold text-slate-950 transition group-hover:text-sky-700">
                    {related.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SitePage>
  );
}
