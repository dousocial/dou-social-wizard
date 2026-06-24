"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type ContactInput = {
  company_id: string;
  name: string;
  phone?: string;
  email?: string;
  role?: string;
  instagram?: string;
  notes?: string;
};

export type ActionResult = { error: string | null };

export async function addContact(data: ContactInput): Promise<ActionResult> {
  try {
    const { error } = await sb().from("crm_contacts").insert(data);
    if (error) return { error: error.message };
    revalidatePath("/yonetim/firmalar");
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function updateContact(id: string, data: Partial<ContactInput>): Promise<ActionResult> {
  try {
    const { error } = await sb()
      .from("crm_contacts")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim/firmalar");
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function deleteContact(id: string): Promise<ActionResult> {
  try {
    const { error } = await sb().from("crm_contacts").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim/firmalar");
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}
