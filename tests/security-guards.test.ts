import { beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";
const mocks = vi.hoisted(() => ({ single: vi.fn(), from: vi.fn(), permission: vi.fn(), createClient: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: mocks.from } }));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));
import { getActiveSession, signToken, verifyToken, hasPermission } from "../src/lib/session";
import { contentSecurityPolicy } from "../src/lib/security-policy";
beforeEach(() => {
  vi.stubEnv("ADMIN_SESSION_SECRET", "unit-test-only-secret-never-used-in-production");
  mocks.single.mockReset(); mocks.from.mockReset();
  mocks.from.mockReturnValue({ select: () => ({ eq: () => ({ single: mocks.single }) }) });
});
describe("session validation", () => {
  it("rejects tampered and expired cookies", () => {
    const token = signToken("user", "yonetici");
    expect(verifyToken(token)?.userId).toBe("user");
    expect(verifyToken(token.replace("user", "other"))).toBeNull();
    vi.spyOn(Date,"now").mockReturnValue(Date.now() + 31 * 86400_000);
    expect(verifyToken(token)).toBeNull(); vi.restoreAllMocks();
  });
  it.each(["NaN", "Infinity", String(Date.now() + 86400_000)])("rejects invalid/future issue time %s", ts => {
    const payload = `user:yonetici.${ts}`;
    const signature = crypto.createHmac("sha256",process.env.ADMIN_SESSION_SECRET!).update(payload).digest("base64url");
    expect(verifyToken(`${payload}.${signature}`)).toBeNull();
  });
  it("rejects a deleted user despite a valid signed cookie", async () => {
    mocks.single.mockResolvedValue({data:null,error:null});
    expect(await getActiveSession(signToken("deleted","yonetici"))).toBeNull();
  });
  it("uses the current database role after a demotion", async () => {
    mocks.single.mockResolvedValue({data:{id:"user",role:"izleyici"},error:null});
    const session=await getActiveSession(signToken("user","yonetici"));
    expect(session?.role).toBe("izleyici");
    expect(hasPermission(session!.role,"users.manage")).toBe(false);
  });
  it("fails closed when the user lookup fails", async () => {
    mocks.single.mockRejectedValue(new Error("private db detail"));
    expect(await getActiveSession(signToken("user","yonetici"))).toBeNull();
  });
});
it("admin CSP uses a nonce and forbids arbitrary inline scripts", () => {
  const policy = contentSecurityPolicy("test-nonce");
  expect(policy).toContain("'nonce-test-nonce' 'strict-dynamic'");
  expect(policy.match(/script-src ([^;]+)/)?.[1]).not.toContain("unsafe-inline");
  expect(policy).toContain("object-src 'none'"); expect(policy).toContain("form-action 'self'");
});
