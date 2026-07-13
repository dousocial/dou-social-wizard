-- DOU CRM Faz 2: aylık plan, referans havuzu ve çekim takvimi

CREATE TABLE IF NOT EXISTS crm_monthly_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  client_id uuid NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  contract_id uuid REFERENCES crm_contracts(id) ON DELETE SET NULL,
  period text NOT NULL CHECK (period ~ '^\\d{4}-(0[1-9]|1[0-2])$'),
  status text NOT NULL DEFAULT 'taslak' CHECK (status IN ('taslak','planlaniyor','aktif','tamamlandi')),
  agreed_post_count int NOT NULL DEFAULT 0 CHECK (agreed_post_count >= 0),
  planned_post_count int NOT NULL DEFAULT 0 CHECK (planned_post_count >= 0),
  produced_post_count int NOT NULL DEFAULT 0 CHECK (produced_post_count >= 0),
  published_post_count int NOT NULL DEFAULT 0 CHECK (published_post_count >= 0),
  agreed_video_count int NOT NULL DEFAULT 0 CHECK (agreed_video_count >= 0),
  planned_video_count int NOT NULL DEFAULT 0 CHECK (planned_video_count >= 0),
  shot_video_count int NOT NULL DEFAULT 0 CHECK (shot_video_count >= 0),
  edited_video_count int NOT NULL DEFAULT 0 CHECK (edited_video_count >= 0),
  published_video_count int NOT NULL DEFAULT 0 CHECK (published_video_count >= 0),
  agreed_shoot_days int NOT NULL DEFAULT 0 CHECK (agreed_shoot_days >= 0),
  notes text DEFAULT '',
  UNIQUE (client_id, period)
);

CREATE TABLE IF NOT EXISTS crm_reference_assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  client_id uuid NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  period text,
  title text NOT NULL,
  source_url text DEFAULT '',
  preview_url text DEFAULT '',
  source_platform text NOT NULL DEFAULT 'instagram' CHECK (source_platform IN ('instagram','pinterest','tiktok','youtube','rakip','dou','musteri','diger')),
  content_type text NOT NULL DEFAULT 'video' CHECK (content_type IN ('post','video','story','reklam','diger')),
  description text DEFAULT '',
  adapt_notes text DEFAULT '',
  avoid_notes text DEFAULT '',
  coordinator_note text DEFAULT '',
  status text NOT NULL DEFAULT 'havuzda' CHECK (status IN ('arastiriliyor','havuzda','incelenecek','secildi','musteriye_gosterilecek','uretime_alinacak','elendi','kullanildi'))
);

CREATE TABLE IF NOT EXISTS crm_shoots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  client_id uuid NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  monthly_plan_id uuid REFERENCES crm_monthly_plans(id) ON DELETE SET NULL,
  shoot_date date NOT NULL,
  start_time time,
  end_time time,
  location text DEFAULT '',
  team_members text[] DEFAULT '{}',
  client_contact text DEFAULT '',
  content_titles text[] DEFAULT '{}',
  equipment text[] DEFAULT '{}',
  required_products text DEFAULT '',
  speakers text DEFAULT '',
  wardrobe text DEFAULT '',
  notes text DEFAULT '',
  client_informed boolean DEFAULT false,
  team_informed boolean DEFAULT false,
  status text NOT NULL DEFAULT 'planlaniyor' CHECK (status IN ('planlaniyor','musteri_onayi','ekip_onayi','kesinlesti','yaklasiyor','basladi','tamamlandi','ertelendi','iptal')),
  extra_reason text DEFAULT '',
  coordinator_approved boolean DEFAULT false,
  adaptation_period boolean DEFAULT false,
  extra_fee boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS crm_monthly_plans_period_idx ON crm_monthly_plans(period);
CREATE INDEX IF NOT EXISTS crm_reference_assets_client_period_idx ON crm_reference_assets(client_id, period);
CREATE INDEX IF NOT EXISTS crm_shoots_client_date_idx ON crm_shoots(client_id, shoot_date);

ALTER TABLE crm_monthly_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_reference_assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_shoots DISABLE ROW LEVEL SECURITY;
