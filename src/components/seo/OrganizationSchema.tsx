import { SITE_URL } from "@/lib/site";

const NAV_LINKS = [
  { name: "Hizmetler",  url: `${SITE_URL}/hizmetler` },
  { name: "Projeler",   url: `${SITE_URL}/projeler` },
  { name: "Hakkımızda", url: `${SITE_URL}/hakkimizda` },
  { name: "Blog",       url: `${SITE_URL}/blog` },
  { name: "SSS",        url: `${SITE_URL}/sss` },
  { name: "İletişim",   url: `${SITE_URL}/iletisim` },
  { name: "Ücretsiz Analiz", url: `${SITE_URL}/audit` },
];

export function OrganizationSchema() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: "DOU Social",
    alternateName: "Digital Outreach Utility",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/dou-logo-dark.png`,
    image: `${SITE_URL}/brand/dou-logo-dark.png`,
    description:
      "Meta Ads, sosyal medya yönetimi, içerik üretimi, web tasarımı ve marka stratejisini tek elden yöneten Denizli merkezli dijital ajans.",
    email: "info@dousocial.com",
    telephone: "+905300845468",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Zafer Mah. Zafer Cd. No: 60/1",
      addressLocality: "Merkezefendi",
      addressRegion: "Denizli",
      addressCountry: "TR",
    },
    sameAs: [
      "https://www.instagram.com/dou.social",
      "https://www.linkedin.com/company/dou-dijital-marketing/",
      "https://www.youtube.com/@DouSocial",
      "https://www.facebook.com/profile.php?id=61587124940165",
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    name: "DOU Social",
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}#organization` },
    inLanguage: "tr-TR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const siteNav = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ana Navigasyon",
    itemListElement: NAV_LINKS.map((link, i) => ({
      "@type": "SiteNavigationElement",
      position: i + 1,
      name: link.name,
      url: link.url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNav) }}
      />
    </>
  );
}
