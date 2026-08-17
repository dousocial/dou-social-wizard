-- /influencer sayfasındaki influencer başvuru formu için tablo.
-- Supabase Dashboard → SQL Editor → Hepsini yapıştır → Run

CREATE TABLE IF NOT EXISTS influencer_basvurulari (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamptz DEFAULT now(),

  -- Temel bilgiler
  ad_soyad         text        NOT NULL,
  telefon          text        NOT NULL,
  email            text        DEFAULT '',
  sosyal_hesap     text        NOT NULL, -- Instagram/TikTok vb. kullanıcı adı veya link

  -- Formda istenen 4 alan
  fiyat            text        DEFAULT '', -- kalem fiyatı (serbest metin — aralık/pazarlık vb. olabilir)
  ilgi_alanlari    text        DEFAULT '',
  sektorler        text[]      DEFAULT '{}', -- ilgilendiği sektörler (çoklu seçim)
  icerik_linki     text        DEFAULT '', -- en beğendiği kendi içeriğinin linki

  -- Rıza kayıtları — formun kendi bilgileriyle ve kendi rızasıyla gönderildiğine dair
  kvkk_onay        boolean     NOT NULL DEFAULT false,
  beyan_onay       boolean     NOT NULL DEFAULT false,

  -- CRM tarafında değerlendirme için
  durum            text        NOT NULL DEFAULT 'yeni' CHECK (durum IN ('yeni', 'incelendi', 'havuz', 'reddedildi'))
);

ALTER TABLE influencer_basvurulari DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_influencer_basvurulari_created_at ON influencer_basvurulari (created_at DESC);
