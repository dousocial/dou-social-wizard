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

export const FALLBACK_INFLUENCERS: InfluencerItem[] = [
  {
    id: "inf-1",
    name: "Selin Yılmaz",
    handle: "@selinyilmaz",
    instagramUrl: "https://instagram.com/selinyilmaz",
    profileImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    videoCover:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
    category: "Moda & Yaşam",
    followers: "185K",
    bio: "Minimalist moda, şehir yaşamı ve estetik görsel hikayeler üretiyor.",
    sectors: ["moda", "guzellik-estetik"],
    featured: true,
    order: 1,
  },
  {
    id: "inf-2",
    name: "Burak Demir",
    handle: "@burakdemirfit",
    instagramUrl: "https://instagram.com/burakdemirfit",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    videoCover:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
    category: "Spor & Fitness",
    followers: "240K",
    bio: "Yüksek enerjili antrenman dinamikleri ve motive edici spor içerikleri.",
    sectors: ["spor-fitness", "saglik"],
    featured: true,
    order: 2,
  },
  {
    id: "inf-3",
    name: "Ece Karaca",
    handle: "@ecekaraca.food",
    instagramUrl: "https://instagram.com/ecekaraca.food",
    profileImage:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    videoCover:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop",
    category: "Gastronomi & Mekan",
    followers: "95K",
    bio: "Şehrin lezzet rotaları, özel tarifler ve samimi mekan incelemeleri.",
    sectors: ["yiyecek-icecek"],
    featured: false,
    order: 3,
  },
  {
    id: "inf-4",
    name: "Caner Öztürk",
    handle: "@canerozturk.tech",
    instagramUrl: "https://instagram.com/canerozturk.tech",
    profileImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    videoCover:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop",
    category: "Teknoloji & Tasarım",
    followers: "310K",
    bio: "Kullanışlı teknoloji incelemeleri, setup tasarımları ve dijital trendler.",
    sectors: ["teknoloji", "e-ticaret"],
    featured: true,
    order: 4,
  },
  {
    id: "inf-5",
    name: "Melis Aksoy",
    handle: "@melisaksoy.beauty",
    instagramUrl: "https://instagram.com/melisaksoy.beauty",
    profileImage:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    videoCover:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop",
    category: "Güzellik & Bakım",
    followers: "145K",
    bio: "Temiz içerikli cilt bakımı rehberleri ve doğal güzellik rutinleri.",
    sectors: ["guzellik-estetik"],
    featured: false,
    order: 5,
  },
  {
    id: "inf-6",
    name: "Arda Kaya",
    handle: "@ardakaya.travel",
    instagramUrl: "https://instagram.com/ardakaya.travel",
    profileImage:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800&auto=format&fit=crop",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    videoCover:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
    category: "Seyahat & Keşif",
    followers: "220K",
    bio: "Etkileyici sinematik seyahat hikayeleri ve gizli kalmış rotalar.",
    sectors: ["diger", "spor-fitness"],
    featured: true,
    order: 6,
  },
];

export async function getPublishedInfluencers(): Promise<InfluencerItem[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return FALLBACK_INFLUENCERS;
    }

    const { data, error } = await supabase
      .from("influencer_basvurulari")
      .select("*")
      .eq("yayinda", true)
      .order("sira", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return FALLBACK_INFLUENCERS;
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
    return FALLBACK_INFLUENCERS;
  }
}
