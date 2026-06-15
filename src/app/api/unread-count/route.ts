import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("dou_sid")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [contactsRes, auditsRes, latestContactRes, latestAuditRes] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("audits").select("*", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("contacts").select("created_at").order("created_at", { ascending: false }).limit(1),
    supabase.from("audits").select("created_at").order("created_at", { ascending: false }).limit(1),
  ]);

  return NextResponse.json({
    contacts: contactsRes.count ?? 0,
    audits: auditsRes.count ?? 0,
    total: (contactsRes.count ?? 0) + (auditsRes.count ?? 0),
    latestContactAt: latestContactRes.data?.[0]?.created_at ?? null,
    latestAuditAt: latestAuditRes.data?.[0]?.created_at ?? null,
  });
}
