"use server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
function sb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); }
export type ActionResult = { error: string | null };
export type FaturaInput = { musteri_id: string; fatura_no?: string; tutar: number; vade_tarihi: string; odeme_tarihi?: string | null; durum?: string; notlar?: string; };
export async function addFatura(data: FaturaInput): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("musteri_faturalar").insert(data);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${data.musteri_id}`);
    revalidatePath("/yonetim/musteriler");
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}
export async function updateFatura(id: string, musteriId: string, data: Partial<FaturaInput>): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("musteri_faturalar").update(data).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${musteriId}`);
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}
export async function deleteFatura(id: string, musteriId: string): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("musteri_faturalar").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${musteriId}`);
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}
export async function markOdendi(id: string, musteriId: string): Promise<ActionResult> {
  try {
    await requireSession();
    const today = new Date().toISOString().split("T")[0];
    const { error } = await sb().from("musteri_faturalar").update({ durum: "odendi", odeme_tarihi: today }).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${musteriId}`);
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}
