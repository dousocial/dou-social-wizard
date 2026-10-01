import { describe, it, expect } from "vitest";
import { classifyAnalyticsLink } from "../src/lib/analytics-link";
import { buildArticleSchema } from "../src/lib/article-schema";
const origin = "https://www.dousocial.com";
const post = { slug: "guide", locale: "tr", title: "Rehber", description: "Özet", date: "2026-09-01", cover: "/blog/cover.webp", readingMinutes: 3 };
describe("public analytics privacy", () => {
  it("omits phone and email values", () => {
    expect(classifyAnalyticsLink("tel:+905551234567", origin)).toEqual({ name: "contact_click", params: { contact_type: "phone" } });
    expect(classifyAnalyticsLink("mailto:private@example.com?body=secret", origin)).toEqual({ name: "contact_click", params: { contact_type: "email" } });
  });
  it("omits WhatsApp recipient and message", () => {
    expect(classifyAnalyticsLink("https://wa.me/905551234567?text=private", origin)).toEqual({ name: "contact_click", params: { contact_type: "whatsapp" } });
  });
  it("strips CTA queries and language prefix", () => {
    expect(classifyAnalyticsLink("/en/teklif-al?email=private", origin)).toEqual({ name: "cta_click", params: { destination: "/teklif-al" } });
  });
  it("does not collect outbound query, path or fragment", () => {
    expect(classifyAnalyticsLink("https://example.com/private?token=secret#hidden", origin)).toEqual({ name: "outbound_link_click", params: { link_domain: "example.com" } });
  });
  it("ignores unsupported schemes and regular internal links", () => {
    expect(classifyAnalyticsLink("javascript:alert(1)", origin)).toBeNull();
    expect(classifyAnalyticsLink("/blog/guide", origin)).toBeNull();
  });
});
describe("article identity and dates", () => {
  it("uses the shared organization and a real author profile destination", () => {
    const s = buildArticleSchema(post, origin + "/blog/guide", origin);
    expect(s.author).toMatchObject({ "@type": "Organization", "@id": origin + "#organization", url: origin + "/hakkimizda" });
    expect(s.dateModified).toBe(post.date);
    expect(s.image).toBe(origin + "/blog/cover.webp");
  });
  it("uses actual update dates without moving publication", () => {
    const s = buildArticleSchema({ ...post, updated: "2026-09-20T10:00:00Z" }, origin + "/blog/guide", origin);
    expect(s.datePublished).toBe("2026-09-01");
    expect(s.dateModified).toBe("2026-09-20T10:00:00Z");
  });
  it("ignores invalid or earlier updates", () => {
    for (const updated of ["invalid", "2026-08-01"]) expect(buildArticleSchema({ ...post, updated }, origin + "/blog/guide", origin).dateModified).toBe(post.date);
  });
  it("does not label an individual as an organization", () => {
    expect(buildArticleSchema({ ...post, author: "Deniz" }, origin + "/blog/guide", origin).author).toEqual({ "@type": "Person", name: "Deniz" });
  });
});
