"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type FollowUpInput = {
  lead_id: string;
  follow_up_date: string;
  type: "arama" | "whatsapp" | "eposta" | "toplanti" | "instagram_dm";
  note?: string;
  completed?: boolean;
};

export type ActionResult = { error: string | null };

export async function addFollowUp(data: FollowUpInput): Promise<ActionResult> {
  const supabase = sb();
  try {
    await requireSession();
    const { error } = await supabase.from("crm_follow_ups").insert(data);
    if (error) return { error: error.message };

    // Fırsatın next_follow_up_date ve last_contact_date değerlerini otomatik güncelle
    const { error: leadErr } = await supabase
      .from("crm_leads")
      .update({
        next_follow_up_date: data.follow_up_date,
        last_contact_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", data.lead_id);

    if (leadErr) console.error("Fırsat takip tarihi güncellenemedi:", leadErr.message);

    revalidatePath("/yonetim");
    revalidatePath("/yonetim/musteriler");
    revalidatePath(`/yonetim/crm-leads/${data.lead_id}`);
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function updateFollowUp(id: string, leadId: string, data: Partial<FollowUpInput>): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("crm_follow_ups").update(data).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim");
    revalidatePath("/yonetim/musteriler");
    revalidatePath(`/yonetim/crm-leads/${leadId}`);
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function toggleFollowUpCompleted(id: string, leadId: string, completed: boolean): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb()
      .from("crm_follow_ups")
      .update({ completed })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim");
    revalidatePath("/yonetim/musteriler");
    revalidatePath(`/yonetim/crm-leads/${leadId}`);
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function deleteFollowUp(id: string, leadId: string): Promise<ActionResult> {
  try {
    await requireSession();
    const { error } = await sb().from("crm_follow_ups").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/yonetim");
    revalidatePath("/yonetim/musteriler");
    revalidatePath(`/yonetim/crm-leads/${leadId}`);
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}
