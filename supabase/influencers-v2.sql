-- Influencer tablosundaki kategori alanını text (tek) → text[] (çoklu) yapıyoruz
-- Supabase Dashboard → SQL Editor → Run

-- Önce mevcut veriyi dönüştür, sonra tipi değiştir
ALTER TABLE influencers
  ALTER COLUMN kategori TYPE text[]
  USING CASE
    WHEN kategori IS NULL OR kategori = '' THEN '{}'::text[]
    ELSE ARRAY[kategori]
  END;

-- Varsayılan değeri güncelle
ALTER TABLE influencers ALTER COLUMN kategori SET DEFAULT '{}';
