-- ─────────────────────────────────────────────────────────────────────────────
-- DOU SOCIAL — INFLUENCER VITRINI & CRM ENTENGRASYONU SQL SCHEMA
-- Supabase Dashboard → SQL Editor → Buraya yapıştır → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. influencer_basvurulari tablosuna Web Sitesi Sergileme ve Medya Kolonları Eklenmesi
ALTER TABLE influencer_basvurulari 
  ADD COLUMN IF NOT EXISTS yayinda boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS profil_foto text DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_kapak text DEFAULT '',
  ADD COLUMN IF NOT EXISTS takipci_sayisi text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kategori text DEFAULT 'Genel',
  ADD COLUMN IF NOT EXISTS bio text DEFAULT '',
  ADD COLUMN IF NOT EXISTS sira integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onecikan boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS guncelleme_tarihi timestamptz DEFAULT now();

-- 2. Durum CHECK kısıtlamasını 'onaylandi' durumunu da içerecek şekilde güncelleme
ALTER TABLE influencer_basvurulari DROP CONSTRAINT IF EXISTS influencer_basvurulari_durum_check;
ALTER TABLE influencer_basvurulari ADD CONSTRAINT influencer_basvurulari_durum_check 
  CHECK (durum IN ('yeni', 'incelendi', 'havuz', 'reddedildi', 'onaylandi'));

-- 3. Web sitesinde yayında olanları hızlı sorgulamak için index
CREATE INDEX IF NOT EXISTS idx_influencer_yayinda_sira 
  ON influencer_basvurulari (yayinda, sira ASC, created_at DESC);

-- 4. Supabase Storage: 'influencer-media' bucket (Profil fotoğrafları ve Videolar için)
-- Storage policy'leri:
INSERT INTO storage.buckets (id, name, public)
VALUES ('influencer-media', 'influencer-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Herkesin medyaları görebilmesi (Public Read)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access to influencer-media'
  ) THEN
    CREATE POLICY "Public Access to influencer-media"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'influencer-media');
  END IF;
END $$;

-- 5. Başlangıç / Örnek Çalıştığımız Influencer Verileri (İlk kurulumda vitrinin dolu görünmesi için)
INSERT INTO influencer_basvurulari (
  ad_soyad, telefon, email, sosyal_hesap, fiyat, ilgi_alanlari, sektorler, icerik_linki, 
  durum, yayinda, profil_foto, video_url, video_kapak, takipci_sayisi, kategori, bio, sira, onecikan
) VALUES 
(
  'Selin Yılmaz',
  '0532 111 2233',
  'selin@example.com',
  '@selinyilmaz',
  '10.000₺',
  'Moda, lifestyle, kapsül gardırop',
  ARRAY['moda', 'guzellik-estetik'],
  'https://www.instagram.com/reel/C3abcdef123',
  'onaylandi',
  true,
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
  '185K',
  'Moda & Yaşam',
  'Minimalist moda, şehir yaşamı ve estetik görsel hikayeler üretiyor.',
  1,
  true
),
(
  'Burak Demir',
  '0533 222 3344',
  'burak@example.com',
  '@burakdemirfit',
  '12.500₺',
  'Fitness, sağlıklı beslenme, aktif yaşam',
  ARRAY['spor-fitness', 'saglik'],
  'https://www.instagram.com/reel/C3bcdef234',
  'onaylandi',
  true,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
  '240K',
  'Spor & Fitness',
  'Yüksek enerjili antrenman dinamikleri ve motive edici spor içerikleri.',
  2,
  true
),
(
  'Ece Karaca',
  '0535 333 4455',
  'ece@example.com',
  '@ecekaraca.food',
  '8.000₺',
  'Gastronomi, restoran keşifleri, kahve kültürü',
  ARRAY['yiyecek-icecek'],
  'https://www.instagram.com/reel/C3cdefg345',
  'onaylandi',
  true,
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop',
  '95K',
  'Gastronomi & Mekan',
  'Şehrin lezzet rotaları, özel tarifler ve samimi mekan incelemeleri.',
  3,
  false
),
(
  'Caner Öztürk',
  '0542 444 5566',
  'caner@example.com',
  '@canerozturk.tech',
  '15.000₺',
  'Mobil teknoloji, yeni nesil araçlar, üretkenlik',
  ARRAY['teknoloji', 'e-ticaret'],
  'https://www.instagram.com/reel/C3defgh456',
  'onaylandi',
  true,
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop',
  '310K',
  'Teknoloji & Tasarım',
  'Kullanışlı teknoloji incelemeleri, setup tasarımları ve dijital trendler.',
  4,
  true
),
(
  'Melis Aksoy',
  '0536 555 6677',
  'melis@example.com',
  '@melisaksoy.beauty',
  '11.000₺',
  'Cilt bakımı, makyaj tüyoları, estetik',
  ARRAY['guzellik-estetik'],
  'https://www.instagram.com/reel/C3efghi567',
  'onaylandi',
  true,
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
  '145K',
  'Güzellik & Bakım',
  'Temiz içerikli cilt bakımı rehberleri ve doğal güzellik rutinleri.',
  5,
  false
),
(
  'Arda Kaya',
  '0538 666 7788',
  'arda@example.com',
  '@ardakaya.travel',
  '14.000₺',
  'Seyahat, macera, drone çekimleri, outdoor',
  ARRAY['diger', 'spor-fitness'],
  'https://www.instagram.com/reel/C3fghij678',
  'onaylandi',
  true,
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800&auto=format&fit=crop',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
  '220K',
  'Seyahat & Keşif',
  'Etkileyici sinematik seyahat hikayeleri ve gizli kalmış rotalar.',
  6,
  true
)
ON CONFLICT DO NOTHING;
