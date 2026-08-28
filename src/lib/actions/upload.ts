"use server";

import { requirePermission } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

export type UploadResult = { url?: string; error?: string };

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  try {
    await requirePermission("content.write");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("NEXT_REDIRECT")) throw e;
    return { error: "Yetkisiz erişim" };
  }

  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string | null) ?? "blog";

  if (!file || file.size === 0) return { error: "Dosya seçilmedi" };
  if (!file.type.startsWith("image/")) return { error: "Sadece görsel dosyası yüklenebilir" };
  if (file.size > 20 * 1024 * 1024) return { error: "Dosya 20 MB'dan küçük olmalı" };

  const buffer = Buffer.from(await file.arrayBuffer());

  // Sharp: max 1200px genişlik, WebP, kalite 82 — orijinalden büyütme
  const optimized = await sharp(buffer)
    .resize(1200, null, { withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const storagePath = `${folder}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(storagePath, optimized, { contentType: "image/webp", upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data } = supabase.storage.from("media").getPublicUrl(storagePath);
  return { url: data.publicUrl };
}
