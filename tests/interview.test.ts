import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { interviewSlots, normalizeInterviewName } from "../src/lib/interview";

describe("interview schedule", () => {
  it("has 33 fifteen-minute slots from 10:00 through 18:00 Istanbul on Friday", () => {
    const slots = interviewSlots();
    expect(slots).toHaveLength(33);
    expect(slots[0].label).toBe("10:00–10:15");
    expect(slots[32].label).toBe("18:00–18:15");
    expect(slots[0].start).toBe("2026-10-23T07:00:00.000Z");
    expect(new Date(slots[0].start).getUTCDay()).toBe(5);
    slots
      .slice(1)
      .forEach((slot, index) =>
        expect(Date.parse(slot.start) - Date.parse(slots[index].start)).toBe(
          900_000
        )
      );
  });
  it("normalizes whitespace and Turkish uppercase names for duplicate detection", () => {
    expect(normalizeInterviewName("  ALİ   ŞAHİN  ")).toEqual({
      fullName: "ALİ ŞAHİN",
      nameKey: "ali şahin",
    });
    expect(normalizeInterviewName("IŞIK IŞIK").nameKey).toBe("ışık ışık");
    expect(normalizeInterviewName("Anne-Marie O’Neill").fullName).toBe(
      "Anne-Marie O’Neill"
    );
  });
  it.each([
    null,
    {},
    "Ali",
    "Ali 123",
    "<script> alert",
    "A".repeat(101),
    "Ali\u200b Şahin",
  ])("rejects invalid name %s", (input) => {
    expect(() => normalizeInterviewName(input)).toThrow();
  });
});

describe("PostgreSQL reservation constraints", () => {
  let db: PGlite;
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(
      "CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;"
    );
    await db.exec(
      readFileSync(
        new URL("../supabase/interview-booking.sql", import.meta.url),
        "utf8"
      )
    );
  });
  afterAll(async () => {
    await db?.close();
  });
  const book = (slot: number, name: string, browser: string) =>
    db.query(
      "INSERT INTO interview_bookings(event_id,slot_index,full_name,name_key,browser_key) VALUES ('2026-10-23',$1,$2,$2,$3)",
      [slot, name, browser.repeat(64)]
    );
  it("accepts only one of two concurrent requests for the same slot", async () => {
    const results = await Promise.allSettled([
      book(0, "Aday Bir", "a"),
      book(0, "Aday İki", "b"),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find(
      (r) => r.status === "rejected"
    ) as PromiseRejectedResult;
    expect(rejected.reason.code).toBe("23505");
  });
  it("rejects a second time for the same name or browser", async () => {
    await book(1, "Aday Üç", "c");
    await expect(book(2, "Aday Üç", "d")).rejects.toMatchObject({
      code: "23505",
    });
    await expect(book(2, "Aday Dört", "c")).rejects.toMatchObject({
      code: "23505",
    });
  });
  it("rejects out-of-range slots", async () => {
    await expect(book(33, "Aday Beş", "e")).rejects.toMatchObject({
      code: "23514",
    });
    await expect(book(-1, "Aday Beş", "e")).rejects.toMatchObject({
      code: "23514",
    });
  });
  it("allows the last 18:00 slot", async () => {
    await expect(book(32, "Aday Altı", "f")).resolves.toBeDefined();
  });
  it("does not allow anonymous clients to read names or insert bookings", async () => {
    await db.exec("SET ROLE anon");
    await expect(
      db.query("SELECT full_name FROM interview_bookings")
    ).rejects.toMatchObject({ code: "42501" });
    await expect(book(3, "Aday Yedi", "g")).rejects.toMatchObject({
      code: "42501",
    });
    await db.exec("RESET ROLE");
  });
});
