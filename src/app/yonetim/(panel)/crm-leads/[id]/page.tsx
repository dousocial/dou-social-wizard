import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { CrmLeadDetailClient } from "./_components/CrmLeadDetailClient";

export const dynamic = "force-dynamic";

async function getData(id: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase ortam değişkenleri eksik.");
  const supabase = createClient(url, key);

  const { data: lead, error: leadErr } = await supabase
    .from("crm_leads")
    .select("*")
    .eq("id", id)
    .single();

  if (leadErr || !lead) return null;

  const [
    { data: companies },
    { data: contacts },
    { data: followUps },
    { data: teklifler },
    { data: users },
    auditRes
  ] = await Promise.all([
    supabase.from("crm_companies").select("id, name").order("name"),
    supabase.from("crm_contacts").select("id, name, company_id").order("name"),
    supabase.from("crm_follow_ups").select("*").eq("lead_id", id).order("follow_up_date", { ascending: false }),
    supabase.from("musteri_teklifler").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
    supabase.from("admin_users").select("id, username, role").order("username"),
    lead.audit_id
      ? supabase.from("audits").select("*").eq("id", lead.audit_id).single()
      : Promise.resolve({ data: null })
  ]);

  return {
    lead,
    companies: companies ?? [],
    contacts: contacts ?? [],
    followUps: followUps ?? [],
    teklifler: teklifler ?? [],
    users: users ?? [],
    audit: auditRes?.data ?? null
  };
}

export default async function CrmLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getData(id);
  
  if (!data) notFound();

  return (
    <CrmLeadDetailClient
      lead={data.lead}
      companies={data.companies}
      contacts={data.contacts}
      followUps={data.followUps}
      teklifler={data.teklifler}
      users={data.users}
      audit={data.audit}
    />
  );
}
