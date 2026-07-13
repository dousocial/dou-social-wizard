"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/session";
import { cleanMultiline, cleanText } from "@/lib/crmValidation";

function sb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export type ContractInput = {
  client_id: string;
  lead_id?: string | null;
  start_date: string;
  end_date?: string | null;
  monthly_fee: number;
  payment_day?: number | null;
  duration_months?: number | null;
  auto_renew?: boolean;
  monthly_post_count?: number;
  monthly_video_count?: number;
  monthly_shoot_days?: number;
  story_service?: boolean;
  advertising_management?: boolean;
  services?: string[];
  extra_services?: string;
  signed_contract_url?: string;
  notes?: string;
};

export type ActionResult = { error: string | null; id?: string };

function normalize(data: ContractInput) {
  return {
    ...data,
    monthly_fee: Math.max(0, Number(data.monthly_fee) || 0),
    monthly_post_count: Math.max(0, Number(data.monthly_post_count) || 0),
    monthly_video_count: Math.max(0, Number(data.monthly_video_count) || 0),
    monthly_shoot_days: Math.max(0, Number(data.monthly_shoot_days) || 0),
    services: (data.services ?? []).map(cleanText).filter(Boolean),
    extra_services: cleanMultiline(data.extra_services),
    signed_contract_url: cleanText(data.signed_contract_url),
    notes: cleanMultiline(data.notes),
  };
}

export async function addContract(data: ContractInput): Promise<ActionResult> {
  try {
    await requirePermission("crm.write");
    if (!data.client_id || !data.start_date) return { error: "Müşteri ve başlangıç tarihi zorunludur." };
    const supabase = sb();
    const payload = normalize(data);
    const { data: contract, error } = await supabase.from("crm_contracts").insert(payload).select("id").single();
    if (error) return { error: error.message };
    await supabase.from("musteriler").update({
      aylik_ucret: payload.monthly_fee,
      baslangic_tarihi: payload.start_date,
      sozlesme_bitis_tarihi: payload.end_date || null,
      updated_at: new Date().toISOString(),
    }).eq("id", data.client_id);
    revalidatePath(`/yonetim/musteriler/${data.client_id}`);
    revalidatePath("/yonetim/musteriler");
    return { error: null, id: contract.id };
  } catch (error) {
    return { error: String(error) };
  }
}

export async function updateContract(id: string, data: ContractInput): Promise<ActionResult> {
  try {
    await requirePermission("crm.write");
    const supabase = sb();
    const payload = normalize(data);
    const { error } = await supabase.from("crm_contracts").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id).eq("client_id", data.client_id);
    if (error) return { error: error.message };
    await supabase.from("musteriler").update({
      aylik_ucret: payload.monthly_fee,
      baslangic_tarihi: payload.start_date,
      sozlesme_bitis_tarihi: payload.end_date || null,
      updated_at: new Date().toISOString(),
    }).eq("id", data.client_id);
    revalidatePath(`/yonetim/musteriler/${data.client_id}`);
    revalidatePath("/yonetim/musteriler");
    return { error: null };
  } catch (error) {
    return { error: String(error) };
  }
}

export async function deleteContract(id: string, clientId: string): Promise<ActionResult> {
  try {
    await requirePermission("crm.write");
    const { error } = await sb().from("crm_contracts").delete().eq("id", id).eq("client_id", clientId);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${clientId}`);
    return { error: null };
  } catch (error) {
    return { error: String(error) };
  }
}
