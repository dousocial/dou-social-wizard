"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/session";

function sb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export type TeklifInput = {
  musteri_id?: string | null;
  lead_id?: string | null;
  company_id?: string | null;
  baslik: string;
  tutar?: number;
  durum?: "taslak" | "hazirlaniyor" | "kontrol_bekliyor" | "gonderildi" | "goruldu" | "degerlendiriliyor" | "revize_istendi" | "kabul_edildi" | "reddedildi" | "suresi_doldu" | "gorusuluyor" | "kazanildi" | "kaybedildi";
  gonderim_tarihi?: string | null;
  notlar?: string;
  teklif_no?: string;
  hizmetler?: { ad: string; fiyat: number }[];
  paket_adi?: string;
  kurulum_ucreti?: number;
  ek_hizmetler?: string;
  teklif_tarihi?: string | null;
  gecerlilik_tarihi?: string | null;
  package_level?: "baslangic" | "orta" | "ileri" | null;
  rejection_reason?: string;
  revision_reason?: string;
  viewed_at?: string | null;
  package_details?: {
    post_count?: number;
    video_count?: number;
    shoot_day_count?: number;
    story_service?: boolean;
    advertising_management?: boolean;
    account_management?: boolean;
    content_copy?: boolean;
    design_service?: boolean;
    video_editing?: boolean;
  };
};

export type ActionResult = { error: string | null };

export async function addTeklif(data: TeklifInput): Promise<ActionResult> {
  try {
    await requirePermission("crm.write");
    const { error } = await sb().from("musteri_teklifler").insert(data);
    if (error) return { error: error.message };
    
    if (data.musteri_id) revalidatePath(`/yonetim/musteriler/${data.musteri_id}`);
    if (data.lead_id) revalidatePath(`/yonetim/crm-leads/${data.lead_id}`);
    revalidatePath("/yonetim/musteriler");
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}

export async function updateTeklif(id: string, ids: { musteriId?: string | null; leadId?: string | null }, data: Partial<TeklifInput>): Promise<ActionResult> {
  try {
    await requirePermission("crm.write");
    const { error } = await sb().from("musteri_teklifler").update(data).eq("id", id);
    if (error) return { error: error.message };
    
    if (ids.musteriId) revalidatePath(`/yonetim/musteriler/${ids.musteriId}`);
    if (ids.leadId) revalidatePath(`/yonetim/crm-leads/${ids.leadId}`);
    revalidatePath("/yonetim/musteriler");
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}

export async function deleteTeklif(id: string, ids: { musteriId?: string | null; leadId?: string | null }): Promise<ActionResult> {
  try {
    await requirePermission("crm.write");
    const { error } = await sb().from("musteri_teklifler").delete().eq("id", id);
    if (error) return { error: error.message };
    
    if (ids.musteriId) revalidatePath(`/yonetim/musteriler/${ids.musteriId}`);
    if (ids.leadId) revalidatePath(`/yonetim/crm-leads/${ids.leadId}`);
    revalidatePath("/yonetim/musteriler");
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}

export async function createThreePackageOffers(leadId: string, companyId?: string | null): Promise<ActionResult> {
  try {
    await requirePermission("crm.write");
    const supabase = sb();
    const { data: existing, error: readError } = await supabase
      .from("musteri_teklifler")
      .select("package_level")
      .eq("lead_id", leadId)
      .in("package_level", ["baslangic", "orta", "ileri"]);
    if (readError) return { error: readError.message };

    const existingLevels = new Set((existing ?? []).map(item => item.package_level));
    const timestamp = Date.now().toString().slice(-8);
    const templates: Array<TeklifInput & { package_level: "baslangic" | "orta" | "ileri" }> = [
      {
        lead_id: leadId, company_id: companyId || null, package_level: "baslangic",
        paket_adi: "Başlangıç Paketi", baslik: "Başlangıç Sosyal Medya Paketi", teklif_no: `BAS-${timestamp}`,
        tutar: 0, durum: "taslak", teklif_tarihi: new Date().toISOString().slice(0, 10),
        hizmetler: [], package_details: { post_count: 4, video_count: 4, shoot_day_count: 1, story_service: true, account_management: true, content_copy: true, design_service: true, video_editing: true, advertising_management: false },
      },
      {
        lead_id: leadId, company_id: companyId || null, package_level: "orta",
        paket_adi: "Orta Seviye Paket", baslik: "Orta Seviye Sosyal Medya Paketi", teklif_no: `ORT-${timestamp}`,
        tutar: 0, durum: "taslak", teklif_tarihi: new Date().toISOString().slice(0, 10),
        hizmetler: [], package_details: { post_count: 6, video_count: 8, shoot_day_count: 2, story_service: true, account_management: true, content_copy: true, design_service: true, video_editing: true, advertising_management: true },
      },
      {
        lead_id: leadId, company_id: companyId || null, package_level: "ileri",
        paket_adi: "İleri Seviye Paket", baslik: "İleri Seviye Büyüme Paketi", teklif_no: `ILR-${timestamp}`,
        tutar: 0, durum: "taslak", teklif_tarihi: new Date().toISOString().slice(0, 10),
        hizmetler: [], package_details: { post_count: 8, video_count: 12, shoot_day_count: 3, story_service: true, account_management: true, content_copy: true, design_service: true, video_editing: true, advertising_management: true },
      },
    ];
    const missing = templates.filter(template => !existingLevels.has(template.package_level));
    if (missing.length === 0) return { error: "Üç paket seviyesi de zaten oluşturulmuş." };
    const { error } = await supabase.from("musteri_teklifler").insert(missing);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/crm-leads/${leadId}`);
    return { error: null };
  } catch (error) {
    return { error: String(error) };
  }
}
