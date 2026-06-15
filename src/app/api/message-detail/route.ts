import { cookies } from "next/headers";
import { verifyToken } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("dou_sid")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const table = searchParams.get("table") as "contacts" | "audits" | null;

  if (!id || !table || !["contacts", "audits"].includes(table)) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const [readsResult, notesResult, usersResult, meResult] = await Promise.all([
    supabase
      .from("message_reads")
      .select("username, read_at")
      .eq("message_id", id)
      .eq("message_table", table)
      .order("read_at", { ascending: true }),
    supabase
      .from("message_notes")
      .select("id, username, content, created_at")
      .eq("message_id", id)
      .eq("message_table", table)
      .order("created_at", { ascending: true }),
    supabase
      .from("admin_users")
      .select("username")
      .order("created_at", { ascending: true }),
    supabase
      .from("admin_users")
      .select("username")
      .eq("id", session.userId)
      .single(),
  ]);

  return Response.json({
    reads: readsResult.data ?? [],
    notes: notesResult.data ?? [],
    allUsers: (usersResult.data ?? []).map((u: { username: string }) => u.username),
    currentUsername: meResult.data?.username ?? "",
  });
}
