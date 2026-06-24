import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/sections/LegalPage";
import { alternatesFor } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/gizlilik-politikasi">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: alternatesFor("/gizlilik-politikasi", locale as "tr" | "en"),
  };
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/gizlilik-politikasi">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage namespace="Privacy" />;
}
