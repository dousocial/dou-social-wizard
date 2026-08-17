import { siteConfig } from "@/config/site";
import { localizedUrl } from "@/lib/site";

type Locale = "tr" | "en";

const SERVICES = [
  "Meta Ads yönetimi",
  "Sosyal medya yönetimi",
  "İçerik üretimi",
  "Web tasarım",
  "Google Haritalar ve yerel SEO",
  "Marka stratejisi",
];

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
          ? "DOU Social | Denizli Dijital Pazarlama ve Meta Ads Ajansı"
          : "DOU Social | Digital Marketing and Meta Ads Agency",
      description: seo.description[locale],
      inLanguage: locale === "tr" ? "tr-TR" : "en-US",
      isPartOf: { "@id": `${localizedUrl("/", "tr")}#website` },
      about: { "@id": `${localizedUrl("/", "tr")}#professional-service` },
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
      "@id": `${localizedUrl("/", "tr")}#professional-service`,
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
      geo: {
        "@type": "GeoCoordinates",
        latitude: 37.7765,
        longitude: 29.0864,
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
        itemListElement: SERVICES.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service,
            provider: { "@id": `${localizedUrl("/", "tr")}#professional-service` },
            areaServed: "Türkiye",
          },
        })),
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
