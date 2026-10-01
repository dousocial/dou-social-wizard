"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/session";
import { cleanMultiline, cleanText } from "@/lib/crmValidation";

function sb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); }
const path = "/yonetim/uretim";
type Result = { error: string | null; id?: string };
export type JobKind = "edit" | "design";

export type EditJobInput = { client_id: string; title: string; video_type?: string; editor?: string; priority?: "dusuk"|"normal"|"yuksek"|"acil"; queue_position?: number; estimated_work_minutes?: number; due_date?: string|null; drive_url?: string; raw_folder_url?: string; selected_media_url?: string; reference_url?: string; coordinator_note?: string; technique_notes?: string; status?: string; media_sorting_completed?: boolean };
export type DesignJobInput = { client_id: string; title: string; design_type?: string; dimensions?: string; designer?: string; priority?: "dusuk"|"normal"|"yuksek"|"acil"; queue_position?: number; estimated_work_minutes?: number; due_date?: string|null; drive_url?: string; reference_url?: string; copy_text?: string; campaign_info?: string; status?: string };

export async function addEditJob(data: EditJobInput): Promise<Result> {
  try { await requirePermission("content.write"); if (!data.client_id || !cleanText(data.title)) return { error: "Müşteri ve başlık zorunludur." }; const payload = { ...data, title: cleanText(data.title), editor: cleanText(data.editor), drive_url: cleanText(data.drive_url), raw_folder_url: cleanText(data.raw_folder_url), selected_media_url: cleanText(data.selected_media_url), reference_url: cleanText(data.reference_url), coordinator_note: cleanMultiline(data.coordinator_note), technique_notes: cleanMultiline(data.technique_notes) }; const { data: row, error } = await sb().from("crm_edit_jobs").insert(payload).select("id").single(); if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." }; revalidatePath(path); return { error: null, id: row.id }; } catch (error) { return { error: String(error) }; }
}
export async function addDesignJob(data: DesignJobInput): Promise<Result> {
  try { await requirePermission("content.write"); if (!data.client_id || !cleanText(data.title)) return { error: "Müşteri ve başlık zorunludur." }; const payload = { ...data, title: cleanText(data.title), designer: cleanText(data.designer), dimensions: cleanText(data.dimensions), drive_url: cleanText(data.drive_url), reference_url: cleanText(data.reference_url), copy_text: cleanMultiline(data.copy_text), campaign_info: cleanMultiline(data.campaign_info) }; const { data: row, error } = await sb().from("crm_design_jobs").insert(payload).select("id").single(); if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." }; revalidatePath(path); return { error: null, id: row.id }; } catch (error) { return { error: String(error) }; }
}
export async function updateJobStatus(kind: JobKind, id: string, status: string): Promise<Result> {
  try { await requirePermission("content.write"); const table = kind === "edit" ? "crm_edit_jobs" : "crm_design_jobs"; const { error } = await sb().from(table).update({ status, updated_at: new Date().toISOString() }).eq("id", id); if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." }; revalidatePath(path); return { error: null }; } catch (error) { return { error: String(error) }; }
}
export async function moveJob(kind: JobKind, id: string, direction: "up"|"down", reason: string): Promise<Result> {
  try {
    const session = await requirePermission("content.write"); if (!cleanText(reason)) return { error: "Sıra değişikliği nedeni zorunludur." };
    const supabase = sb(); const table = kind === "edit" ? "crm_edit_jobs" : "crm_design_jobs";
    const { data: current, error: currentError } = await supabase.from(table).select("id,queue_position").eq("id", id).single(); if (currentError || !current) return { error: currentError?.message || "İş bulunamadı." };
    let query = supabase.from(table).select("id,queue_position");
    query = direction === "up" ? query.lt("queue_position", current.queue_position).order("queue_position", { ascending: false }).limit(1) : query.gt("queue_position", current.queue_position).order("queue_position", { ascending: true }).limit(1);
    const { data: neighbors, error: neighborError } = await query; if (neighborError) return { error: neighborError.message }; const neighbor = neighbors?.[0]; if (!neighbor) return { error: "İş zaten listenin sınırında." };
    const { error: firstError } = await supabase.from(table).update({ queue_position: neighbor.queue_position, updated_at: new Date().toISOString() }).eq("id", current.id); if (firstError) return { error: firstError.message };
    const { error: secondError } = await supabase.from(table).update({ queue_position: current.queue_position, updated_at: new Date().toISOString() }).eq("id", neighbor.id); if (secondError) return { error: secondError.message };
    await supabase.from("crm_activity_logs").insert({ user_id: session.userId, entity_type: `${kind}_job`, entity_id: id, action: "queue_moved", details: { direction, previous_position: current.queue_position, new_position: neighbor.queue_position, reason: cleanText(reason) } });
    revalidatePath(path); return { error: null };
  } catch (error) { return { error: String(error) }; }
}
export async function addRevision(data: { job_type: JobKind; job_id: string; requested_by: string; reason: string; description: string; assigned_to?: string; due_date?: string|null }): Promise<Result> {
  try { await requirePermission("content.write"); if (!cleanText(data.requested_by) || !cleanText(data.reason) || !cleanText(data.description)) return { error: "Revize isteyen, neden ve açıklama zorunludur." }; const supabase = sb(); const foreign = data.job_type === "edit" ? { edit_job_id: data.job_id, design_job_id: null } : { edit_job_id: null, design_job_id: data.job_id }; const { count } = await supabase.from("crm_revisions").select("id", { count: "exact", head: true }).eq(data.job_type === "edit" ? "edit_job_id" : "design_job_id", data.job_id); const { data: row, error } = await supabase.from("crm_revisions").insert({ job_type: data.job_type, ...foreign, requested_by: cleanText(data.requested_by), reason: cleanText(data.reason), description: cleanMultiline(data.description), assigned_to: cleanText(data.assigned_to), due_date: data.due_date || null, revision_round: (count ?? 0) + 1 }).select("id").single(); if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." }; await supabase.from(data.job_type === "edit" ? "crm_edit_jobs" : "crm_design_jobs").update({ status: "revizede", updated_at: new Date().toISOString() }).eq("id", data.job_id); revalidatePath(path); return { error: null, id: row.id }; } catch (error) { return { error: String(error) }; }
}
export async function toggleRevision(id: string, completed: boolean): Promise<Result> {
  try { await requirePermission("content.write"); const { error } = await sb().from("crm_revisions").update({ completed, updated_at: new Date().toISOString() }).eq("id", id); if (error) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." }; revalidatePath(path); return { error: null }; } catch (error) { return { error: String(error) }; }
}
