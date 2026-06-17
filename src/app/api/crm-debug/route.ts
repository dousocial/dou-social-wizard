import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) return NextResponse.json({ ok: false, error: "NEXT_PUBLIC_SUPABASE_URL eksik" });
  if (!key) return NextResponse.json({ ok: false, error: "SUPABASE_SERVICE_ROLE_KEY eksik" });

  try {
    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("musteriler")
      .select("id, ad, durum")
      .limit(3);

    if (error) {
      return NextResponse.json({
        ok: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    }

    return NextResponse.json({ ok: true, rowCount: data?.length ?? 0, sample: data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) });
  }
}
