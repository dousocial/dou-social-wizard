-- DOU Social Audit Tablosu
-- Supabase Dashboard → SQL Editor → buraya yapıştır → Run

-- ─── Admin Kullanıcıları ─────────────────────────────────────────────────────
CREATE TABLE admin_users (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    timestamptz DEFAULT now(),
  username      text        NOT NULL UNIQUE,
  password_hash text        NOT NULL,
  salt          text        NOT NULL,
  role          text        NOT NULL DEFAULT 'izleyici' CHECK (role IN ('yonetici', 'izleyici'))
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only" ON admin_users
  USING (false)
  WITH CHECK (false);

-- ─── Contacts Tablosu ────────────────────────────────────────────────────────
CREATE TABLE contacts (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  type       text        NOT NULL DEFAULT 'iletisim',
  name       text        NOT NULL,
  email      text        NOT NULL,
  phone      text,
  message    text
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only" ON contacts
  USING (false)
  WITH CHECK (false);

-- ─── Audits Tablosu ──────────────────────────────────────────────────────────
CREATE TABLE audits (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamptz DEFAULT now(),
  business_name    text        NOT NULL,
  sector           text        NOT NULL,
  phone            text        NOT NULL,
  email            text        NOT NULL,
  mode             text        NOT NULL CHECK (mode IN ('manual', 'screenshot')),
  active_platforms text[]      DEFAULT '{}',
  score_overall    int         DEFAULT 0,
  score_instagram  int         DEFAULT 0,
  score_linkedin   int         DEFAULT 0,
  score_youtube    int         DEFAULT 0,
  score_google     int         DEFAULT 0,
  report_text      text
);

-- Row Level Security — service_role key her şeyi okuyabilir/yazabilir
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Dışarıdan (anon) okuma/yazma kapalı (sadece service_role key geçer)
CREATE POLICY "service_role_only" ON audits
  USING (false)
  WITH CHECK (false);

-- ─── Okundu Takibi ───────────────────────────────────────────────────────────
-- Supabase'de zaten contacts/audits tablosu varsa bu ALTER'ları çalıştır:
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_read  boolean     DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS read_by  text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS read_at  timestamptz;

ALTER TABLE audits   ADD COLUMN IF NOT EXISTS is_read  boolean     DEFAULT false;
ALTER TABLE audits   ADD COLUMN IF NOT EXISTS read_by  text;
ALTER TABLE audits   ADD COLUMN IF NOT EXISTS read_at  timestamptz;

-- ─── Çok Kullanıcılı Okunma Takibi ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS message_reads (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id    uuid        NOT NULL,
  message_table text        NOT NULL CHECK (message_table IN ('contacts', 'audits')),
  username      text        NOT NULL,
  read_at       timestamptz DEFAULT now() NOT NULL,
  UNIQUE (message_id, message_table, username)
);

ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON message_reads USING (false) WITH CHECK (false);

-- ─── Mesaj Notları ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS message_notes (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id    uuid        NOT NULL,
  message_table text        NOT NULL CHECK (message_table IN ('contacts', 'audits')),
  username      text        NOT NULL,
  content       text        NOT NULL,
  created_at    timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE message_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON message_notes USING (false) WITH CHECK (false);
