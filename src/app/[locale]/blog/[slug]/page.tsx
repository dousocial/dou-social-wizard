import Image from "next/image";
import { MARKETING_SERVICES } from "@/lib/marketing-services";
import { use } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
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
import { localizedUrl, SITE_URL } from "@/lib/site";

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
  const currentLocale = locale === "en" ? "en" : "tr";
  const url = localizedUrl(`/blog/${slug}`, currentLocale);
  return {
    title: post.seoTitle ?? post.title,
    description: post.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      url,
      title: post.seoTitle ?? post.title,
      description: post.description,
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
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
  const related = all
    .filter((p) => p.slug !== slug)
    .sort(
      (a, b) =>
        Number(b.tags?.some((tag) => post.tags?.includes(tag))) -
        Number(a.tags?.some((tag) => post.tags?.includes(tag)))
    )
    .slice(0, 3);

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
              className="text-mute-400 hover:text-accent inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase transition"
            >
              ← {t("back")}
            </Link>

            <div className="text-mute-400 mt-8 flex flex-wrap items-center gap-2 text-xs tracking-wider uppercase">
              <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
              <span>·</span>
              {!post.author || post.author === "DOU Social" ? (
                <Link
                  href="/hakkimizda"
                  className="underline underline-offset-4"
                >
                  DOU Social
                </Link>
              ) : (
                <span>{post.author}</span>
              )}
              {post.updated &&
                !Number.isNaN(Date.parse(post.updated)) &&
                Date.parse(post.updated) > Date.parse(post.date) && (
                  <span>
                    {locale === "en" ? "Updated: " : "Güncellendi: "}
                    <time dateTime={post.updated}>
                      {formatDate(post.updated, locale)}
                    </time>
                  </span>
                )}
              <span>·</span>
              <span>{post.readingMinutes} dk okuma</span>
              {post.tags
                ?.filter(
                  (tag) =>
                    !MARKETING_SERVICES.some((service) => service.slug === tag)
                )
                .map((tag) => (
                  <span
                    key={tag}
                    className="bg-accent/10 text-accent rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase"
                  >
                    {tag}
                  </span>
                ))}
            </div>

            <h1 className="font-display text-ink mt-5 text-4xl leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            <p className="text-mute-500 mt-5 text-xl leading-relaxed">
              {post.description}
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ── Kapak görseli ────────────────────────────────────────────── */}
      {post.cover && (
        <div className="mt-12 md:mt-16">
          <Container>
            <div className="relative mx-auto aspect-video max-w-4xl overflow-hidden rounded-2xl">
              <Image
                src={post.cover}
                alt={post.title}
                className="w-full object-cover"
                fill
                sizes="(max-width: 1023px) 100vw, 896px"
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
        <section className="border-mute-100 border-t py-20 md:py-28">
          <Container>
            <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
              Devamını oku
            </p>
            <h2 className="font-display text-ink mt-4 text-3xl tracking-tight">
              {t("relatedTitle")}
            </h2>
            <ul className="mt-12 grid gap-8 md:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}` as never}
                    className="group block"
                  >
                    {p.cover ? (
                      <div className="bg-mute-100 relative aspect-[16/9] overflow-hidden rounded-xl">
                        <Image
                          src={p.cover}
                          alt={p.title}
                          fill
                          sizes="(max-width: 767px) 100vw, 33vw"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="bg-ink aspect-[16/9] rounded-xl" />
                    )}
                    <p className="text-mute-400 mt-4 text-xs tracking-wider uppercase">
                      {formatDate(p.date, locale)} · {p.readingMinutes} dk
                    </p>
                    <h3 className="font-display text-ink group-hover:text-accent mt-2 text-lg leading-tight tracking-tight transition">
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
  return new Date(date).toLocaleDateString(
    locale === "tr" ? "tr-TR" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}

function extractFAQ(content: string): { q: string; a: string }[] {
  const sectionMatch = content.match(
    /##\s+S[ıi]kça Sorulan Sorular\s*([\s\S]*?)(?:\n##|$)/
  );
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
