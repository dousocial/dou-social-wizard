import { createClient } from "@supabase/supabase-js";
import { OperationsClient } from "./_components/OperationsClient";

export const dynamic = "force-dynamic";

async function getData() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const [{ data: clients }, { data: plans }, { data: references }, { data: shoots }] = await Promise.all([
    supabase.from("musteriler").select("id,ad,sektor").eq("durum", "aktif").order("ad"),
    supabase.from("crm_monthly_plans").select("*,musteriler(ad)").order("period", { ascending: false }),
    supabase.from("crm_reference_assets").select("*,musteriler(ad)").order("created_at", { ascending: false }),
    supabase.from("crm_shoots").select("*,musteriler(ad)").order("shoot_date", { ascending: true }),
  ]);
  return { clients: clients ?? [], plans: plans ?? [], references: references ?? [], shoots: shoots ?? [] };
}

export default async function OperationsPage() {
  const data = await getData();
  return <OperationsClient {...data} />;
}
