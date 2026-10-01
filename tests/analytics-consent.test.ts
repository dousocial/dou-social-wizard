import { afterEach, it, expect, vi } from "vitest";
import { trackEvent } from "../src/lib/analytics";
afterEach(() => vi.unstubAllGlobals());
it("does not send or queue events without consent", () => {
  const gtag = vi.fn(); const dataLayer: unknown[] = [];
  vi.stubGlobal("window", { gtag, dataLayer });
  vi.stubGlobal("localStorage", { getItem: () => "denied" });
  trackEvent("generate_lead", { form_type: "quote" });
  expect(gtag).not.toHaveBeenCalled(); expect(dataLayer).toEqual([]);
});
it("queues consented events until the remote tag is ready", () => {
  const dataLayer: unknown[] = []; vi.stubGlobal("window", { dataLayer });
  vi.stubGlobal("localStorage", { getItem: () => "granted" });
  trackEvent("generate_lead", { form_type: "quote" });
  expect(dataLayer).toEqual([["event", "generate_lead", { form_type: "quote" }]]);
});
it("uses the loaded tag for consented events", () => {
  const gtag = vi.fn(); vi.stubGlobal("window", { gtag });
  vi.stubGlobal("localStorage", { getItem: () => "granted" });
  trackEvent("contact_click", { contact_type: "phone" });
  expect(gtag).toHaveBeenCalledWith("event", "contact_click", { contact_type: "phone" });
});
