import { describe, expect, it, vi } from "vitest";
const from = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase", () => ({ supabase: { from } }));
import { GET, POST } from "../src/app/api/interview/route";

describe("closed public interview booking", () => {
  it.each([GET, POST])(
    "returns 410 without reading or changing CRM bookings",
    async (handler) => {
      const response = handler();
      expect(response.status).toBe(410);
      expect(response.headers.get("cache-control")).toBe("private, no-store");
      expect(response.headers.get("x-robots-tag")).toContain("noindex");
      expect(response.headers.get("set-cookie")).toBeNull();
      expect(await response.json()).toEqual({
        error: "Mülakat randevu sayfası yayından kaldırıldı.",
      });
      expect(from).not.toHaveBeenCalled();
    }
  );
});
