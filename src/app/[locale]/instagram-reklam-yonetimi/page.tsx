import { use } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SEOLandingTemplate } from "@/components/seo/SEOLandingTemplate";

const SLUG = "instagram-reklam-yonetimi";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/instagram-reklam-yonetimi">): Promise<Metadata> {
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
}: PageProps<"/[locale]/instagram-reklam-yonetimi">) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <SEOLandingTemplate slug={SLUG} />;
}
