import { SITE_URL } from "@/lib/site";
import { siteConfig } from "@/config/site";

const NAV_LINKS = [
  { name: "Hizmetler", url: `${SITE_URL}/hizmetler` },
  { name: "Projeler", url: `${SITE_URL}/projeler` },
  { name: "Hakkımızda", url: `${SITE_URL}/hakkimizda` },
  { name: "Blog", url: `${SITE_URL}/blog` },
  { name: "SSS", url: `${SITE_URL}/sss` },
  { name: "İletişim", url: `${SITE_URL}/iletisim` },
  { name: "Ücretsiz Analiz", url: `${SITE_URL}/dijital-checkup` },
];

export function OrganizationSchema({
  locale = "tr",
}: {
  locale?: "tr" | "en";
}) {
  const { brand, contact, social, seo } = siteConfig;
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: brand.name,
    alternateName: brand.alternateName,
    url: SITE_URL,
    logo: `${SITE_URL}${brand.logo.dark}`,
    image: `${SITE_URL}${brand.logo.dark}`,
    description: seo.description[locale],
    email: contact.email,
    telephone: contact.phoneTel,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address.street,
      addressLocality: contact.address.district,
      addressRegion: contact.address.city,
      addressCountry: contact.address.country,
    },
    sameAs: [
      social.instagram,
      social.linkedin,
      social.youtube,
      social.facebook,
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    name: brand.name,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}#organization` },
    inLanguage: ["tr-TR", "en-US"],
  };

  const siteNav = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ana Navigasyon",
    itemListElement: NAV_LINKS.map((link, i) => ({
      "@type": "SiteNavigationElement",
      position: i + 1,
      name: link.name,
      url:
        locale === "en"
          ? link.url.replace(SITE_URL, `${SITE_URL}/en`)
          : link.url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organization).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(website).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(siteNav).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
