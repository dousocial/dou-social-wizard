-- DOU Social CRM & Lead Yönetimi Birleşik Altyapı Şeması
-- Supabase Dashboard → SQL Editor → Hepsini yapıştır → Run
-- Bu script, önceki tüm CRM tablolarını otomatik olarak (eğer yoklarsa) oluşturur ve yeni lead/crm tablolarını kurar.

-- ─── 0. Mevcut Müşteri Altyapı Tabloları (Yoksa Oluşturulur) ──────────────────────

CREATE TABLE IF NOT EXISTS musteriler (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  ad               text        NOT NULL,
  sektor           text        NOT NULL DEFAULT '',
  website          text        DEFAULT '',
  email            text        DEFAULT '',
  telefon          text        DEFAULT '',
  sorumlu          text        DEFAULT '',
  durum            text        NOT NULL DEFAULT 'aktif' CHECK (durum IN ('aktif', 'pasif', 'potansiyel')),
  platformlar      text[]      DEFAULT '{}',
  aylik_ucret      numeric     DEFAULT 0,
  baslangic_tarihi date,
  notlar           text        DEFAULT '',
  sozlesme_bitis_tarihi date,
  yenileme_hatirlatma_gun int DEFAULT 30
);

ALTER TABLE musteriler DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS musteri_metrikleri (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamptz DEFAULT now(),
  musteri_id       uuid        NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  ay               text        NOT NULL,
  reklam_butcesi   numeric     DEFAULT 0,
  etkilesim_orani  numeric     DEFAULT 0,
  takipci_artisi   int         DEFAULT 0,
  toplam_erisim    bigint      DEFAULT 0,
  tiklama_orani    numeric     DEFAULT 0,
  tiklama_sayisi   int         DEFAULT 0,
  donusum_sayisi   int         DEFAULT 0,
  musteri_cirosu   numeric     DEFAULT 0,
  notlar           text        DEFAULT '',
  UNIQUE (musteri_id, ay)
);

ALTER TABLE musteri_metrikleri DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS musteri_gorevler (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  musteri_id uuid NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  baslik text NOT NULL,
  aciklama text DEFAULT '',
  bitis_tarihi date,
  tamamlandi boolean DEFAULT false,
  oncelik text DEFAULT 'normal' CHECK (oncelik IN ('dusuk', 'normal', 'yuksek'))
);

ALTER TABLE musteri_gorevler DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS musteri_teklifler (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  musteri_id uuid REFERENCES musteriler(id) ON DELETE CASCADE,
  baslik text NOT NULL,
  tutar numeric DEFAULT 0,
  durum text DEFAULT 'hazirlaniyor',
  gonderim_tarihi date,
  notlar text DEFAULT '',
  teklif_no text DEFAULT '',
  hizmetler jsonb DEFAULT '[]'
);

ALTER TABLE musteri_teklifler DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS musteri_iletisimler (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  musteri_id uuid NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  tarih date NOT NULL DEFAULT CURRENT_DATE,
  tip text DEFAULT 'not' CHECK (tip IN ('not', 'toplanti', 'telefon', 'email', 'diger')),
  baslik text NOT NULL,
  icerik text DEFAULT ''
);

ALTER TABLE musteri_iletisimler DISABLE ROW LEVEL SECURITY;

-- ─── 1. CRM - Firmalar Tablosu ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_companies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL,
  website text DEFAULT '',
  sector text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  instagram text DEFAULT '',
  notes text DEFAULT '',
  assigned_user text DEFAULT ''
);

ALTER TABLE crm_companies DISABLE ROW LEVEL SECURITY;

-- ─── 2. CRM - İletişim Kişileri Tablosu ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  company_id uuid REFERENCES crm_companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text DEFAULT '',
  email text DEFAULT '',
  role text DEFAULT '',
  instagram text DEFAULT '',
  notes text DEFAULT ''
);

ALTER TABLE crm_contacts DISABLE ROW LEVEL SECURITY;

