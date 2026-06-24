import { localizedUrl, SITE_URL } from "@/lib/site";

interface Props {
  name: string;
  description: string;
  slug: string;
  locale: "tr" | "en";
}

export function ServiceSchema({ name, description, slug, locale }: Props) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: "DOU Social",
    },
    url: localizedUrl(`/hizmetler/${slug}`, locale),
    areaServed: { "@type": "Country", name: "Turkey" },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
