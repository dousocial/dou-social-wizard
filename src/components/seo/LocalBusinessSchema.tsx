interface Props {
  url: string;
}

export function LocalBusinessSchema({ url }: Props) {
  const data = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": `${url}#localbusiness`,
    name: "DOU Social — Denizli Reklam & Dijital Pazarlama Ajansı",
    alternateName: ["DOU Social", "DOU Dijital Reklam Ajansı Denizli", "Digital Outreach Utility"],
    image: `${url}/brand/dou-logo-dark.png`,
    url,
    telephone: "+905300845468",
    email: "info@dousocial.com",
    priceRange: "₺₺",
    currenciesAccepted: "TRY",
    paymentAccepted: "Cash, Credit Card, Bank Transfer",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Zafer Mah. Zafer Cd. No: 60/1",
      addressLocality: "Merkezefendi",
      addressRegion: "Denizli",
      postalCode: "20010",
      addressCountry: "TR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 37.7765,
      longitude: 29.0864,
    },
    areaServed: [
      {
        "@type": "City",
        name: "Denizli",
      },
      {
        "@type": "AdministrativeArea",
        name: "Merkezefendi",
      },
      {
        "@type": "AdministrativeArea",
        name: "Pamukkale",
      },
      {
        "@type": "Country",
        name: "Türkiye",
      },
    ],
    knowsAbout: [
      "Denizli Reklam Ajansı",
      "Denizli Sosyal Medya Yönetimi",
      "Meta Ads Reklam Yönetimi",
      "Google Reklamları ve SEO",
      "İçerik Üretimi ve Video Prodüksiyon",
      "E-Ticaret Büyüme Stratejileri",
      "Kurumsal Kimlik ve Web Tasarım",
      "Influencer Marketing",
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "09:00",
        closes: "18:30",
      },
    ],
    sameAs: [
      "https://www.instagram.com/dou.social",
      "https://www.linkedin.com/company/dou-dijital-marketing/",
      "https://www.youtube.com/@DouSocial",
      "https://www.facebook.com/profile.php?id=61587124940165",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
