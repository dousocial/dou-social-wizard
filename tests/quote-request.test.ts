import { beforeEach, describe, expect, it, vi } from "vitest";
const { insert } = vi.hoisted(() => ({ insert: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  supabase: { from: vi.fn(() => ({ insert })) },
}));
vi.mock("@/lib/rate-limit", () => ({
  getClientId: async () => "test",
  rateLimit: () => ({ ok: true }),
}));
vi.mock("@/lib/recaptcha", () => ({ verifyRecaptcha: async () => true }));
import { submitQuoteRequest } from "../src/lib/actions/forms";
function form() {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    name: "Test",
    email: "test@example.com",
    consent: "on",
    industry: "b2b",
    budget: "lt25k",
    services: "google-ads",
  }))
    data.append(key, value);
  return data;
}
beforeEach(() => {
  insert.mockReset();
});
describe("quote persistence", () => {
  it("returns success only after a successful database insert", async () => {
    insert.mockResolvedValue({ error: null });
    await expect(
      submitQuoteRequest({ status: "idle" }, form())
    ).resolves.toEqual({ status: "success", recorded: true });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ type: "teklif", email: "test@example.com" })
    );
  });
  it("does not report success or leak database details on failure", async () => {
    insert.mockResolvedValue({
      error: { message: "private database diagnostic" },
    });
    await expect(
      submitQuoteRequest({ status: "idle" }, form())
    ).resolves.toEqual({ status: "error", error: "db-error" });
  });
  it("handles a missing database configuration as an error", async () => {
    insert.mockRejectedValue(new Error("missing key"));
    await expect(
      submitQuoteRequest({ status: "idle" }, form())
    ).resolves.toEqual({ status: "error", error: "db-error" });
  });
  it("rejects a missing consent before storage", async () => {
    const data = form();
    data.delete("consent");
    await expect(submitQuoteRequest({ status: "idle" }, data)).resolves.toEqual(
      { status: "error", error: "consent-required" }
    );
    expect(insert).not.toHaveBeenCalled();
  });
});
