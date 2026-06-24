-- Pipeline column
ALTER TABLE musteriler ADD COLUMN IF NOT EXISTS pipeline_asamasi text DEFAULT 'potansiyel'
  CHECK (pipeline_asamasi IN ('potansiyel', 'teklif_gonderildi', 'gorusme', 'kazanildi', 'kaybedildi'));

-- Hedefler tablosu
CREATE TABLE IF NOT EXISTS musteri_hedefler (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  musteri_id uuid NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  ay text NOT NULL,
  ctr_hedef numeric DEFAULT 0,
  etkilesim_hedef numeric DEFAULT 0,
  takipci_hedef int DEFAULT 0,
  erisim_hedef bigint DEFAULT 0,
  ciro_hedef numeric DEFAULT 0,
  UNIQUE(musteri_id, ay)
);
ALTER TABLE musteri_hedefler DISABLE ROW LEVEL SECURITY;

-- Faturalar tablosu
CREATE TABLE IF NOT EXISTS musteri_faturalar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  musteri_id uuid NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  fatura_no text DEFAULT '',
  tutar numeric NOT NULL DEFAULT 0,
  vade_tarihi date NOT NULL,
  odeme_tarihi date,
  durum text DEFAULT 'bekliyor' CHECK (durum IN ('bekliyor', 'odendi', 'gecikti')),
  notlar text DEFAULT ''
);
ALTER TABLE musteri_faturalar DISABLE ROW LEVEL SECURITY;
