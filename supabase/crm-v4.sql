-- Teklif: çoklu hizmet satırları + teklif no
ALTER TABLE musteri_teklifler
  ADD COLUMN IF NOT EXISTS teklif_no text DEFAULT '',
  ADD COLUMN IF NOT EXISTS hizmetler jsonb DEFAULT '[]';
