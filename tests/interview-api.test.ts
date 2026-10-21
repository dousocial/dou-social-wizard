import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  getClientId: vi.fn(),
  rateLimit: vi.fn(),
}));
vi.mock("@/lib/supabase", () => ({ supabase: { from: mocks.from } }));
vi.mock("@/lib/rate-limit", () => ({
  getClientId: mocks.getClientId,
  rateLimit: mocks.rateLimit,
}));
import { GET, POST } from "../src/app/api/interview/route";

function query(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {};
  for (const key of ["select", "eq", "is", "insert", "single", "maybeSingle"])
    builder[key] = vi.fn(() => builder);
  builder.then = (resolve: (value: unknown) => void) =>
    Promise.resolve(result).then(resolve);
  return builder;
}
function request(
  body: unknown,
  options: { token?: boolean; origin?: string } = {}
) {
  return new NextRequest("https://www.dousocial.com/api/interview", {
    method: "POST",
    headers: {
      origin: options.origin ?? "https://www.dousocial.com",
      "content-type": "application/json",
      ...(options.token === false
        ? {}
        : { cookie: `dou_interview=${"a".repeat(64)}` }),
    },
    body: JSON.stringify(body),
  });
}
describe("interview HTTP boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-10-20T10:00:00Z"));
    mocks.getClientId.mockResolvedValue("test-ip");
    mocks.rateLimit.mockReturnValue({ ok: true });
  });
  it("returns occupancy without exposing candidates' names and uses a private HttpOnly cookie", async () => {
    const list = query({ data: [{ slot_index: 1 }], error: null });
    mocks.from
      .mockReturnValueOnce(list)
      .mockReturnValueOnce(query({ data: null, error: null }));
    const response = await GET(
      new NextRequest("https://www.dousocial.com/api/interview")
    );
    const body = await response.json();
    expect(body.slots).toHaveLength(33);
    expect(body.slots[1]).toEqual({ index: 1, booked: true });
    expect(body.ownBooking).toBeNull();
    expect(list.select).toHaveBeenCalledWith("slot_index");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  });
  it("fails closed when availability cannot load", async () => {
    mocks.from.mockReturnValue(
      query({ data: null, error: { message: "private database error" } })
    );
    const response = await GET(
      new NextRequest("https://www.dousocial.com/api/interview")
    );
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private database");
  });
  it("rejects cross-origin submission before touching the database", async () => {
    expect(
      (await POST(request({}, { origin: "https://attacker.example" }))).status
    ).toBe(403);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("requires a browser token", async () => {
    expect((await POST(request({}, { token: false }))).status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it.each([-1, 33, 1.5, "1", null])(
    "rejects invalid slot %s",
    async (slotIndex) => {
      expect(
        (await POST(request({ fullName: "Ali Şahin", slotIndex }))).status
      ).toBe(400);
      expect(mocks.from).not.toHaveBeenCalled();
    }
  );
  it("rejects a past slot using the server clock", async () => {
    vi.mocked(Date.now).mockReturnValue(Date.parse("2026-10-23T07:00:00Z"));
    expect(
      (await POST(request({ fullName: "Ali Şahin", slotIndex: 0 }))).status
    ).toBe(409);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("returns conflict when a competing candidate takes the slot", async () => {
    mocks.from
      .mockReturnValueOnce(query({ data: null, error: { code: "23505" } }))
      .mockReturnValueOnce(query({ data: null, error: null }));
    expect(
      (await POST(request({ fullName: "Ali Şahin", slotIndex: 1 }))).status
    ).toBe(409);
  });
  it("makes retries idempotent for the same browser", async () => {
    mocks.from
      .mockReturnValueOnce(query({ data: null, error: { code: "23505" } }))
      .mockReturnValueOnce(
        query({ data: { full_name: "Ali Şahin", slot_index: 1 }, error: null })
      );
    const response = await POST(
      request({ fullName: "Ali Şahin", slotIndex: 2 })
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ownBooking: { fullName: "Ali Şahin", slotIndex: 1 },
    });
  });
  it.each([8, 9, 10, 11])("rejects closed lunch slot %s without a database write", async (slotIndex) => {
    expect((await POST(request({ fullName: "Ali Şahin", slotIndex }))).status).toBe(409);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("advertises lunch as unavailable even to older clients", async () => {
    mocks.from.mockReturnValue(query({ data: null, error: null }));
    const response = await GET(new NextRequest("https://www.dousocial.com/api/interview"));
    const body = await response.json();
    expect(body.slots.filter((slot: { closed?: boolean }) => slot.closed).map((slot: { index: number }) => slot.index)).toEqual([8,9,10,11]);
    expect(body.slots[8]).toEqual({ index: 8, booked: true, closed: true });
    expect(body.slots[12].booked).toBe(false);
  });
  it("confirms only a successful insert", async () => {
    mocks.from.mockReturnValue(
      query({ data: { full_name: "Ali Şahin", slot_index: 32 }, error: null })
    );
    expect(
      (await POST(request({ fullName: "Ali Şahin", slotIndex: 32 }))).status
    ).toBe(201);
  });
});
