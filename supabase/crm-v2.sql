-- Görev tablosu
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

-- Teklif tablosu
CREATE TABLE IF NOT EXISTS musteri_teklifler (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  musteri_id uuid NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  baslik text NOT NULL,
  tutar numeric DEFAULT 0,
  durum text DEFAULT 'hazirlaniyor' CHECK (durum IN ('hazirlaniyor', 'gonderildi', 'gorusuluyor', 'kazanildi', 'kaybedildi')),
  gonderim_tarihi date,
  notlar text DEFAULT ''
);
ALTER TABLE musteri_teklifler DISABLE ROW LEVEL SECURITY;

-- İletişim geçmişi tablosu
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

-- Sözleşme alanları musteriler tablosuna ekle
ALTER TABLE musteriler ADD COLUMN IF NOT EXISTS sozlesme_bitis_tarihi date;
ALTER TABLE musteriler ADD COLUMN IF NOT EXISTS yenileme_hatirlatma_gun int DEFAULT 30;
