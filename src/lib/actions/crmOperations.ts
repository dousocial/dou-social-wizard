"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/session";
import { cleanMultiline, cleanText } from "@/lib/crmValidation";

function sb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export type MonthlyPlanInput = {
  client_id: string; contract_id?: string | null; period: string;
  status?: "taslak" | "planlaniyor" | "aktif" | "tamamlandi";
  agreed_post_count?: number; planned_post_count?: number; produced_post_count?: number; published_post_count?: number;
  agreed_video_count?: number; planned_video_count?: number; shot_video_count?: number; edited_video_count?: number; published_video_count?: number;
  agreed_shoot_days?: number; notes?: string;
};

export type ReferenceInput = {
  client_id: string; period?: string | null; title: string; source_url?: string; preview_url?: string;
  source_platform: "instagram" | "pinterest" | "tiktok" | "youtube" | "rakip" | "dou" | "musteri" | "diger";
  content_type: "post" | "video" | "story" | "reklam" | "diger";
  description?: string; adapt_notes?: string; avoid_notes?: string; coordinator_note?: string;
  status?: "arastiriliyor" | "havuzda" | "incelenecek" | "secildi" | "musteriye_gosterilecek" | "uretime_alinacak" | "elendi" | "kullanildi";
};

export type ShootInput = {
  client_id: string; monthly_plan_id?: string | null; shoot_date: string; start_time?: string | null; end_time?: string | null;
  location?: string; team_members?: string[]; client_contact?: string; content_titles?: string[]; equipment?: string[];
  required_products?: string; speakers?: string; wardrobe?: string; notes?: string; client_informed?: boolean; team_informed?: boolean;
  status?: "planlaniyor" | "musteri_onayi" | "ekip_onayi" | "kesinlesti" | "yaklasiyor" | "basladi" | "tamamlandi" | "ertelendi" | "iptal";
  extra_reason?: string; coordinator_approved?: boolean; adaptation_period?: boolean; extra_fee?: boolean;
};

type Result = { error: string | null; id?: string; count?: number };
const operationPath = "/yonetim/operasyon";

export async function saveMonthlyPlan(data: MonthlyPlanInput): Promise<Result> {
  try {
    await requirePermission("content.write");
    if (!data.client_id || !/^\d{4}-(0[1-9]|1[0-2])$/.test(data.period)) return { error: "Müşteri ve YYYY-AA dönem bilgisi zorunludur." };
    const payload = { ...data, notes: cleanMultiline(data.notes) };
    const { data: plan, error } = await sb().from("crm_monthly_plans").upsert(payload, { onConflict: "client_id,period" }).select("id").single();
    if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." };
    revalidatePath(operationPath);
    return { error: null, id: plan.id };
  } catch (error) { return { error: String(error) }; }
}

export async function generateMonthlyPlans(period: string): Promise<Result> {
  try {
    await requirePermission("content.write");
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) return { error: "Dönem YYYY-AA biçiminde olmalıdır." };
    const supabase = sb();
    const { data: contracts, error } = await supabase.from("crm_contracts").select("id,client_id,monthly_post_count,monthly_video_count,monthly_shoot_days");
    if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." };
    const rows = (contracts ?? []).map(contract => ({
      client_id: contract.client_id, contract_id: contract.id, period, status: "planlaniyor",
      agreed_post_count: contract.monthly_post_count || 0, agreed_video_count: contract.monthly_video_count || 0,
      agreed_shoot_days: contract.monthly_shoot_days || 0,
    }));
    if (rows.length === 0) return { error: "Aktarılacak sözleşme bulunamadı." };
    const { error: upsertError } = await supabase.from("crm_monthly_plans").upsert(rows, { onConflict: "client_id,period", ignoreDuplicates: true });
    if (upsertError) return { error: upsertError.message };
    revalidatePath(operationPath);
    return { error: null, count: rows.length };
  } catch (error) { return { error: String(error) }; }
}

