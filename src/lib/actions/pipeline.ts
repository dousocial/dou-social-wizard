"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";

function sb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
export type ActionResult = { error: string | null };

export async function movePipelineAsama(id: string, asama: string): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("musteriler").update({ pipeline_asamasi: asama }).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim/pipeline");
    revalidatePath("/yonetim/musteriler");
    return { error: null };
  } catch (e) { return { error: String(e) }; }
}
