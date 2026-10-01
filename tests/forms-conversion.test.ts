import { beforeEach, it, expect, vi } from "vitest";
const { insert } = vi.hoisted(() => ({ insert: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: () => ({ insert }) } }));
vi.mock("@/lib/rate-limit", () => ({ getClientId: async () => "test", rateLimit: () => ({ ok: true }) }));
vi.mock("@/lib/recaptcha", () => ({ verifyRecaptcha: async () => true }));
import { submitContactForm, submitQuoteRequest, submitCheckupRequest } from "../src/lib/actions/forms";
beforeEach(() => { insert.mockReset(); insert.mockResolvedValue({ error: null }); });
it.each([submitContactForm, submitQuoteRequest, submitCheckupRequest])("does not count a honeypot as a stored lead", async (action) => {
  const fd = new FormData(); fd.set("website_url", "bot");
  expect(await action({ status: "idle" }, fd)).toEqual({ status: "success", recorded: false });
  expect(insert).not.toHaveBeenCalled();
});
function contact() { const fd = new FormData(); fd.set("name", "Test"); fd.set("email", "test@example.com"); fd.set("message", "Test"); fd.set("consent", "on"); return fd; }
it("counts contact conversion only after successful storage", async () => {
  expect(await submitContactForm({ status: "idle" }, contact())).toEqual({ status: "success", recorded: true });
});
it("does not report a conversion after a database failure", async () => {
  insert.mockResolvedValue({ error: { message: "failed" } });
  expect(await submitContactForm({ status: "idle" }, contact())).toEqual({ status: "error", error: "db-error" });
});
