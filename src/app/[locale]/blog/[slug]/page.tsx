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
import { FinalCTA } from "@/components/sections/FinalCTA";
import { getAllSlugs, getAllPosts, getPostBySlug } from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dousocial.com";

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

  return (
    <>
      <ArticleSchema post={post} url={url} siteUrl={SITE_URL} />

      <Section spacing="lg">
        <Container>
          <Reveal className="mx-auto max-w-2xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-mute-500 transition hover:text-accent"
            >
              ← {t("back")}
            </Link>
            <p className="mt-8 text-xs uppercase tracking-wider text-mute-500">
              {formatDate(post.date, locale)} ·{" "}
              {t("readingTime", { minutes: post.readingMinutes })}
              {post.tags?.[0] ? ` · ${post.tags[0]}` : ""}
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-ink md:text-6xl">
              {post.title}
            </h1>
            <p className="mt-6 text-xl text-mute-600">{post.description}</p>
          </Reveal>
        </Container>
      </Section>

      <article className="border-t border-mute-100">
        <Container>
          <div className="mx-auto max-w-2xl pb-24 pt-16">
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

      {related.length > 0 && (
        <Section spacing="md" className="bg-mute-50">
          <Container>
            <h2 className="font-display text-3xl tracking-tight text-ink">
              {t("relatedTitle")}
            </h2>
            <ul className="mt-12 grid gap-12 md:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}` as never}
                    className="group block"
                  >
                    <p className="text-xs uppercase tracking-wider text-mute-500">
                      {t("readingTime", { minutes: p.readingMinutes })}
                    </p>
                    <h3 className="mt-3 font-display text-xl leading-tight tracking-tight text-ink transition group-hover:text-accent">
                      {p.title}
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
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
