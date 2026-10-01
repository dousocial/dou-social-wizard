"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/session";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type LeadInput = {
  title: string;
  company_id?: string | null;
  contact_id?: string | null;
  company_name?: string;
  contact_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  website?: string;
  sector?: string;
  city?: string;
  district?: string;
  interested_service?: string;
  referral_source?: string;
  estimated_budget?: number | null;
  company_size?: string;
  first_contact_date?: string;
  lost_reason?: string;
  source?: "referans" | "instagram" | "google_maps" | "inbound" | "manuel" | "diger";
  status?: "yeni" | "ilk_arama" | "gorusuldu" | "bilgi_bekleniyor" | "gorusme_planlanacak" | "teklif_istendi" | "teklif_gonderildi" | "donus_bekleniyor" | "teklif_kabul" | "teklif_reddedildi" | "takipte" | "daha_sonra" | "kazanildi" | "kaybedildi";
  score?: number;
  last_contact_date?: string | null;
  next_follow_up_date?: string | null;
  notes?: string;
  assigned_user?: string;
  audit_id?: string | null;
  source_contact_id?: string | null;
};

export type ActionResult = { error: string | null; id?: string };

export async function addLead(data: LeadInput): Promise<ActionResult> {
  try {
    await requirePermission("crm.write");
    const { data: newLead, error } = await sb().from("crm_leads").insert(data).select("id").single();
    if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." };
    revalidatePath("/yonetim/musteriler");
    return { error: null, id: newLead.id };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function updateLead(id: string, data: Partial<LeadInput>): Promise<ActionResult> {
  try {
    await requirePermission("crm.write");
    const { error } = await sb()
      .from("crm_leads")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." };
    revalidatePath("/yonetim/musteriler");
    revalidatePath(`/yonetim/crm-leads/${id}`);
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function deleteLead(id: string): Promise<ActionResult> {
  try {
    await requirePermission("crm.write");
    const { error } = await sb().from("crm_leads").delete().eq("id", id);
    if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." };
    revalidatePath("/yonetim/musteriler");
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

// ─── Lead'i Müşteriye Dönüştürme Aksiyonu ──────────────────────────────────
export async function convertLeadToClient(leadId: string, clientData: {
  aylik_ucret: number;
  baslangic_tarihi: string;
  platformlar: string[];
}): Promise<ActionResult> {
  const supabase = sb();
  try {
    const session = await requirePermission("crm.write");
    const { data: clientId, error } = await supabase.rpc("convert_crm_lead_to_client", {
      p_lead_id: leadId,
      p_monthly_fee: clientData.aylik_ucret,
      p_start_date: clientData.baslangic_tarihi,
      p_platforms: clientData.platformlar,
      p_actor_id: session.userId,
    });

    if (error || !clientId) return { error: error?.message ?? "Müşteri dönüşümü tamamlanamadı." };

    revalidatePath("/yonetim/musteriler");
    revalidatePath(`/yonetim/crm-leads/${leadId}`);
    revalidatePath("/yonetim/musteriler");
    
    return { error: null, id: String(clientId) };
  } catch (e) {
    return { error: String(e) };
  }
}
