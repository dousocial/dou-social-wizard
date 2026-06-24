-- DOU Social Influencer Yönetimi Şeması
-- Supabase Dashboard → SQL Editor → Hepsini yapıştır → Run

-- ─── 1. İnfluencer'lar Ana Tablosu ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS influencers (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),

  -- Temel Bilgiler
  ad               text        NOT NULL,
  soyad            text        DEFAULT '',
  email            text        DEFAULT '',
  telefon          text        DEFAULT '',
  sehir            text        DEFAULT '',
  ulke             text        DEFAULT 'TR',

  -- Sosyal Medya Hesapları (JSON array of {platform, handle, followers, engagement_rate})
  hesaplar         jsonb       DEFAULT '[]',

  -- Kategori & Niş
  kategori         text        DEFAULT '' CHECK (kategori IN ('', 'moda', 'yemek', 'teknoloji', 'spor', 'seyahat', 'guzellik', 'eglence', 'oyun', 'saglik', 'egitim', 'diger')),
  nis_etiketler    text[]      DEFAULT '{}',

  -- Durum: havuzda bekliyor, aktif listede, kara listede
  durum            text        NOT NULL DEFAULT 'havuz' CHECK (durum IN ('havuz', 'aktif', 'kara_liste')),
  kara_liste_nedeni text       DEFAULT '',

  -- Ücret Bilgisi
  min_ucret        numeric     DEFAULT 0,
  max_ucret        numeric     DEFAULT 0,
  para_birimi      text        DEFAULT 'TRY',

  -- Ajans / Temsilci
  ajans_adi        text        DEFAULT '',
  temsilci_adi     text        DEFAULT '',
  temsilci_telefon text        DEFAULT '',

  -- Notlar
  notlar           text        DEFAULT '',
  ic_notlar        text        DEFAULT '',

  -- Sorumlu Kullanıcı
  sorumlu          text        DEFAULT ''
);

ALTER TABLE influencers DISABLE ROW LEVEL SECURITY;

-- ─── 2. İş Birlikleri / Kampanyalar Tablosu ─────────────────────────────────
CREATE TABLE IF NOT EXISTS influencer_collaborations (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),

  influencer_id    uuid        NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,

  -- Hangi müşteri için yapıldı (opsiyonel)
  musteri_id       uuid        REFERENCES musteriler(id) ON DELETE SET NULL,
  musteri_adi      text        DEFAULT '', -- Müşteri yoksa manuel giriş

  -- Kampanya Detayları
  kampanya_adi     text        NOT NULL,
  icerik_tipi      text        DEFAULT '' CHECK (icerik_tipi IN ('', 'reels', 'post', 'story', 'youtube', 'tiktok', 'podcast', 'etkinlik', 'diger')),
  platform         text        DEFAULT '' CHECK (platform IN ('', 'instagram', 'youtube', 'tiktok', 'twitter', 'linkedin', 'diger')),

  -- Tarih & Durum
  baslangic_tarihi date,
  bitis_tarihi     date,
  durum            text        NOT NULL DEFAULT 'planlandi' CHECK (durum IN ('planlandi', 'uretimde', 'yayinda', 'tamamlandi', 'iptal')),

  -- Ücret & Maliyet
  anlasilan_ucret  numeric     DEFAULT 0,
  odenen_ucret     numeric     DEFAULT 0,
  para_birimi      text        DEFAULT 'TRY',

  -- Performans Metrikleri (sonradan güncellenir)
  erisim           bigint      DEFAULT 0,
  izlenme          bigint      DEFAULT 0,
  etkilesim        bigint      DEFAULT 0,
  tiklama          int         DEFAULT 0,
  donusum          int         DEFAULT 0,

  -- İçerik Linkleri
  icerik_url       text        DEFAULT '',
  brief_notlar     text        DEFAULT '',
  sonuc_notlar     text        DEFAULT ''
);

ALTER TABLE influencer_collaborations DISABLE ROW LEVEL SECURITY;

-- ─── 3. İnfluencer ↔ Proje Bağlantısı ──────────────────────────────────────
-- Hangi influencer hangi projede çalıştı
CREATE TABLE IF NOT EXISTS influencer_projects (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamptz DEFAULT now(),
  influencer_id    uuid        NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  proje_adi        text        NOT NULL,
  rol              text        DEFAULT '',
  tarih            date        DEFAULT CURRENT_DATE,
  notlar           text        DEFAULT ''
);

ALTER TABLE influencer_projects DISABLE ROW LEVEL SECURITY;

-- ─── 4. Trigger: updated_at otomatik güncelle ───────────────────────────────
CREATE OR REPLACE FUNCTION update_influencer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS influencers_updated_at ON influencers;
CREATE TRIGGER influencers_updated_at
  BEFORE UPDATE ON influencers
  FOR EACH ROW EXECUTE FUNCTION update_influencer_updated_at();

DROP TRIGGER IF EXISTS influencer_collaborations_updated_at ON influencer_collaborations;
CREATE TRIGGER influencer_collaborations_updated_at
  BEFORE UPDATE ON influencer_collaborations
  FOR EACH ROW EXECUTE FUNCTION update_influencer_updated_at();
