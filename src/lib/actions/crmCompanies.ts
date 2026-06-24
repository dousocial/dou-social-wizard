"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type CompanyInput = {
  name: string;
  website?: string;
  sector?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  notes?: string;
  assigned_user?: string;
};

export type ActionResult = { error: string | null; id?: string };

export async function addCompany(data: CompanyInput): Promise<ActionResult> {
  try {
    const { data: newComp, error } = await sb().from("crm_companies").insert(data).select("id").single();
    if (error) return { error: error.message };
    revalidatePath("/yonetim/firmalar");
    return { error: null, id: newComp.id };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function updateCompany(id: string, data: Partial<CompanyInput>): Promise<ActionResult> {
  try {
    const { error } = await sb()
      .from("crm_companies")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim/firmalar");
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function deleteCompany(id: string): Promise<ActionResult> {
  try {
    const { error } = await sb().from("crm_companies").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim/firmalar");
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}
