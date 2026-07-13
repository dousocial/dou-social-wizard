-- DOU CRM Faz 2: medya ayıklama, edit, tasarım ve revize iş akışı

CREATE TABLE IF NOT EXISTS crm_edit_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  client_id uuid NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  shoot_id uuid REFERENCES crm_shoots(id) ON DELETE SET NULL,
  title text NOT NULL, video_type text DEFAULT 'reels', estimated_duration_seconds int DEFAULT 0,
  estimated_work_minutes int DEFAULT 0, editor text DEFAULT '', priority text DEFAULT 'normal' CHECK (priority IN ('dusuk','normal','yuksek','acil')),
  queue_position int NOT NULL DEFAULT 1000, planned_start_date date, due_date date,
  raw_folder_url text DEFAULT '', selected_media_url text DEFAULT '', drive_url text DEFAULT '', reference_url text DEFAULT '',
  music text DEFAULT '', script text DEFAULT '', subtitle_required boolean DEFAULT false, cover_required boolean DEFAULT false,
  technique_notes text DEFAULT '', audio_notes text DEFAULT '', coordinator_note text DEFAULT '',
  media_sorting_completed boolean DEFAULT false,
  status text NOT NULL DEFAULT 'cekim_bekliyor' CHECK (status IN ('cekim_bekliyor','ayiklama_bekliyor','siraya_alinacak','edit_sirasinda','kurgu_basladi','ilk_taslak','koordinator_kontrol','revizede','musteri_onayi','final_hazir','yayina_hazir','yayinlandi'))
);

CREATE TABLE IF NOT EXISTS crm_design_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  client_id uuid NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  title text NOT NULL, design_type text DEFAULT 'post', dimensions text DEFAULT '', reference_url text DEFAULT '',
  asset_urls text[] DEFAULT '{}', campaign_info text DEFAULT '', prices_text text DEFAULT '', copy_text text DEFAULT '', brand_colors text DEFAULT '',
  designer text DEFAULT '', priority text DEFAULT 'normal' CHECK (priority IN ('dusuk','normal','yuksek','acil')),
  queue_position int NOT NULL DEFAULT 1000, estimated_work_minutes int DEFAULT 0, due_date date,
  drive_url text DEFAULT '', status text NOT NULL DEFAULT 'arastiriliyor' CHECK (status IN ('arastiriliyor','referans_secildi','gorsel_bekliyor','tasarim_sirasinda','ilk_taslak','koordinator_kontrol','revizede','musteri_onayi','final_hazir','yayina_hazir','yayinlandi'))
);

CREATE TABLE IF NOT EXISTS crm_revisions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  job_type text NOT NULL CHECK (job_type IN ('edit','design')),
  edit_job_id uuid REFERENCES crm_edit_jobs(id) ON DELETE CASCADE,
  design_job_id uuid REFERENCES crm_design_jobs(id) ON DELETE CASCADE,
  requested_by text NOT NULL, reason text NOT NULL, description text NOT NULL,
  assigned_to text DEFAULT '', due_date date, revision_round int NOT NULL DEFAULT 1 CHECK (revision_round > 0),
  completed boolean DEFAULT false,
  CHECK ((job_type = 'edit' AND edit_job_id IS NOT NULL AND design_job_id IS NULL) OR (job_type = 'design' AND design_job_id IS NOT NULL AND edit_job_id IS NULL))
);

CREATE INDEX IF NOT EXISTS crm_edit_jobs_queue_idx ON crm_edit_jobs(queue_position, due_date);
CREATE INDEX IF NOT EXISTS crm_design_jobs_queue_idx ON crm_design_jobs(queue_position, due_date);
ALTER TABLE crm_edit_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_design_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_revisions DISABLE ROW LEVEL SECURITY;
