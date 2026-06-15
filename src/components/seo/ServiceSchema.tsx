import { SITE_URL } from "@/lib/site";

interface Props {
  name: string;
  description: string;
  slug: string;
}

export function ServiceSchema({ name, description, slug }: Props) {
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
    url: `${SITE_URL}/hizmetler/${slug}`,
    areaServed: { "@type": "Country", name: "Turkey" },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
