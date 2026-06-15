import { use } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SEOLandingTemplate } from "@/components/seo/SEOLandingTemplate";

const SLUG = "dijital-pazarlama-ajansi";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dijital-pazarlama-ajansi">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: `SeoLanding.${SLUG}`,
  });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function Page({
  params,
}: PageProps<"/[locale]/dijital-pazarlama-ajansi">) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <SEOLandingTemplate slug={SLUG} />;
}
