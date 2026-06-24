import { createClient } from "@supabase/supabase-js";
import { InfluencersClient } from "./_components/InfluencersClient";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const dynamic = "force-dynamic";

export default async function InfluencerlarPage() {
  const supabase = sb();

  const [{ data: influencers }, { data: collaborations }, { data: musteriler }] =
    await Promise.all([
      supabase
        .from("influencers")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("influencer_collaborations")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("musteriler")
        .select("id, ad")
        .eq("durum", "aktif")
        .order("ad"),
    ]);

  return (
    <InfluencersClient
      initialInfluencers={influencers ?? []}
      initialCollaborations={collaborations ?? []}
      musteriler={musteriler ?? []}
    />
  );
}
