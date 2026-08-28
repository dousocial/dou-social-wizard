-- Müşteri reklam hesabı alanı
-- Canlı müşteri formu bu alanı gönderdiğinde Supabase şema önbelleği hatası oluşmaması için.

ALTER TABLE musteriler
  ADD COLUMN IF NOT EXISTS meta_ad_account_id text DEFAULT '';

-- PostgREST'in yeni kolonu aynı oturumda görmesini sağla.
NOTIFY pgrst, 'reload schema';
