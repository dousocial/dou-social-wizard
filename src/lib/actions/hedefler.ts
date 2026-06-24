"use server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
function sb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); }
export type ActionResult = { error: string | null };
export type HedefInput = { musteri_id: string; ay: string; ctr_hedef?: number; etkilesim_hedef?: number; takipci_hedef?: number; erisim_hedef?: number; ciro_hedef?: number; };
export async function upsertHedef(data: HedefInput): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("musteri_hedefler").upsert(data, { onConflict: "musteri_id,ay" });
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${data.musteri_id}`);
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}
export async function deleteHedef(id: string, musteriId: string): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("musteri_hedefler").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${musteriId}`);
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}
