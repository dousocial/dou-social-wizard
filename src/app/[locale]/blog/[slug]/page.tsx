import { use } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { mdxComponents } from "@/components/blog/MdxComponents";
import { ArticleSchema } from "@/components/blog/ArticleSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { getAllSlugs, getAllPosts, getPostBySlug } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  const all = await Promise.all(
    routing.locales.map(async (locale) => {
      const slugs = await getAllSlugs(locale);
      return slugs.map((slug) => ({ locale, slug }));
    })
  );
  return all.flat();
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(locale, slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: post.cover ? { images: [{ url: post.cover }] } : undefined,
  };
}

export default function BlogPostPage({
  params,
}: PageProps<"/[locale]/blog/[slug]">) {
  const { locale, slug } = use(params);
  setRequestLocale(locale);

  const post = use(getPostBySlug(locale, slug));
  if (!post) notFound();

  const all = use(getAllPosts(locale));
  const related = all.filter((p) => p.slug !== slug).slice(0, 3);

  const t = useTranslations("Blog");
  const url = `${SITE_URL}${locale === "tr" ? "" : `/${locale}`}/blog/${slug}`;
  const faqItems = extractFAQ(post.content);

  return (
    <>
      <ArticleSchema post={post} url={url} siteUrl={SITE_URL} />
      <BreadcrumbSchema
        locale={locale as "tr" | "en"}
        crumbs={[
          { name: "Ana Sayfa", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${slug}` },
        ]}
      />
      {faqItems.length > 0 && <FAQPageSchema items={faqItems} />}

      {/* ── Başlık ───────────────────────────────────────────────────── */}
      <Section spacing="hero" className="pb-0 md:pb-0">
        <Container>
          <Reveal className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-mute-400 transition hover:text-accent"
            >
              ← {t("back")}
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-mute-400">
              <span>{formatDate(post.date, locale)}</span>
              <span>·</span>
              <span>{post.readingMinutes} dk okuma</span>
              {post.tags?.map((tag) => (
                <span key={tag} className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mt-5 font-display text-4xl leading-[1.05] tracking-tight text-ink md:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            <p className="mt-5 text-xl leading-relaxed text-mute-500">
              {post.description}
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ── Kapak görseli ────────────────────────────────────────────── */}
      {post.cover && (
        <div className="mt-12 md:mt-16">
          <Container>
            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover}
                alt={post.title}
                className="w-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          </Container>
        </div>
      )}

      {/* ── İçerik ───────────────────────────────────────────────────── */}
      <article>
        <Container>
          <div className="mx-auto max-w-3xl py-16 md:py-24">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    rehypeSlug,
                    [rehypeAutolinkHeadings, { behavior: "wrap" }],
                  ],
                },
              }}
            />
          </div>
        </Container>
      </article>

      {/* ── İlgili yazılar ───────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="border-t border-mute-100 py-20 md:py-28">
          <Container>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Devamını oku
            </p>
            <h2 className="mt-4 font-display text-3xl tracking-tight text-ink">
              {t("relatedTitle")}
            </h2>
            <ul className="mt-12 grid gap-8 md:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}` as never} className="group block">
                    {p.cover ? (
                      <div className="aspect-[16/9] overflow-hidden rounded-xl bg-mute-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.cover}
                          alt={p.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] rounded-xl bg-ink" />
                    )}
                    <p className="mt-4 text-xs uppercase tracking-wider text-mute-400">
                      {formatDate(p.date, locale)} · {p.readingMinutes} dk
                    </p>
                    <h3 className="mt-2 font-display text-lg leading-tight tracking-tight text-ink transition group-hover:text-accent">
                      {p.title}
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <FinalCTA />
    </>
  );
}

function formatDate(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function extractFAQ(content: string): { q: string; a: string }[] {
  const sectionMatch = content.match(/##\s+S[ıi]kça Sorulan Sorular\s*([\s\S]*?)(?:\n##|$)/);
  if (!sectionMatch) return [];

  const section = sectionMatch[1];
  const items: { q: string; a: string }[] = [];
  const pattern = /\*\*([^*]+)\*\*\s*\n([\s\S]*?)(?=\n\*\*|$)/g;
  let match;

  while ((match = pattern.exec(section)) !== null) {
    const q = match[1].trim();
    const a = match[2].trim().replace(/\n+/g, " ");
    if (q && a) items.push({ q, a });
  }

  return items;
}
