import { use } from "react";
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

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    CASE_SLUGS.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projeler/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isCaseSlug(slug)) return {};
  const t = await getTranslations({
    locale,
    namespace: `Cases.items.${slug}`,
  });
  return {
    title: t("title"),
    description: t("summary"),
  };
}

export default function CaseDetailPage({
  params,
}: PageProps<"/[locale]/projeler/[slug]">) {
  const { locale, slug } = use(params);
  setRequestLocale(locale);

  if (!isCaseSlug(slug)) notFound();

  const t = use(getTranslations({ locale, namespace: `Cases.items.${slug}` }));

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
