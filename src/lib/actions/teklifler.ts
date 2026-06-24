"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";

function sb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export type TeklifInput = {
  musteri_id: string;
  baslik: string;
  tutar?: number;
  durum?: string;
  gonderim_tarihi?: string | null;
  notlar?: string;
  teklif_no?: string;
  hizmetler?: { ad: string; fiyat: number }[];
};

export type ActionResult = { error: string | null };

export async function addTeklif(data: TeklifInput): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("musteri_teklifler").insert(data);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${data.musteri_id}`);
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}

export async function updateTeklif(id: string, musteriId: string, data: Partial<TeklifInput>): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("musteri_teklifler").update(data).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${musteriId}`);
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}

export async function deleteTeklif(id: string, musteriId: string): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("musteri_teklifler").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${musteriId}`);
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}
