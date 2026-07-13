import crypto from "crypto";

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET env var is missing");
  return s;
}

export const USER_ROLES = [
  "yonetici",
  "koordinator",
  "editor",
  "tasarimci",
  "cekim_ekibi",
  "reklam_sorumlusu",
  "izleyici",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type Permission =
  | "users.manage"
  | "crm.write"
  | "content.write"
  | "publishing.write"
  | "advertising.write";

export type SessionPayload = { userId: string; role: UserRole };

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  yonetici: ["users.manage", "crm.write", "content.write", "publishing.write", "advertising.write"],
  koordinator: ["crm.write", "content.write", "publishing.write", "advertising.write"],
  editor: ["content.write"],
  tasarimci: ["content.write"],
  cekim_ekibi: ["content.write"],
  reklam_sorumlusu: ["advertising.write"],
  izleyici: [],
};

export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export function hasPermission(role: UserRole, permission: Permission) {
  return ROLE_PERMISSIONS[role].includes(permission);
}

// Token format: userId:role.timestamp.hmac
export function signToken(userId: string, role: UserRole): string {
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
    if (!userId || !isUserRole(role)) return null;
    return { userId, role };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionPayload> {
  const { cookies } = await import("next/headers");
  const { redirect } = await import("next/navigation");
  
  const cookieStore = await cookies();
  const token = cookieStore.get("dou_sid")?.value;
  if (!token) redirect("/yonetim/giris");
  const session = verifyToken(token!);
  if (!session) redirect("/yonetim/giris");
  return session!;
}

export async function requirePermission(permission: Permission): Promise<SessionPayload> {
  const session = await requireSession();
  if (!hasPermission(session.role, permission)) {
    throw new Error("Bu işlem için yetkiniz bulunmuyor.");
  }
  return session;
}
