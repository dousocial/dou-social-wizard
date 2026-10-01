import { describe, expect, it } from "vitest";
import {
  isPublicAddress,
  normalizeInstagram,
  normalizeWebsite,
} from "../src/lib/public-web";
import { inspectWebsite } from "../src/lib/quick-audit";
import { readJsonBody } from "../src/lib/request-json";

describe("untrusted audit inputs", () => {
  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "::1",
    "::ffff:127.0.0.1",
    "fc00::1",
    "fe80::1",
    "0.0.0.0",
  ])("blocks private/reserved IP %s", (address) =>
    expect(isPublicAddress(address)).toBe(false)
  );
  it.each([
    "https://localhost",
    "http://127.1",
    "http://0x7f000001",
    "https://[::1]",
    "https://[::ffff:127.0.0.1]",
    "https://test.local",
    "https://user:pass@example.com",
    "https://example.com:8080",
    "file:///etc/passwd",
    "javascript:alert(1)",
  ])("rejects unsafe URL %s", (value) =>
    expect(() => normalizeWebsite(value)).toThrow()
  );
  it("accepts a domain without requiring any social input", () =>
    expect(normalizeWebsite("dousocial.com#test").href).toBe(
      "https://dousocial.com/"
    ));
  it("accepts a username without any website", () =>
    expect(normalizeInstagram("@dou.social")).toBe("dou.social"));
  it("accepts an Instagram profile URL", () =>
    expect(normalizeInstagram("https://www.instagram.com/dou.social/")).toBe(
      "dou.social"
    ));
  it.each([
    "https://instagram.com.evil.test/user",
    "https://instagram.com/p/123",
    "../user",
    "a..b",
    "user.",
    "a".repeat(31),
  ])("rejects invalid handle %s", (value) =>
    expect(() => normalizeInstagram(value)).toThrow()
  );
});
describe("evidence-based report", () => {
  it("reports missing content and noindex rather than invented scores", () => {
    const findings = inspectWebsite(
      '<html><head><meta name="robots" content="noindex"></head><body><h1>A</h1><h1>B</h1><img src="x"></body></html>',
      "http://example.com"
    );
    expect(findings.find((f) => f.label === "Ana başlık")?.status).toBe(
      "warning"
    );
    expect(
      findings.find((f) => f.label === "İndeksleme talimatı")?.status
    ).toBe("warning");
    expect(
      findings.find((f) => f.label === "Görsel alternatifleri")?.detail
    ).toContain("1 tanesinde");
    expect(findings.find((f) => f.label === "Sayfa başlığı")?.status).toBe(
      "warning"
    );
  });
  it("limits streamed bodies even without content-length", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ website: "x".repeat(5000) }),
    });
    await expect(readJsonBody(request, 4096)).rejects.toThrow();
  });
  it("parses a normal single-input request", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: '{"instagram":"dou.social"}',
    });
    await expect(readJsonBody(request, 4096)).resolves.toEqual({
      instagram: "dou.social",
    });
  });
});
