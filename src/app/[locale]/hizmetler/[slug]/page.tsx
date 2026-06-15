import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SERVICE_SLUGS, isServiceSlug } from "@/lib/services";
import { alternatesFor } from "@/lib/site";
import { ServiceHero } from "@/components/sections/ServiceHero";
import { ServiceProblem } from "@/components/sections/ServiceProblem";
import { ServiceProcess } from "@/components/sections/ServiceProcess";
import { ServiceDeliverables } from "@/components/sections/ServiceDeliverables";
import { ServiceFAQ } from "@/components/sections/ServiceFAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { ServiceSchema } from "@/components/seo/ServiceSchema";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    SERVICE_SLUGS.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/hizmetler/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isServiceSlug(slug)) return {};
  const t = await getTranslations({
    locale,
    namespace: `ServicesDetail.${slug}`,
  });
  return {
    title: t("title"),
    description: t("lead"),
    alternates: alternatesFor(`/hizmetler/${slug}`),
  };
}

export default async function ServiceDetailPage({
  params,
}: PageProps<"/[locale]/hizmetler/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!isServiceSlug(slug)) notFound();
  const index = SERVICE_SLUGS.indexOf(slug);

  const t = await getTranslations({
    locale,
    namespace: `ServicesDetail.${slug}`,
  });
  const tHub = await getTranslations({ locale, namespace: "ServicesHub" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });

  const faqItems = t.raw("faq.items") as { q: string; a: string }[];
  const serviceTitle = t("title");
  const serviceDesc = t("lead");

  return (
    <>
      <ServiceSchema
        name={serviceTitle}
        description={serviceDesc}
        slug={slug}
      />
      <FAQPageSchema items={faqItems} />
      <BreadcrumbSchema
        locale={locale as "tr" | "en"}
        crumbs={[
          { name: "DOU Social", path: "/" },
          { name: tNav("services"), path: "/hizmetler" },
          { name: tHub(`items.${slug}.title`), path: `/hizmetler/${slug}` },
        ]}
      />

      <ServiceHero slug={slug} index={index} />
      <ServiceProblem slug={slug} />
      <ServiceProcess slug={slug} />
      <ServiceDeliverables slug={slug} />
      <ServiceFAQ slug={slug} />
      <FinalCTA />
    </>
  );
}
