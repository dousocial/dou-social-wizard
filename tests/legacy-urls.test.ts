import { describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "node:fs";
import { RETIRED_URLS } from "../src/lib/legacy-urls";
vi.mock("next-intl/middleware", () => ({
  default: () => () => NextResponse.next(),
}));
vi.mock("../src/lib/session", () => ({
  getActiveSession: vi.fn(async () => null),
}));
import middleware from "../src/proxy";
const req = (path: string) =>
  new NextRequest(`https://www.dousocial.com${path}`);
describe("legacy URL migration", () => {
  it("permanently redirects the former agency page to the current agency page and preserves tracking", async () => {
    const response = await middleware(
      req("/denizli-reklam-ajansi?utm_source=test")
    );
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://www.dousocial.com/dijital-pazarlama-ajansi?utm_source=test"
    );
  });
  it("keeps the English agency destination in English", async () => {
    expect(
      (await middleware(req("/en/denizli-reklam-ajansi"))).headers.get(
        "location"
      )
    ).toBe("https://www.dousocial.com/en/dijital-pazarlama-ajansi");
  });
  it("redirects the retired selection guide to the current selection guide", async () => {
    expect(
      (
        await middleware(req("/blog/sosyal-medya-ajansi-nasil-secilir"))
      ).headers.get("location")
    ).toBe("https://www.dousocial.com/blog/reklam-ajansi-secerken-sorular");
  });
  it.each([...RETIRED_URLS])(
    "serves 410 and noindex for retired page %s",
    async (path) => {
      const response = await middleware(req(path));
      expect(response.status).toBe(410);
      expect(response.headers.get("x-robots-tag")).toContain("noindex");
      expect(await response.text()).toContain('<a href="/blog">');
      const match = path.match(/^\/(en\/)?blog\/([^/]+)$/);
      if (match)
        expect(
          existsSync(`content/blog/${match[1] ? "en" : "tr"}/${match[2]}.mdx`)
        ).toBe(false);
    }
  );
  it("also retires explicit Turkish-prefix and trailing-slash variants", async () => {
    expect(
      (await middleware(req("/tr/blog/marka-tonu-nasil-bulunur/"))).status
    ).toBe(410);
  });
  it.each([
    "/blog/google-ads-tiklama-var-talep-yok",
    "/blog/new-article",
    "/projeler/fitlife-kitchen",
    "/en/projeler/fitlife-kitchen",
    "/projeler/en20-spor-merkezi",
    "/en/projeler/en20-spor-merkezi",
    "/projeler/pamair-havacilik",
    "/en/projeler/pamair-havacilik",
    "/blog",
    "/en/hizmetler",
    "/api/interview",
    "/yonetim/giris",
  ])(
    "does not catch a current, future or operational path %s",
    async (path) => {
      expect((await middleware(req(path))).status).toBe(200);
    }
  );
  it("preserves the historical textile destination through its new replacement", async () => {
    const response = await middleware(
      req("/blog/denizli-tekstil-markalari-icin-dijital-pazarlama-ve-ihracat")
    );
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://www.dousocial.com/blog/denizli-tekstil-b2b-musteri-kazanimi"
    );
  });
  it("still protects the administration panel", async () => {
    const response = await middleware(req("/yonetim/musteriler"));
    expect(response.headers.get("location")).toBe(
      "https://www.dousocial.com/yonetim/giris"
    );
  });
});
