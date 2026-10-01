"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { isUserRole, requirePermission, signToken, getActiveSession } from "@/lib/session";
import { getClientId, rateLimit } from "@/lib/rate-limit";

export type ActionState = { error?: string; success?: boolean } | null;

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function isNextRedirect(err: unknown): boolean {
  return (
    typeof err === "object" && err !== null && "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!username || !password) return { error: "Kullanıcı adı ve şifre gerekli" };
    if (username.length > 100 || password.length > 1024) return { error: "Kullanıcı adı veya şifre hatalı" };
    const clientId = await getClientId();
    const identifier = crypto.createHash("sha256").update(clientId).digest("hex");
    if (!rateLimit(`login:${identifier}`, { max: 5, windowSeconds: 600 }).ok) {
      return { error: "Çok fazla giriş denemesi. Lütfen 10 dakika sonra tekrar deneyin." };
    }

    const { data: user } = await supabase
      .from("admin_users")
      .select("id, password_hash, salt, role")
      .eq("username", username)
      .single();

    const hash = hashPassword(password, user?.salt ?? "login-dummy-salt");
    const stored = Buffer.from(user?.password_hash ?? "", "hex");
    const submitted = Buffer.from(hash, "hex");
    if (!user || stored.length !== submitted.length || !crypto.timingSafeEqual(stored, submitted)) {
      return { error: "Kullanıcı adı veya şifre hatalı" };
    }

    if (!isUserRole(user.role)) return { error: "Kullanıcı rolü geçersiz" };
    const token = signToken(user.id, user.role);
    const cookieStore = await cookies();
    cookieStore.set("dou_sid", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 3600,
      path: "/",
    });

    return { success: true };
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    return { error: "Giriş şu anda tamamlanamadı. Lütfen tekrar deneyin." };
  }
}

export async function setupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    // Bootstrap must be explicitly enabled by the deployment operator.
    if (process.env.ENABLE_ADMIN_BOOTSTRAP !== "true") return { error: "İlk yönetici kurulumu kapalı." };
    const { count, error: countError } = await supabase
      .from("admin_users")
      .select("*", { count: "exact", head: true });

    if (countError || count === null) return { error: "Kurulum şu anda tamamlanamadı." };
    if (count > 0) return { error: "Admin zaten mevcut" };

    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!username) return { error: "Kullanıcı adı gerekli" };
    if (password.length < 8) return { error: "Şifre en az 8 karakter olmalı" };

    const salt = crypto.randomBytes(16).toString("hex");
    const password_hash = hashPassword(password, salt);

    const { error } = await supabase
      .from("admin_users")
      .insert({ username, password_hash, salt, role: "yonetici" });

    if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." };

    return { success: true };
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function addUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission("users.manage");

    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const role = String(formData.get("role") ?? "izleyici");

    if (!username) return { error: "Kullanıcı adı gerekli" };
    if (password.length < 8) return { error: "Şifre en az 8 karakter olmalı" };
    if (!isUserRole(role)) return { error: "Geçersiz rol" };

    const salt = crypto.randomBytes(16).toString("hex");
    const password_hash = hashPassword(password, salt);

    const { error } = await supabase
      .from("admin_users")
      .insert({ username, password_hash, salt, role });

    if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." };

    revalidatePath("/yonetim/kullanicilar");
    return { success: true };
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission("users.manage");

    const id = String(formData.get("id") ?? "");

    const { count } = await supabase
      .from("admin_users")
      .select("*", { count: "exact", head: true })
      .eq("role", "yonetici");

    const { data: target } = await supabase
      .from("admin_users")
      .select("role")
      .eq("id", id)
      .single();

    if (target?.role === "yonetici" && (count ?? 0) <= 1) {
      return { error: "Son yönetici silinemez" };
    }

    await supabase.from("admin_users").delete().eq("id", id);
    revalidatePath("/yonetim/kullanicilar");
    return { success: true };
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = (await cookies()).get("dou_sid")?.value;
    const session = await getActiveSession(token);
    if (!session) redirect("/yonetim/giris");

    const current = String(formData.get("current") ?? "");
    const next    = String(formData.get("next")    ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (next.length < 8) return { error: "Yeni şifre en az 8 karakter olmalı" };
    if (next !== confirm) return { error: "Şifreler eşleşmiyor" };

    const { data: user } = await supabase
      .from("admin_users")
      .select("password_hash, salt")
      .eq("id", session.userId)
      .single();

    if (!user || hashPassword(current, user.salt) !== user.password_hash) {
      return { error: "Mevcut şifre hatalı" };
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const password_hash = hashPassword(next, salt);
    await supabase.from("admin_users").update({ password_hash, salt }).eq("id", session.userId);

    return { success: true };
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("dou_sid");
}
