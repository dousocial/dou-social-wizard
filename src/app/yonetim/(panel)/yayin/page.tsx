import { createClient } from "@supabase/supabase-js";
import { PublishingClient } from "./_components/PublishingClient";
export const dynamic = "force-dynamic";
async function getData() { const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); const [{ data: clients }, { data: users }, { data: publishing }, { data: ads }] = await Promise.all([s.from("musteriler").select("id,ad").eq("durum","aktif").order("ad"), s.from("admin_users").select("id,username,role").order("username"), s.from("crm_publishing_jobs").select("*,musteriler(ad)").order("publish_date"), s.from("crm_advertising_jobs").select("*,musteriler(ad)").order("created_at",{ascending:false})]); return { clients: clients ?? [], users: users ?? [], publishing: publishing ?? [], ads: ads ?? [] }; }
export default async function PublishingPage() { return <PublishingClient {...await getData()} />; }
