import { use } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

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
  const t = useTranslations("Blog");

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Section spacing="hero">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("eyebrow")}
            </p>
            <h1
              className="mt-6 font-display leading-[1.05] tracking-tight text-ink"
              style={{ fontSize: "var(--text-6xl)" }}
            >
              {t("heroTitle")}
            </h1>
            <p
              className="mt-6 max-w-xl text-mute-600"
              style={{ fontSize: "var(--text-lg)" }}
            >
              {t("heroLead")}
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ── İçerik ───────────────────────────────────────────────────── */}
      <Section spacing="md" className="border-t border-mute-100">
        <Container>
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
            <p className="mt-5 max-w-md text-mute-500" style={{ fontSize: "var(--text-lg)" }}>
              Dijital pazarlama, sosyal medya ve marka stratejisi üzerine içeriklerimizi en kısa sürede burada bulabileceksiniz.
            </p>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
