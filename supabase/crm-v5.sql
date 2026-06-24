-- DOU Social CRM İleri Düzey Özellikler Şeması
-- Supabase Dashboard → SQL Editor → Buraya yapıştır → Run

-- 1. Fırsatlara Audit ve İletişim Formu İlişkilendirmesi
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS audit_id uuid REFERENCES audits(id) ON DELETE SET NULL;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS source_contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL;

-- 2. Müşteri Aylık Ödeme ve Retainer Abonelik Takip Tablosu
CREATE TABLE IF NOT EXISTS crm_payments (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   timestamptz DEFAULT now(),
  client_id    uuid        NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  period       text        NOT NULL, -- "2026-06" formatında
  amount       numeric     NOT NULL DEFAULT 0,
  status       text        NOT NULL DEFAULT 'bekliyor' CHECK (status IN ('bekliyor', 'odendi', 'gecikti', 'iptal')),
  payment_date date,
  notes        text        DEFAULT '',
  UNIQUE (client_id, period)
);

ALTER TABLE crm_payments DISABLE ROW LEVEL SECURITY;
