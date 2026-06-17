"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function sb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export type GorevInput = {
  musteri_id: string;
  baslik: string;
  aciklama?: string;
  bitis_tarihi?: string | null;
  oncelik?: string;
};

export type ActionResult = { error: string | null };

export async function addGorev(data: GorevInput): Promise<ActionResult> {
  try {
    const { error } = await sb().from("musteri_gorevler").insert(data);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${data.musteri_id}`);
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}

export async function updateGorev(id: string, musteriId: string, data: Partial<GorevInput & { tamamlandi: boolean }>): Promise<ActionResult> {
  try {
    const { error } = await sb().from("musteri_gorevler").update(data).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${musteriId}`);
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}

export async function deleteGorev(id: string, musteriId: string): Promise<ActionResult> {
  try {
    const { error } = await sb().from("musteri_gorevler").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${musteriId}`);
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}