export async function deleteMonthlyPlan(id: string): Promise<Result> {
  try { await requirePermission("content.write"); const { error } = await sb().from("crm_monthly_plans").delete().eq("id", id); if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." }; revalidatePath(operationPath); return { error: null }; }
  catch (error) { return { error: String(error) }; }
}

export async function addReference(data: ReferenceInput): Promise<Result> {
  try {
    await requirePermission("content.write");
    if (!data.client_id || !cleanText(data.title)) return { error: "Müşteri ve başlık zorunludur." };
    const payload = { ...data, title: cleanText(data.title), source_url: cleanText(data.source_url), preview_url: cleanText(data.preview_url), description: cleanMultiline(data.description), adapt_notes: cleanMultiline(data.adapt_notes), avoid_notes: cleanMultiline(data.avoid_notes), coordinator_note: cleanMultiline(data.coordinator_note) };
    const { data: row, error } = await sb().from("crm_reference_assets").insert(payload).select("id").single();
    if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." }; revalidatePath(operationPath); return { error: null, id: row.id };
  } catch (error) { return { error: String(error) }; }
}

export async function updateReferenceStatus(id: string, status: ReferenceInput["status"]): Promise<Result> {
  try { await requirePermission("content.write"); const { error } = await sb().from("crm_reference_assets").update({ status, updated_at: new Date().toISOString() }).eq("id", id); if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." }; revalidatePath(operationPath); return { error: null }; }
  catch (error) { return { error: String(error) }; }
}

export async function deleteReference(id: string): Promise<Result> {
  try { await requirePermission("content.write"); const { error } = await sb().from("crm_reference_assets").delete().eq("id", id); if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." }; revalidatePath(operationPath); return { error: null }; }
  catch (error) { return { error: String(error) }; }
}

export async function addShoot(data: ShootInput): Promise<Result> {
  try {
    await requirePermission("content.write");
    const supabase = sb();
    const monthStart = `${data.shoot_date.slice(0, 7)}-01`;
    const end = new Date(`${monthStart}T00:00:00`); end.setMonth(end.getMonth() + 1);
    const monthEnd = end.toISOString().slice(0, 10);
    const { count, error: countError } = await supabase.from("crm_shoots").select("id", { count: "exact", head: true }).eq("client_id", data.client_id).gte("shoot_date", monthStart).lt("shoot_date", monthEnd).neq("status", "iptal");
    if (countError) return { error: countError.message };
    if ((count ?? 0) >= 3 && (!cleanText(data.extra_reason) || !data.coordinator_approved)) return { error: "Dördüncü çekim için ek çekim nedeni ve koordinatör onayı zorunludur." };
    const payload = { ...data, location: cleanText(data.location), team_members: (data.team_members ?? []).map(cleanText).filter(Boolean), content_titles: (data.content_titles ?? []).map(cleanText).filter(Boolean), equipment: (data.equipment ?? []).map(cleanText).filter(Boolean), client_contact: cleanText(data.client_contact), required_products: cleanMultiline(data.required_products), speakers: cleanText(data.speakers), wardrobe: cleanMultiline(data.wardrobe), notes: cleanMultiline(data.notes), extra_reason: cleanMultiline(data.extra_reason) };
    const { data: row, error } = await supabase.from("crm_shoots").insert(payload).select("id").single();
    if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." }; revalidatePath(operationPath); return { error: null, id: row.id };
  } catch (error) { return { error: String(error) }; }
}

export async function updateShootStatus(id: string, status: ShootInput["status"]): Promise<Result> {
  try { await requirePermission("content.write"); const { error } = await sb().from("crm_shoots").update({ status, updated_at: new Date().toISOString() }).eq("id", id); if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." }; revalidatePath(operationPath); return { error: null }; }
  catch (error) { return { error: String(error) }; }
}

export async function deleteShoot(id: string): Promise<Result> {
  try { await requirePermission("content.write"); const { error } = await sb().from("crm_shoots").delete().eq("id", id); if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." }; revalidatePath(operationPath); return { error: null }; }
  catch (error) { return { error: String(error) }; }
}
