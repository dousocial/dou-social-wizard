import { siteConfig } from "@/config/site";
import { MARKETING_SERVICES } from "@/lib/marketing-services";
import { localizedUrl } from "@/lib/site";

type Locale = "tr" | "en";

const SERVICES = {
  tr: [
    "Sosyal medya yönetimi",
    "İçerik üretimi",
    "Web tasarım",
    "Google Haritalar ve yerel SEO",
    "Marka stratejisi",
  ],
  en: [
    "Social media management",
    "Content production",
    "Web design",
    "Google Maps and local SEO",
    "Brand strategy",
  ],
};

export function HomePageSchema({ locale }: { locale: Locale }) {
  const url = localizedUrl("/", locale);
  const { brand, contact, social, seo } = siteConfig;

  const graph = [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name:
        locale === "tr"
          ? "Denizli Reklam ve Sosyal Medya Ajansı"
          : "DOU Social | Digital Marketing and Meta Ads Agency",
      description: seo.description[locale],
      inLanguage: locale === "tr" ? "tr-TR" : "en-US",
      isPartOf: { "@id": `${localizedUrl("/", "tr")}#website` },
      about: { "@id": `${localizedUrl("/", "tr")}#organization` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${localizedUrl("/", "tr")}${brand.logo.dark}`,
      },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "[data-geo-summary]"],
      },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${localizedUrl("/", "tr")}#organization`,
      name: brand.name,
      alternateName: brand.alternateName,
      description: seo.description.tr,
      url: localizedUrl("/", "tr"),
      image: `${localizedUrl("/", "tr")}${brand.logo.dark}`,
      telephone: contact.phoneTel,
      email: contact.email,
      priceRange: "$$",
      areaServed: [
        { "@type": "City", name: "Denizli" },
        { "@type": "Country", name: "Türkiye" },
      ],
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
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Dijital büyüme hizmetleri",
        itemListElement: [
          ...SERVICES[locale].map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: service,
              provider: { "@id": `${localizedUrl("/", "tr")}#organization` },
              areaServed: "Türkiye",
            },
          })),
          ...MARKETING_SERVICES.map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              "@id": `${localizedUrl(`/${service.slug}`, locale)}#service`,
              name: (locale === "en" ? service.en : service.tr).title,
              url: localizedUrl(`/${service.slug}`, locale),
              provider: { "@id": `${localizedUrl("/", "tr")}#organization` },
              areaServed: service.slug.startsWith("denizli-")
                ? "Denizli"
                : "Türkiye",
            },
          })),
        ],
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }),
      }}
    />
  );
}
