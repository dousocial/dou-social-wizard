import Image from "next/image";
import { localizedUrl } from "@/lib/site";
import { routing } from "@/i18n/routing";
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
  const counts = await Promise.all(
    routing.locales.map(async (language) => ({
      language,
      count: (await getAllPosts(language)).length,
    }))
  );
  const languages = Object.fromEntries(
    counts
      .filter(({ count }) => count > 0)
      .map(({ language }) => [
        language === "tr" ? "tr-TR" : "en-US",
        localizedUrl("/blog", language),
      ])
  );
  return {
    alternates: {
      canonical: localizedUrl("/blog", locale as "tr" | "en"),
      languages,
    },
    robots: {
      index: counts.some((item) => item.language === locale && item.count > 0),
      follow: true,
    },
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
            <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
              Blog
            </p>
            <h1
              className="font-display text-ink mt-6 leading-[1.05] tracking-tight"
              style={{ fontSize: "var(--text-6xl)" }}
            >
              {locale === "en"
                ? "Your guide to digital marketing."
                : "Dijital pazarlamada rehberiniz."}
            </h1>
            <p
              className="text-mute-600 mt-6 max-w-xl"
              style={{ fontSize: "var(--text-lg)" }}
            >
              {locale === "en"
                ? "Guides to advertising, social media and event production."
                : "Google Ads, Meta, Instagram, reklam yönetimi ve Denizli çekim hizmetleri için uygulama rehberleri."}
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section spacing="md" className="border-mute-100 border-t">
        <Container>
          {posts.length === 0 ? (
            <Reveal className="flex flex-col items-center py-24 text-center">
              <span className="border-accent/30 bg-accent/5 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
                <span className="bg-accent h-1.5 w-1.5 animate-pulse rounded-full" />
                {locale === "en" ? "Coming soon" : "Çok Yakında"}
              </span>
              <h2
                className="font-display text-ink mt-8 font-bold tracking-tight"
                style={{ fontSize: "var(--text-5xl)" }}
              >
                {locale === "en"
                  ? "Our articles are being prepared."
                  : "Blog yazılarımız hazırlanıyor."}
              </h2>
            </Reveal>
          ) : (
            <Reveal
              stagger
              className="grid gap-10 md:grid-cols-2 lg:grid-cols-3"
            >
              {posts.map((post) => (
                <RevealItem key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}` as never}
                    className="group flex flex-col"
                  >
                    {/* Cover görseli */}
                    {post.cover ? (
                      <div className="bg-mute-100 relative aspect-[16/9] overflow-hidden rounded-xl">
                        <Image
                          src={post.cover}
                          alt={post.title}
                          fill
                          sizes="(max-width: 767px) 100vw, 33vw"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="bg-ink aspect-[16/9] overflow-hidden rounded-xl">
                        <div className="flex h-full items-end p-7">
                          <span
                            className="font-display text-paper/10 group-hover:text-accent/30 leading-none font-bold transition-colors duration-500 select-none"
                            style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)" }}
                          >
                            {post.tags?.[0] ?? "Blog"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Metin */}
                    <div className="mt-5 flex flex-1 flex-col">
                      <div className="text-mute-400 flex items-center gap-2 text-xs tracking-wider uppercase">
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
                        className="font-display text-ink group-hover:text-accent mt-3 leading-tight tracking-tight transition-colors duration-200"
                        style={{ fontSize: "var(--text-xl)" }}
                      >
                        {post.title}
                      </h2>
                      <p className="text-mute-500 mt-2 flex-1 text-sm leading-relaxed">
                        {post.description}
                      </p>
                      <span className="text-accent mt-4 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase">
                        Oku
                        <svg
                          viewBox="0 0 14 14"
                          className="h-3 w-3"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M1 7h12m0 0L8 2m5 5-5 5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
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
  return new Date(date).toLocaleDateString(
    locale === "tr" ? "tr-TR" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}
