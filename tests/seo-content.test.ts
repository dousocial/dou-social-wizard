import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { buildArticleSchema } from "../src/lib/article-schema";
import { renderToStaticMarkup } from "react-dom/server";
import { OrganizationSchema } from "../src/components/seo/OrganizationSchema";
import { LocalBusinessSchema } from "../src/components/seo/LocalBusinessSchema";
import { HomePageSchema } from "../src/components/seo/HomePageSchema";
import { SITE_URL } from "../src/lib/site";
import { RETIRED_URLS } from "../src/lib/legacy-urls";
import { siteConfig } from "../src/config/site";
const posts = [
  "instagram-gonderi-one-cikarma-reklam-yonetimi",
  "google-ads-butcesi-yonetim-ucreti",
  "denizli-tekstil-b2b-musteri-kazanimi",
];
describe("published SEO content", () => {
  it.each(posts)(
    "compiles %s and points to local assets and current content",
    async (slug) => {
      const { data, content } = matter(
        readFileSync(`content/blog/tr/${slug}.mdx`, "utf8")
      );
      await expect(
        serialize(content, { mdxOptions: { remarkPlugins: [remarkGfm] } })
      ).resolves.toBeDefined();
      expect(existsSync(`public${data.cover}`)).toBe(true);
      expect(RETIRED_URLS.has(`/blog/${slug}`)).toBe(false);
      for (const [, href] of content.matchAll(/\]\((\/[^)#]+)(?:#[^)]*)?\)/g)) {
        expect(RETIRED_URLS.has(href)).toBe(false);
        if (href.startsWith("/blog/"))
          expect(existsSync(`content/blog/tr/${href.slice(6)}.mdx`)).toBe(true);
      }
      expect(content).toContain("## Sıkça Sorulan Sorular");
    }
  );
  it("uses actual available brand images", () => {
    expect(existsSync(`public${siteConfig.brand.logo.dark}`)).toBe(true);
    expect(existsSync(`public${siteConfig.brand.logo.light}`)).toBe(true);
  });
  it("only publishes usable citation URLs and preserves editorial dates", () => {
    const schema = buildArticleSchema(
      {
        slug: "sample",
        locale: "tr",
        title: "Rehber",
        description: "Özet",
        date: "2026-10-01",
        updated: "2026-10-21",
        readingMinutes: 3,
        references: [
          "https://support.google.com/google-ads/answer/1704424",
          "javascript:alert(1)",
          "invalid",
        ],
      },
      "https://www.dousocial.com/blog/sample",
      "https://www.dousocial.com"
    );
    expect(schema.citation).toEqual([
      {
        "@type": "CreativeWork",
        url: "https://support.google.com/google-ads/answer/1704424",
      },
    ]);
    expect(schema.datePublished).toBe("2026-10-01");
    expect(schema.dateModified).toBe("2026-10-21");
  });
});

describe("consistent business identity", () => {
  it("uses the same canonical organization, address and working hours across page schemas", () => {
    const parse = (html: string) =>
      [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((match) =>
        JSON.parse(match[1])
      );
    const organization = parse(
      renderToStaticMarkup(OrganizationSchema({ locale: "tr" }))
    )[0];
    const local = parse(
      renderToStaticMarkup(LocalBusinessSchema({ url: SITE_URL }))
    )[0];
    const home = parse(
      renderToStaticMarkup(HomePageSchema({ locale: "tr" }))
    )[0]["@graph"].find(
      (node: { "@type": string }) => node["@type"] === "ProfessionalService"
    );
    for (const business of [organization, local, home]) {
      expect(business["@id"]).toBe(`${SITE_URL}#organization`);
      expect(business.address.postalCode).toBe("20020");
      expect(business.sameAs).toContain(
        "https://www.linkedin.com/company/dou-social-tr"
      );
      expect(business.image).toBe(`${SITE_URL}${siteConfig.brand.logo.dark}`);
    }
    expect(local.openingHoursSpecification).toEqual(
      organization.openingHoursSpecification
    );
  });
});
