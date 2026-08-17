import { supabase } from "@/lib/supabase";

export interface InfluencerItem {
  id: string;
  name: string;
  handle: string;
  instagramUrl: string;
  profileImage: string;
  videoUrl?: string;
  videoCover?: string;
  category: string;
  followers?: string;
  bio?: string;
  sectors?: string[];
  featured?: boolean;
  order?: number;
}

export function formatInstagramHandle(input: string): string {
  if (!input) return "";
  let clean = input.trim();
  // Remove URL prefixes if user entered a full link
  clean = clean.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  clean = clean.replace(/^@/, "");
  clean = clean.replace(/\/$/, "");
  return `@${clean}`;
}

export function getInstagramUrl(input: string): string {
  if (!input) return "https://instagram.com";
  let clean = input.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }
  clean = clean.replace(/^@/, "");
  return `https://instagram.com/${clean}`;
}

export const FALLBACK_INFLUENCERS: InfluencerItem[] = [];

export async function getPublishedInfluencers(): Promise<InfluencerItem[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return [];
    }

    const { data, error } = await supabase
      .from("influencer_basvurulari")
      .select("*")
      .eq("yayinda", true)
      .order("sira", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.ad_soyad,
      handle: formatInstagramHandle(row.sosyal_hesap),
      instagramUrl: getInstagramUrl(row.sosyal_hesap),
      profileImage:
        row.profil_foto ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
      videoUrl: row.video_url || row.icerik_linki || undefined,
      videoCover: row.video_kapak || undefined,
      category: row.kategori || "Genel",
      followers: row.takipci_sayisi || undefined,
      bio: row.bio || row.ilgi_alanlari || undefined,
      sectors: Array.isArray(row.sektorler) ? row.sektorler : [],
      featured: Boolean(row.onecikan),
      order: typeof row.sira === "number" ? row.sira : 0,
    }));
  } catch (err) {
    console.error("[getPublishedInfluencers] Error fetching:", err);
    return [];
  }
}
