import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { MusteriDetailClient } from "./_components/MusteriDetailClient";

export const dynamic = "force-dynamic";

async function getData(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [{ data: musteri, error }, { data: metriks }] = await Promise.all([
    supabase.from("musteriler").select("*").eq("id", id).single(),
    supabase
      .from("musteri_metrikleri")
      .select("*")
      .eq("musteri_id", id)
      .order("ay", { ascending: false }),
  ]);

  if (error || !musteri) return null;
  return { musteri, metriks: metriks ?? [] };
}

export default async function MusteriDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();
  return <MusteriDetailClient musteri={data.musteri} metriks={data.metriks} />;
}
