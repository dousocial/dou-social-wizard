-- DOU CRM Faz 3: yayın takvimi ve reklam yönetimi

CREATE TABLE IF NOT EXISTS crm_publishing_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  client_id uuid NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  edit_job_id uuid REFERENCES crm_edit_jobs(id) ON DELETE SET NULL, design_job_id uuid REFERENCES crm_design_jobs(id) ON DELETE SET NULL,
  title text NOT NULL, platform text NOT NULL, publish_date date NOT NULL, publish_time time,
  caption text DEFAULT '', hashtags text DEFAULT '', location text DEFAULT '', collaboration_account text DEFAULT '', cover_url text DEFAULT '',
  publisher text DEFAULT '', is_ad boolean DEFAULT false, publish_url text DEFAULT '',
  status text NOT NULL DEFAULT 'planlanacak' CHECK (status IN ('planlanacak','tarih_belirlendi','yayina_hazir','planlandi','yayinlandi','ertelendi','musteri_durdurdu'))
);

CREATE TABLE IF NOT EXISTS crm_advertising_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  client_id uuid NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  publishing_job_id uuid REFERENCES crm_publishing_jobs(id) ON DELETE SET NULL,
  title text NOT NULL, content_url text DEFAULT '', objective text DEFAULT '', target_audience text DEFAULT '', region text DEFAULT '',
  budget numeric DEFAULT 0 CHECK (budget >= 0), start_date date, end_date date, owner text DEFAULT '', ad_account text DEFAULT '', campaign_name text DEFAULT '',
  status text NOT NULL DEFAULT 'talep_geldi' CHECK (status IN ('talep_geldi','icerik_secilecek','musteri_onayi','butce_bekleniyor','kuruluyor','kontrol_bekliyor','yayinda','durduruldu','tamamlandi','raporlandi')),
  result_notes text DEFAULT '', report_url text DEFAULT ''
);

CREATE INDEX IF NOT EXISTS crm_publishing_date_idx ON crm_publishing_jobs(publish_date,status);
CREATE INDEX IF NOT EXISTS crm_advertising_dates_idx ON crm_advertising_jobs(start_date,end_date,status);
ALTER TABLE crm_publishing_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_advertising_jobs DISABLE ROW LEVEL SECURITY;
