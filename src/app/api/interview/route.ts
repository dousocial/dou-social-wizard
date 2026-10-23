import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Public booking is closed. Existing records remain available in the separate CRM.
function closed() {
  return NextResponse.json(
    { error: "Mülakat randevu sayfası yayından kaldırıldı." },
    {
      status: 410,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    }
  );
}

export function GET() {
  return closed();
}

export function POST() {
  return closed();
}
