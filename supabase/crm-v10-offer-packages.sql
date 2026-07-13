-- DOU CRM Faz 1: üç paket karşılaştırma detayları

ALTER TABLE musteri_teklifler
  ADD COLUMN IF NOT EXISTS package_details jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN musteri_teklifler.package_details IS
  'Post/video/çekim adetleri ile story, reklam, hesap yönetimi, metin, tasarım ve kurgu hizmetleri';
