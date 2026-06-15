import crypto from "crypto";

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET env var is missing");
  return s;
}

export type SessionPayload = { userId: string; role: string };

// Token format: userId:role.timestamp.hmac
export function signToken(userId: string, role: string): string {
  const ts = Date.now();
  const payload = `${userId}:${role}.${ts}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const lastDot = token.lastIndexOf(".");
    const payload = token.slice(0, lastDot);
    const sig = token.slice(lastDot + 1);
    const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
    const a = Buffer.from(sig, "base64url");
    const b = Buffer.from(expected, "base64url");
    if (a.length !== b.length) return null;
    if (!crypto.timingSafeEqual(a, b)) return null;
    // payload = "userId:role.timestamp"
    const dotIdx = payload.lastIndexOf(".");
    const userPart = payload.slice(0, dotIdx);   // "userId:role"
    const ts = payload.slice(dotIdx + 1);
    if (Date.now() - Number(ts) > 30 * 24 * 3600 * 1000) return null;
    const colonIdx = userPart.indexOf(":");
    const userId = userPart.slice(0, colonIdx);
    const role = userPart.slice(colonIdx + 1);
    if (!userId || !role) return null;
    return { userId, role };
  } catch {
    return null;
  }
}
