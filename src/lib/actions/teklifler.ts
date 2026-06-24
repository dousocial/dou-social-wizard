"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";

function sb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export type TeklifInput = {
  musteri_id?: string | null;
  lead_id?: string | null;
  company_id?: string | null;
  baslik: string;
  tutar?: number;
  durum?: "taslak" | "gonderildi" | "kabul_edildi" | "reddedildi" | "suresi_doldu" | "hazirlaniyor" | "gorusuluyor" | "kazanildi" | "kaybedildi";
  gonderim_tarihi?: string | null;
  notlar?: string;
  teklif_no?: string;
  hizmetler?: { ad: string; fiyat: number }[];
  paket_adi?: string;
  kurulum_ucreti?: number;
  ek_hizmetler?: string;
  teklif_tarihi?: string | null;
  gecerlilik_tarihi?: string | null;
};

export type ActionResult = { error: string | null };

export async function addTeklif(data: TeklifInput): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("musteri_teklifler").insert(data);
    if (error) return { error: error.message };
    
    if (data.musteri_id) revalidatePath(`/yonetim/musteriler/${data.musteri_id}`);
    if (data.lead_id) revalidatePath(`/yonetim/crm-leads/${data.lead_id}`);
    revalidatePath("/yonetim/crm-leads");
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}

export async function updateTeklif(id: string, ids: { musteriId?: string | null; leadId?: string | null }, data: Partial<TeklifInput>): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("musteri_teklifler").update(data).eq("id", id);
    if (error) return { error: error.message };
    
    if (ids.musteriId) revalidatePath(`/yonetim/musteriler/${ids.musteriId}`);
    if (ids.leadId) revalidatePath(`/yonetim/crm-leads/${ids.leadId}`);
    revalidatePath("/yonetim/crm-leads");
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}

export async function deleteTeklif(id: string, ids: { musteriId?: string | null; leadId?: string | null }): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("musteri_teklifler").delete().eq("id", id);
    if (error) return { error: error.message };
    
    if (ids.musteriId) revalidatePath(`/yonetim/musteriler/${ids.musteriId}`);
    if (ids.leadId) revalidatePath(`/yonetim/crm-leads/${ids.leadId}`);
    revalidatePath("/yonetim/crm-leads");
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}
