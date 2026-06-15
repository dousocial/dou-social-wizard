import { SITE_URL } from "@/lib/site";

export function OrganizationSchema() {
  const data = {
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
