import { use } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { getAllPosts } from "@/lib/blog";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/blog">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function BlogHubPage({ params }: PageProps<"/[locale]/blog">) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const posts = use(getAllPosts(locale));

  return (
    <>
      <Section spacing="hero">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Blog
            </p>
            <h1
              className="mt-6 font-display leading-[1.05] tracking-tight text-ink"
              style={{ fontSize: "var(--text-6xl)" }}
            >
              Dijital pazarlamada rehberiniz.
            </h1>
            <p
              className="mt-6 max-w-xl text-mute-600"
              style={{ fontSize: "var(--text-lg)" }}
            >
              Meta Ads, sosyal medya ve marka stratejisi üzerine veri odaklı içerikler.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section spacing="md" className="border-t border-mute-100">
        <Container>
          {posts.length === 0 ? (
            <Reveal className="flex flex-col items-center py-24 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                Çok Yakında
              </span>
              <h2
                className="mt-8 font-display font-bold tracking-tight text-ink"
                style={{ fontSize: "var(--text-5xl)" }}
              >
                Blog yazılarımız hazırlanıyor.
              </h2>
            </Reveal>
          ) : (
            <Reveal stagger className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <RevealItem key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}` as never}
                    className="group flex flex-col"
                  >
                    {/* Cover görseli */}
                    {post.cover ? (
                      <div className="aspect-[16/9] overflow-hidden rounded-xl bg-mute-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.cover}
                          alt={post.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] overflow-hidden rounded-xl bg-ink">
                        <div className="flex h-full items-end p-7">
                          <span
                            className="select-none font-display font-bold leading-none text-paper/10 transition-colors duration-500 group-hover:text-accent/30"
                            style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)" }}
                          >
                            {post.tags?.[0] ?? "Blog"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Metin */}
                    <div className="mt-5 flex flex-1 flex-col">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-mute-400">
                        <span>{formatDate(post.date, locale)}</span>
                        <span>·</span>
                        <span>{post.readingMinutes} dk okuma</span>
                        {post.tags?.[0] && (
                          <>
                            <span>·</span>
                            <span className="text-accent">{post.tags[0]}</span>
                          </>
                        )}
                      </div>
                      <h2
                        className="mt-3 font-display leading-tight tracking-tight text-ink transition-colors duration-200 group-hover:text-accent"
                        style={{ fontSize: "var(--text-xl)" }}
                      >
                        {post.title}
                      </h2>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-mute-500">
                        {post.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-accent">
                        Oku
                        <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" aria-hidden>
                          <path d="M1 7h12m0 0L8 2m5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </RevealItem>
              ))}
            </Reveal>
          )}
        </Container>
      </Section>

      <FinalCTA />
    </>
  );
}

function formatDate(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
