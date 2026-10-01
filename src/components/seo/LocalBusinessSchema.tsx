import { siteConfig } from "@/config/site";

interface Props {
  url: string;
}

export function LocalBusinessSchema({ url }: Props) {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${url}#organization`,
    name: "DOU Social",
    image: `${url}/brand/dou-logo-dark.png`,
    url,
    telephone: siteConfig.contact.phoneTel,
    email: siteConfig.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Zafer Mah. Zafer Cd. No: 60/1",
      addressLocality: "Merkezefendi",
      addressRegion: "Denizli",
      addressCountry: "TR",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
