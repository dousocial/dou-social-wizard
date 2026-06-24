"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type ActionResult = { error: string | null; id?: string };

// ─── Influencer CRUD ─────────────────────────────────────────────────────────

export type HesapEntry = {
  platform: "instagram" | "youtube" | "tiktok" | "twitter" | "linkedin" | "diger";
  handle: string;
  followers: number;
  engagement_rate: number;
};

export type InfluencerInput = {
  ad: string;
  soyad?: string;
  email?: string;
  telefon?: string;
  sehir?: string;
  ulke?: string;
  hesaplar?: HesapEntry[];
  kategori?: string[];
  nis_etiketler?: string[];
  durum?: "havuz" | "aktif" | "kara_liste";
  kara_liste_nedeni?: string;
  min_ucret?: number;
  max_ucret?: number;
  para_birimi?: string;
  ajans_adi?: string;
  temsilci_adi?: string;
  temsilci_telefon?: string;
  notlar?: string;
  ic_notlar?: string;
  sorumlu?: string;
};

export async function addInfluencer(data: InfluencerInput): Promise<ActionResult> {
  try {
    const { data: row, error } = await sb()
      .from("influencers")
      .insert(data)
      .select("id")
      .single();
    if (error) return { error: error.message };
    revalidatePath("/yonetim/influencerlar");
    return { error: null, id: row.id };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function updateInfluencer(
  id: string,
  data: Partial<InfluencerInput>
): Promise<ActionResult> {
  try {
    const { error } = await sb()
      .from("influencers")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim/influencerlar");
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function deleteInfluencer(id: string): Promise<ActionResult> {
  try {
    const { error } = await sb().from("influencers").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim/influencerlar");
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

// ─── Collaboration CRUD ──────────────────────────────────────────────────────

export type CollaborationInput = {
  influencer_id: string;
  musteri_id?: string | null;
  musteri_adi?: string;
  kampanya_adi: string;
  icerik_tipi?: string;
  platform?: string;
  baslangic_tarihi?: string | null;
  bitis_tarihi?: string | null;
  durum?: "planlandi" | "uretimde" | "yayinda" | "tamamlandi" | "iptal";
  anlasilan_ucret?: number;
  odenen_ucret?: number;
  para_birimi?: string;
  erisim?: number;
  izlenme?: number;
  etkilesim?: number;
  tiklama?: number;
  donusum?: number;
  icerik_url?: string;
  brief_notlar?: string;
  sonuc_notlar?: string;
};

export async function addCollaboration(data: CollaborationInput): Promise<ActionResult> {
  try {
    const { data: row, error } = await sb()
      .from("influencer_collaborations")
      .insert(data)
      .select("id")
      .single();
    if (error) return { error: error.message };
    revalidatePath("/yonetim/influencerlar");
    return { error: null, id: row.id };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function updateCollaboration(
  id: string,
  data: Partial<CollaborationInput>
): Promise<ActionResult> {
  try {
    const { error } = await sb()
      .from("influencer_collaborations")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim/influencerlar");
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function deleteCollaboration(id: string): Promise<ActionResult> {
  try {
    const { error } = await sb()
      .from("influencer_collaborations")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim/influencerlar");
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

// ─── Project Links CRUD ──────────────────────────────────────────────────────

export type ProjectLinkInput = {
  influencer_id: string;
  proje_adi: string;
  rol?: string;
  tarih?: string | null;
  notlar?: string;
};

export async function addProjectLink(data: ProjectLinkInput): Promise<ActionResult> {
  try {
    const { data: row, error } = await sb()
      .from("influencer_projects")
      .insert(data)
      .select("id")
      .single();
    if (error) return { error: error.message };
    revalidatePath("/yonetim/influencerlar");
    return { error: null, id: row.id };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function deleteProjectLink(id: string): Promise<ActionResult> {
  try {
    const { error } = await sb()
      .from("influencer_projects")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim/influencerlar");
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}
