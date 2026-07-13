"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/session";
import { cleanMultiline, cleanText } from "@/lib/crmValidation";

function sb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export type MeetingInput = {
  lead_id: string;
  meeting_at: string;
  location?: string;
  participants?: string[];
  purpose?: string;
  current_problems?: string;
  expectations?: string;
  current_accounts?: string;
  requested_services?: string[];
  estimated_monthly_budget?: number | null;
  notes?: string;
};

export type ActionResult = { error: string | null; id?: string };

function normalize(data: MeetingInput) {
  return {
    ...data,
    location: cleanText(data.location),
    participants: (data.participants ?? []).map(cleanText).filter(Boolean),
    purpose: cleanText(data.purpose),
    current_problems: cleanMultiline(data.current_problems),
    expectations: cleanMultiline(data.expectations),
    current_accounts: cleanMultiline(data.current_accounts),
    requested_services: (data.requested_services ?? []).map(cleanText).filter(Boolean),
    notes: cleanMultiline(data.notes),
  };
}

export async function addMeeting(data: MeetingInput): Promise<ActionResult> {
  try {
    await requirePermission("crm.write");
    if (!data.lead_id || !data.meeting_at) return { error: "Fırsat ve görüşme tarihi zorunludur." };
    const { data: meeting, error } = await sb().from("crm_meetings").insert(normalize(data)).select("id").single();
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/crm-leads/${data.lead_id}`);
    return { error: null, id: meeting.id };
  } catch (error) {
    return { error: String(error) };
  }
}

export async function updateMeeting(id: string, leadId: string, data: Partial<MeetingInput>): Promise<ActionResult> {
  try {
    await requirePermission("crm.write");
    const normalized = normalize({ lead_id: leadId, meeting_at: data.meeting_at ?? new Date().toISOString(), ...data });
    const { lead_id: _leadId, ...payload } = normalized;
    void _leadId;
    const { error } = await sb().from("crm_meetings").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id).eq("lead_id", leadId);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/crm-leads/${leadId}`);
    return { error: null };
  } catch (error) {
    return { error: String(error) };
  }
}

export async function deleteMeeting(id: string, leadId: string): Promise<ActionResult> {
  try {
    await requirePermission("crm.write");
    const { error } = await sb().from("crm_meetings").delete().eq("id", id).eq("lead_id", leadId);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/crm-leads/${leadId}`);
    return { error: null };
  } catch (error) {
    return { error: String(error) };
  }
}
