-- Influencer tablosundaki kategori alanını text (tek) → text[] (çoklu) yapıyoruz
-- Supabase Dashboard → SQL Editor → Run

-- 1. Önce varsayılan değeri kaldır
ALTER TABLE influencers ALTER COLUMN kategori DROP DEFAULT;

-- 2. Tipi dönüştür (mevcut veriler boş array'e çevrilir)
ALTER TABLE influencers
  ALTER COLUMN kategori TYPE text[]
  USING CASE
    WHEN kategori IS NULL OR kategori = '' THEN '{}'::text[]
    ELSE ARRAY[kategori]
  END;

-- 3. Yeni varsayılan değeri ata
ALTER TABLE influencers ALTER COLUMN kategori SET DEFAULT '{}';
