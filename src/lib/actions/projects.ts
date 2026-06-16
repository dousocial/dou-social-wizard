"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/session";

export type ProjectActionState = { error?: string; success?: boolean; id?: string } | null;

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("dou_sid")?.value;
  if (!token) redirect("/yonetim/giris");
  const session = verifyToken(token);
  if (!session) redirect("/yonetim/giris");
  return session;
}

function isNextRedirect(err: unknown): boolean {
  return (
    typeof err === "object" && err !== null && "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseLines(formData: FormData, prefix: string): string[] {
  const items: string[] = [];
  for (let i = 0; i < 20; i++) {
    const val = formData.get(`${prefix}_${i}`);
    if (val === null) break;
    const str = String(val).trim();
    if (str) items.push(str);
  }
  return items;
}

function parseSteps(formData: FormData): { title: string; description: string }[] {
  const steps: { title: string; description: string }[] = [];
  for (let i = 0; i < 10; i++) {
    const title = formData.get(`approach_step_title_${i}`);
    if (title === null) break;
    const description = String(formData.get(`approach_step_desc_${i}`) ?? "").trim();
    const titleStr = String(title).trim();
    if (titleStr) steps.push({ title: titleStr, description });
  }
  return steps;
}

function parseMetrics(formData: FormData): { value: string; label: string }[] {
  const metrics: { value: string; label: string }[] = [];
  for (let i = 0; i < 10; i++) {
    const value = formData.get(`metric_value_${i}`);
    if (value === null) break;
    const label = String(formData.get(`metric_label_${i}`) ?? "").trim();
    const valStr = String(value).trim();
    if (valStr) metrics.push({ value: valStr, label });
  }
  return metrics;
}

function buildPayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const slug = rawSlug || slugify(title);

  return {
    locale:              String(formData.get("locale") ?? "tr"),
    slug,
    title,
    seo_title:           String(formData.get("seo_title") ?? "").trim() || null,
    summary:             String(formData.get("summary") ?? "").trim(),
    industry:            String(formData.get("industry") ?? "").trim(),
    duration:            String(formData.get("duration") ?? "").trim(),
    cover_metric:        String(formData.get("cover_metric") ?? "").trim(),
    cover_metric_label:  String(formData.get("cover_metric_label") ?? "").trim(),
    cover_image:         String(formData.get("cover_image") ?? "").trim() || null,
    challenge_title:     String(formData.get("challenge_title") ?? "").trim(),
    challenge_intro:     String(formData.get("challenge_intro") ?? "").trim(),
    challenge_points:    parseLines(formData, "challenge_point"),
    approach_title:      String(formData.get("approach_title") ?? "").trim(),
    approach_steps:      parseSteps(formData),
    results_title:       String(formData.get("results_title") ?? "").trim(),
    results_summary:     String(formData.get("results_summary") ?? "").trim(),
    results_metrics:     parseMetrics(formData),
    gallery_images:      parseLines(formData, "gallery_image"),
    is_published:        formData.get("is_published") === "true",
  };
}

export async function createProject(
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  try {
    await requireAdmin();

    const payload = buildPayload(formData);
    if (!payload.title) return { error: "Başlık gerekli" };
    if (!payload.slug) return { error: "Slug gerekli" };

    const { data, error } = await supabase
      .from("projects")
      .insert(payload)
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/tr/projeler");
    revalidatePath("/en/projeler");

    return { success: true, id: data.id };
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateProject(
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  try {
    await requireAdmin();

    const id = String(formData.get("id") ?? "");
    if (!id) return { error: "ID gerekli" };

    const payload = buildPayload(formData);
    if (!payload.title) return { error: "Başlık gerekli" };

    const { error } = await supabase
      .from("projects")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/tr/projeler");
    revalidatePath("/en/projeler");
    revalidatePath(`/tr/projeler/${payload.slug}`);

    return { success: true };
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteProject(
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  try {
    await requireAdmin();

    const id = String(formData.get("id") ?? "");
    if (!id) return { error: "ID gerekli" };

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/tr/projeler");
    revalidatePath("/en/projeler");

    return { success: true };
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