-- ─── 3. CRM - Fırsatlar / Leads Tablosu ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  title text NOT NULL,
  company_id uuid REFERENCES crm_companies(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES crm_contacts(id) ON DELETE SET NULL,
  company_name text DEFAULT '',
  contact_name text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  instagram text DEFAULT '',
  website text DEFAULT '',
  sector text DEFAULT '',
  source text DEFAULT 'manuel' CHECK (source IN ('referans', 'instagram', 'google_maps', 'inbound', 'manuel', 'diger')),
  status text DEFAULT 'yeni' CHECK (status IN ('yeni', 'gorusuldu', 'teklif_istendi', 'teklif_gonderildi', 'takipte', 'kazanildi', 'kaybedildi')),
  score int DEFAULT 0,
  last_contact_date timestamptz,
  next_follow_up_date date,
  notes text DEFAULT '',
  assigned_user text DEFAULT '',
  converted_client_id uuid REFERENCES musteriler(id) ON DELETE SET NULL
);

ALTER TABLE crm_leads DISABLE ROW LEVEL SECURITY;

-- ─── 4. CRM - Follow-up / Takip Sistem Tablosu ───────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_follow_ups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  lead_id uuid NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  follow_up_date date NOT NULL,
  type text NOT NULL CHECK (type IN ('arama', 'whatsapp', 'eposta', 'toplanti', 'instagram_dm')),
  note text DEFAULT '',
  completed boolean DEFAULT false
);

ALTER TABLE crm_follow_ups DISABLE ROW LEVEL SECURITY;

-- ─── 5. CRM - İçerik / Operasyon Takip Tablosu ───────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_content_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  client_id uuid NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('reels', 'post', 'story', 'blog', 'reklam', 'cekim')),
  status text DEFAULT 'fikir' CHECK (status IN ('fikir', 'cekilecek', 'cekildi', 'editte', 'onayda', 'yayinta')),
  assigned_person text DEFAULT '',
  due_date date
);

ALTER TABLE crm_content_tasks DISABLE ROW LEVEL SECURITY;

-- ─── 6. Teklifler Tablosunu CRM İçin Güncelleme / Esnetme ───────────────────────

-- Eski check kısıtlamalarını temizliyoruz
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT constraint_name
        FROM information_schema.constraint_column_usage
        WHERE table_name = 'musteri_teklifler' AND column_name = 'durum'
    LOOP
        EXECUTE 'ALTER TABLE musteri_teklifler DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- musteri_id alanını lead teklifleri için nullable yapıyoruz
ALTER TABLE musteri_teklifler ALTER COLUMN musteri_id DROP NOT NULL;

-- Yeni CRM kolonlarını ekliyoruz
ALTER TABLE musteri_teklifler ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES crm_leads(id) ON DELETE CASCADE;
ALTER TABLE musteri_teklifler ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES crm_companies(id) ON DELETE CASCADE;
ALTER TABLE musteri_teklifler ADD COLUMN IF NOT EXISTS paket_adi text DEFAULT '';
ALTER TABLE musteri_teklifler ADD COLUMN IF NOT EXISTS kurulum_ucreti numeric DEFAULT 0;
ALTER TABLE musteri_teklifler ADD COLUMN IF NOT EXISTS ek_hizmetler text DEFAULT '';
ALTER TABLE musteri_teklifler ADD COLUMN IF NOT EXISTS teklif_tarihi date DEFAULT CURRENT_DATE;
ALTER TABLE musteri_teklifler ADD COLUMN IF NOT EXISTS gecerlilik_tarihi date;

-- Yeni durum check kısıtlamasını tanımlıyoruz
ALTER TABLE musteri_teklifler DROP CONSTRAINT IF EXISTS musteri_teklifler_durum_check;
ALTER TABLE musteri_teklifler ADD CONSTRAINT musteri_teklifler_durum_check CHECK (durum IN ('taslak', 'gonderildi', 'kabul_edildi', 'reddedildi', 'suresi_doldu', 'hazirlaniyor', 'gorusuluyor', 'kazanildi', 'kaybedildi'));

-- ─── 7. Müşteriler Tablosunu CRM İçin Güncelleme ───────────────────────────────
ALTER TABLE musteriler ADD COLUMN IF NOT EXISTS sozlesme_bitis_tarihi date;
ALTER TABLE musteriler ADD COLUMN IF NOT EXISTS yenileme_hatirlatma_gun int DEFAULT 30;
