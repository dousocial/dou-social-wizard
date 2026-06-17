import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { MusteriDetailClient } from "./_components/MusteriDetailClient";

export const dynamic = "force-dynamic";

async function getData(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [
    { data: musteri, error },
    { data: metriks },
    { data: gorevler },
    { data: teklifler },
    { data: iletisimler },
  ] = await Promise.all([
    supabase.from("musteriler").select("*").eq("id", id).single(),
    supabase.from("musteri_metrikleri").select("*").eq("musteri_id", id).order("ay", { ascending: false }),
    supabase.from("musteri_gorevler").select("*").eq("musteri_id", id).order("created_at", { ascending: false }),
    supabase.from("musteri_teklifler").select("*").eq("musteri_id", id).order("created_at", { ascending: false }),
    supabase.from("musteri_iletisimler").select("*").eq("musteri_id", id).order("tarih", { ascending: false }),
  ]);

  if (error || !musteri) return null;
  return {
    musteri,
    metriks: metriks ?? [],
    gorevler: gorevler ?? [],
    teklifler: teklifler ?? [],
    iletisimler: iletisimler ?? [],
  };
}

export default async function MusteriDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();
  return (
    <MusteriDetailClient
      musteri={data.musteri}
      metriks={data.metriks}
      gorevler={data.gorevler}
      teklifler={data.teklifler}
      iletisimler={data.iletisimler}
    />
  );
}
