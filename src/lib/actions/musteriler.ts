"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

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
  sorumlu?: string;
  durum?: string;
  platformlar?: string[];
  aylik_ucret?: number;
  baslangic_tarihi?: string | null;
  notlar?: string;
};

export async function addMusteri(data: MusteriInput) {
  const { error } = await sb().from("musteriler").insert(data);
  if (error) throw new Error(error.message);
  revalidatePath("/yonetim/musteriler");
}

export async function updateMusteri(id: string, data: MusteriInput) {
  const { error } = await sb()
    .from("musteriler")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/yonetim/musteriler");
  revalidatePath(`/yonetim/musteriler/${id}`);
}

export async function deleteMusteri(id: string) {
  const { error } = await sb().from("musteriler").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/yonetim/musteriler");
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

export async function addMetrik(data: MetrikInput) {
  const { error } = await sb().from("musteri_metrikleri").insert(data);
  if (error) throw new Error(error.message);
  revalidatePath(`/yonetim/musteriler/${data.musteri_id}`);
}

export async function updateMetrik(
  id: string,
  musteriId: string,
  data: Partial<Omit<MetrikInput, "musteri_id">>
) {
  const { error } = await sb()
    .from("musteri_metrikleri")
    .update(data)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/yonetim/musteriler/${musteriId}`);
}

export async function deleteMetrik(id: string, musteriId: string) {
  const { error } = await sb()
    .from("musteri_metrikleri")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/yonetim/musteriler/${musteriId}`);
}
