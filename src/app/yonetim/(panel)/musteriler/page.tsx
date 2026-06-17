import { createClient } from "@supabase/supabase-js";
import { MusterilerClient } from "./_components/MusterilerClient";

export const dynamic = "force-dynamic";

async function getData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase
    .from("musteriler")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function MusterilerPage() {
  const musteriler = await getData();
  return <MusterilerClient musteriler={musteriler} />;
}
