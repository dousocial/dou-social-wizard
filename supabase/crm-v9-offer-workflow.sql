-- DOU CRM Faz 1: teklif paket seviyesi, ayrıntılı durum ve ret analizi

ALTER TABLE musteri_teklifler ADD COLUMN IF NOT EXISTS package_level text;
ALTER TABLE musteri_teklifler ADD COLUMN IF NOT EXISTS rejection_reason text DEFAULT '';
ALTER TABLE musteri_teklifler ADD COLUMN IF NOT EXISTS revision_reason text DEFAULT '';
ALTER TABLE musteri_teklifler ADD COLUMN IF NOT EXISTS viewed_at timestamptz;

ALTER TABLE musteri_teklifler DROP CONSTRAINT IF EXISTS musteri_teklifler_package_level_check;
ALTER TABLE musteri_teklifler ADD CONSTRAINT musteri_teklifler_package_level_check
  CHECK (package_level IS NULL OR package_level IN ('baslangic', 'orta', 'ileri'));

ALTER TABLE musteri_teklifler DROP CONSTRAINT IF EXISTS musteri_teklifler_durum_check;
ALTER TABLE musteri_teklifler ADD CONSTRAINT musteri_teklifler_durum_check CHECK (durum IN (
  'taslak', 'hazirlaniyor', 'kontrol_bekliyor', 'gonderildi', 'goruldu',
  'degerlendiriliyor', 'revize_istendi', 'kabul_edildi', 'reddedildi',
  'suresi_doldu', 'gorusuluyor', 'kazanildi', 'kaybedildi'
));
