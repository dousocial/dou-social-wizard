"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type ContentTaskInput = {
  client_id: string;
  title: string;
  type: "reels" | "post" | "story" | "blog" | "reklam" | "cekim";
  status?: "fikir" | "cekilecek" | "cekildi" | "editte" | "onayda" | "yayinta";
  assigned_person?: string;
  due_date?: string | null;
};

export type ActionResult = { error: string | null };

export async function addContentTask(data: ContentTaskInput): Promise<ActionResult> {
  try {
    const { error } = await sb().from("crm_content_tasks").insert(data);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${data.client_id}`);
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function updateContentTask(id: string, clientId: string, data: Partial<ContentTaskInput>): Promise<ActionResult> {
  try {
    const { error } = await sb()
      .from("crm_content_tasks")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${clientId}`);
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function deleteContentTask(id: string, clientId: string): Promise<ActionResult> {
  try {
    const { error } = await sb().from("crm_content_tasks").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${clientId}`);
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}
