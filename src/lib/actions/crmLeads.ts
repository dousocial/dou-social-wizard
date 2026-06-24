"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";

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
  phone?: string;
  email?: string;
  instagram?: string;
  website?: string;
  sector?: string;
  source?: "referans" | "instagram" | "google_maps" | "inbound" | "manuel" | "diger";
  status?: "yeni" | "gorusuldu" | "teklif_istendi" | "teklif_gonderildi" | "takipte" | "kazanildi" | "kaybedildi";
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
    await requireSession();
    const { data: newLead, error } = await sb().from("crm_leads").insert(data).select("id").single();
    if (error) return { error: error.message };
    revalidatePath("/yonetim/crm-leads");
    return { error: null, id: newLead.id };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function updateLead(id: string, data: Partial<LeadInput>): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb()
      .from("crm_leads")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim/crm-leads");
    revalidatePath(`/yonetim/crm-leads/${id}`);
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function deleteLead(id: string): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("crm_leads").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim/crm-leads");
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
    await requireSession();
    // 1. Lead verisini oku
    const { data: lead, error: leadErr } = await supabase
      .from("crm_leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (leadErr || !lead) {
      return { error: leadErr ? leadErr.message : "Fırsat kaydı bulunamadı." };
    }

    // 2. Müşteri bilgilerini derle
    // Eğer firma bağlantısı varsa firma adını, yoksa standalone lead firma adını kullan
    let musteriAdi = lead.company_name || lead.title;
    if (lead.company_id) {
      const { data: comp } = await supabase.from("crm_companies").select("name").eq("id", lead.company_id).single();
      if (comp) musteriAdi = comp.name;
    }

    let yetkiliAdi = lead.contact_name || "";
    if (lead.contact_id) {
      const { data: cont } = await supabase.from("crm_contacts").select("name").eq("id", lead.contact_id).single();
      if (cont) yetkiliAdi = cont.name;
    }

    const musteriInsert = {
      ad: musteriAdi,
      sektor: lead.sector || "Diğer",
      website: lead.website || "",
      email: lead.email || "",
      telefon: lead.phone || "",
      sorumlu: lead.assigned_user || "",
      durum: "aktif",
      platformlar: clientData.platformlar,
      aylik_ucret: clientData.aylik_ucret,
      baslangic_tarihi: clientData.baslangic_tarihi,
      notlar: `[Fırsat Dönüşümü] Yetkili: ${yetkiliAdi}. Lead Notları: ${lead.notes || ""}`
    };

    // 3. musteriler tablosuna ekle
    const { data: client, error: clientErr } = await supabase
      .from("musteriler")
      .insert(musteriInsert)
      .select("id")
      .single();

    if (clientErr || !client) {
      return { error: `Müşteri kaydı oluşturulurken hata: ${clientErr?.message}` };
    }

    const clientId = client.id;

    // 4. crm_leads tablosunda converted_client_id alanını ve status'ü güncelle
    const { error: updateLeadErr } = await supabase
      .from("crm_leads")
      .update({
        converted_client_id: clientId,
        status: "kazanildi",
        updated_at: new Date().toISOString()
      })
      .eq("id", leadId);

    if (updateLeadErr) {
      return { error: `Fırsat güncellemesi başarısız: ${updateLeadErr.message}` };
    }

    // 5. Bu lead'e bağlı olan teklifleri (teklifler tablosunda) yeni musteri_id ile ilişkilendir
    const { error: updateOffersErr } = await supabase
      .from("musteri_teklifler")
      .update({ musteri_id: clientId, durum: "kabul_edildi" })
      .eq("lead_id", leadId);

    if (updateOffersErr) {
      console.error("Teklifler güncellenirken hata oluştu (kritik değil, devam ediliyor):", updateOffersErr.message);
    }

    revalidatePath("/yonetim/crm-leads");
    revalidatePath(`/yonetim/crm-leads/${leadId}`);
    revalidatePath("/yonetim/musteriler");
    
    return { error: null, id: clientId };
  } catch (e) {
    return { error: String(e) };
  }
}
