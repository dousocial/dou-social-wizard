"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

// List view quick-mark — still used by ReadToggleButton in list
export async function markContactRead(id: string, isRead: boolean): Promise<void> {
  const username = await getCurrentUsername();
  await supabase.from("contacts").update({
    is_read: isRead,
    read_by: isRead ? username : null,
    read_at: isRead ? new Date().toISOString() : null,
  }).eq("id", id);
  if (isRead) {
    await supabase.from("message_reads").upsert(
      { message_id: id, message_table: "contacts", username, read_at: new Date().toISOString() },
      { onConflict: "message_id,message_table,username", ignoreDuplicates: true }
    );
  }
  revalidatePath("/yonetim/contacts");
}

export async function markLeadRead(id: string, isRead: boolean): Promise<void> {
  const username = await getCurrentUsername();
  await supabase.from("audits").update({
    is_read: isRead,
    read_by: isRead ? username : null,
    read_at: isRead ? new Date().toISOString() : null,
  }).eq("id", id);
  if (isRead) {
    await supabase.from("message_reads").upsert(
      { message_id: id, message_table: "audits", username, read_at: new Date().toISOString() },
      { onConflict: "message_id,message_table,username", ignoreDuplicates: true }
    );
  }
  revalidatePath("/yonetim/leads");
}

// Modal read — per-user, doesn't unmark
export async function markMessageRead(messageId: string, table: "contacts" | "audits"): Promise<void> {
  const username = await getCurrentUsername();
  const now = new Date().toISOString();

  await supabase.from("message_reads").upsert(
    { message_id: messageId, message_table: table, username, read_at: now },
    { onConflict: "message_id,message_table,username", ignoreDuplicates: true }
  );

  // Also flip is_read on the parent row if it wasn't already
  const parentTable = table === "contacts" ? "contacts" : "audits";
  await supabase.from(parentTable)
    .update({ is_read: true, read_by: username, read_at: now })
    .eq("id", messageId)
    .eq("is_read", false);

  revalidatePath(table === "contacts" ? "/yonetim/contacts" : "/yonetim/leads");
}
