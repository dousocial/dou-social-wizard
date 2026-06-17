"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function sb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export type IletisimInput = {
  musteri_id: string;
  tarih: string;
  tip: string;
  baslik: string;
  icerik?: string;
};

export type ActionResult = { error: string | null };

export async function addIletisim(data: IletisimInput): Promise<ActionResult> {
  try {
    const { error } = await sb().from("musteri_iletisimler").insert(data);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${data.musteri_id}`);
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}

export async function deleteIletisim(id: string, musteriId: string): Promise<ActionResult> {
  try {
    const { error } = await sb().from("musteri_iletisimler").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${musteriId}`);
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}
