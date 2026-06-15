import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/sections/LegalPage";
import { alternatesFor } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/kullanim-kosullari">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Terms" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: alternatesFor("/kullanim-kosullari"),
  };
}

export default async function TermsPage({
  params,
}: PageProps<"/[locale]/kullanim-kosullari">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage namespace="Terms" />;
}
