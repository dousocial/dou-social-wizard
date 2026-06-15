"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/session";

async function getCurrentUsername(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("dou_sid")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session) redirect("/yonetim/giris");
  const { data } = await supabase
    .from("admin_users")
    .select("username")
    .eq("id", session.userId)
    .single();
  return data?.username ?? "bilinmiyor";
}

export async function addMessageNote(
  messageId: string,
  table: "contacts" | "audits",
  content: string
): Promise<void> {
  const username = await getCurrentUsername();
  await supabase.from("message_notes").insert({
    message_id: messageId,
    message_table: table,
    username,
    content: content.trim(),
  });
}

export async function deleteMessageNote(noteId: string): Promise<void> {
  const username = await getCurrentUsername();
  // Only delete own notes
  await supabase
    .from("message_notes")
    .delete()
    .eq("id", noteId)
    .eq("username", username);
}
