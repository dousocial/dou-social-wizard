import { SITE_URL } from "@/lib/site";

interface Crumb {
  name: string;
  path: string;
}

interface Props {
  crumbs: Crumb[];
  locale: "tr" | "en";
}

export function BreadcrumbSchema({ crumbs, locale }: Props) {
  const prefix = locale === "tr" ? "" : "/en";
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${prefix}${c.path === "/" ? "" : c.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
