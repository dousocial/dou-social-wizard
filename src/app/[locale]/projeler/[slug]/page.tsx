import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { CASE_SLUGS, isCaseSlug } from "@/lib/cases";
import { CaseCover } from "@/components/sections/CaseCover";
import { CaseChallenge } from "@/components/sections/CaseChallenge";
import { CaseApproach } from "@/components/sections/CaseApproach";
import { CaseResults } from "@/components/sections/CaseResults";
import { CaseGallery } from "@/components/sections/CaseGallery";
import { CaseRelated } from "@/components/sections/CaseRelated";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { CaseStudySchema } from "@/components/seo/CaseStudySchema";
import { CaseDetailDB, type DBProject } from "@/components/cases/CaseDetailDB";
import { createClient } from "@supabase/supabase-js";

async function getProjectFromDB(slug: string, locale: string): Promise<DBProject | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("locale", locale)
      .eq("is_published", true)
      .single();
    return data ?? null;
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    CASE_SLUGS.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projeler/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;

  if (isCaseSlug(slug)) {
    const t = await getTranslations({ locale, namespace: `Cases.items.${slug}` });
    return { title: t("title"), description: t("summary") };
  }

  const project = await getProjectFromDB(slug, locale);
  if (!project) return {};
  return {
    title: project.seo_title ?? project.title,
    description: project.summary,
    openGraph: project.cover_image ? { images: [{ url: project.cover_image }] } : undefined,
  };
}

export default async function CaseDetailPage({
  params,
}: PageProps<"/[locale]/projeler/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // ── i18n-based (existing) projects ──────────────────────────────────────
  if (isCaseSlug(slug)) {
    const t = await getTranslations({ locale, namespace: `Cases.items.${slug}` });

    return (
      <>
        <CaseStudySchema
          slug={slug}
          title={t("title")}
          summary={t("summary")}
          locale={locale as "tr" | "en"}
        />
        <BreadcrumbSchema
          locale={locale as "tr" | "en"}
          crumbs={[
            { name: "Ana Sayfa", path: "/" },
            { name: "Projeler", path: "/projeler" },
            { name: t("title"), path: `/projeler/${slug}` },
          ]}
        />
        <CaseCover slug={slug} />
        <CaseChallenge slug={slug} />
        <CaseApproach slug={slug} />
        <CaseResults slug={slug} />
        <CaseGallery slug={slug} />
        <CaseRelated slug={slug} />
        <FinalCTA />
      </>
    );
  }

  // ── Supabase-based (new) projects ────────────────────────────────────────
  const project = await getProjectFromDB(slug, locale);
  if (!project) notFound();

  return <CaseDetailDB project={project} locale={locale} />;
}
