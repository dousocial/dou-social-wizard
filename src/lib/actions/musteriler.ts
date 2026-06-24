"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import {
  cleanMultiline,
  cleanText,
  formatPhoneTR,
  isValidPhoneTR,
  isValidTaxNumber,
  normalizeTaxNumber,
} from "@/lib/crmValidation";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type MusteriInput = {
  ad: string;
  sektor: string;
  website?: string;
  email?: string;
  telefon?: string;
  vergi_numarasi?: string;
  sorumlu?: string;
  durum?: string;
  platformlar?: string[];
  aylik_ucret?: number;
  baslangic_tarihi?: string | null;
  notlar?: string;
  sozlesme_bitis_tarihi?: string | null;
  yenileme_hatirlatma_gun?: number;
};

export type ActionResult = { error: string | null };

function normalizeMusteriInput(data: MusteriInput): { data?: MusteriInput; error?: string } {
  const cleaned: MusteriInput = {
    ...data,
    ad: cleanText(data.ad),
    sektor: cleanText(data.sektor),
    website: cleanText(data.website),
    email: cleanText(data.email),
    telefon: formatPhoneTR(data.telefon),
    vergi_numarasi: data.vergi_numarasi !== undefined ? normalizeTaxNumber(data.vergi_numarasi) : undefined,
    sorumlu: cleanText(data.sorumlu),
    notlar: cleanMultiline(data.notlar),
    platformlar: data.platformlar ?? [],
  };

  if (!cleaned.ad) return { error: "Müşteri adı zorunludur." };
  if (!cleaned.sektor) return { error: "Sektör zorunludur." };
  if (!cleaned.sorumlu) return { error: "Sorumlu kişi zorunludur." };
  if (!isValidPhoneTR(cleaned.telefon, true)) return { error: "Telefon formatı geçersiz. Örnek: 0555 555 5555" };
  if (data.vergi_numarasi !== undefined && !isValidTaxNumber(cleaned.vergi_numarasi)) {
    return { error: "Vergi numarası 10 veya 11 haneli olmalıdır." };
  }

  return { data: cleaned };
}

export async function addMusteri(data: MusteriInput): Promise<ActionResult> {
  try {
    await requireSession();
    const normalized = normalizeMusteriInput(data);
    if (normalized.error || !normalized.data) return { error: normalized.error ?? "Geçersiz müşteri verisi." };
    const { error } = await sb().from("musteriler").insert(normalized.data);
    if (error) return { error: error.message };
    revalidatePath("/yonetim/musteriler");
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function updateMusteri(id: string, data: MusteriInput): Promise<ActionResult> {
  try {
    await requireSession();
    const normalized = normalizeMusteriInput(data);
    if (normalized.error || !normalized.data) return { error: normalized.error ?? "Geçersiz müşteri verisi." };
    const { error } = await sb()
      .from("musteriler")
      .update({ ...normalized.data, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim/musteriler");
    revalidatePath(`/yonetim/musteriler/${id}`);
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function deleteMusteri(id: string): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("musteriler").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim/musteriler");
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export type MetrikInput = {
  musteri_id: string;
  ay: string;
  reklam_butcesi?: number;
  etkilesim_orani?: number;
  takipci_artisi?: number;
  toplam_erisim?: number;
  tiklama_orani?: number;
  tiklama_sayisi?: number;
  donusum_sayisi?: number;
  musteri_cirosu?: number;
  notlar?: string;
};

export async function addMetrik(data: MetrikInput): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("musteri_metrikleri").insert(data);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${data.musteri_id}`);
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function updateMetrik(
  id: string,
  musteriId: string,
  data: Partial<Omit<MetrikInput, "musteri_id">>
): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb()
      .from("musteri_metrikleri")
      .update(data)
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${musteriId}`);
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function deleteMetrik(id: string, musteriId: string): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb()
      .from("musteri_metrikleri")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${musteriId}`);
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}
