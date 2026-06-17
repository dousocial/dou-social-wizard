-- DOU Social CRM Tabloları
-- Supabase Dashboard → SQL Editor → buraya yapıştır → Run

-- ─── Müşteriler ──────────────────────────────────────────────────────────────
CREATE TABLE musteriler (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  ad               text        NOT NULL,
  sektor           text        NOT NULL DEFAULT '',
  website          text        DEFAULT '',
  email            text        DEFAULT '',
  telefon          text        DEFAULT '',
  sorumlu          text        DEFAULT '',
  durum            text        NOT NULL DEFAULT 'aktif'
                               CHECK (durum IN ('aktif', 'pasif', 'potansiyel')),
  platformlar      text[]      DEFAULT '{}',
  aylik_ucret      numeric     DEFAULT 0,
  baslangic_tarihi date,
  notlar           text        DEFAULT ''
);

ALTER TABLE musteriler ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON musteriler USING (false) WITH CHECK (false);

-- ─── Müşteri Aylık Metrikleri ────────────────────────────────────────────────
CREATE TABLE musteri_metrikleri (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamptz DEFAULT now(),
  musteri_id       uuid        NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  ay               text        NOT NULL,   -- "2025-01" formatında
  reklam_butcesi   numeric     DEFAULT 0,  -- Yönetilen reklam bütçesi (TL)
  etkilesim_orani  numeric     DEFAULT 0,  -- Etkileşim oranı (%)
  takipci_artisi   int         DEFAULT 0,  -- Net takipçi değişimi
  toplam_erisim    bigint      DEFAULT 0,  -- Toplam erişim
  tiklama_orani    numeric     DEFAULT 0,  -- CTR (%)
  tiklama_sayisi   int         DEFAULT 0,  -- Toplam tıklama
  donusum_sayisi   int         DEFAULT 0,  -- Dönüşüm sayısı
  musteri_cirosu   numeric     DEFAULT 0,  -- Müşteri için üretilen tahmini ciro (TL)
  notlar           text        DEFAULT '',
  UNIQUE (musteri_id, ay)
);

ALTER TABLE musteri_metrikleri ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON musteri_metrikleri USING (false) WITH CHECK (false);
