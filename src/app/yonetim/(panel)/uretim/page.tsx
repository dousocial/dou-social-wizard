import { createClient } from "@supabase/supabase-js";
import { ProductionClient } from "./_components/ProductionClient";

export const dynamic = "force-dynamic";

async function getData() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const [{ data: clients }, { data: users }, { data: editJobs }, { data: designJobs }, { data: revisions }] = await Promise.all([
    supabase.from("musteriler").select("id,ad").eq("durum", "aktif").order("ad"),
    supabase.from("admin_users").select("id,username,role").order("username"),
    supabase.from("crm_edit_jobs").select("*,musteriler(ad)").order("queue_position").order("due_date"),
    supabase.from("crm_design_jobs").select("*,musteriler(ad)").order("queue_position").order("due_date"),
    supabase.from("crm_revisions").select("*").order("created_at", { ascending: false }),
  ]);
  return { clients: clients ?? [], users: users ?? [], editJobs: editJobs ?? [], designJobs: designJobs ?? [], revisions: revisions ?? [] };
}

export default async function ProductionPage() { return <ProductionClient {...await getData()} />; }
