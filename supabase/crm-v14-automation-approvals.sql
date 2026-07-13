-- DOU CRM Faz 3: tekrar eden görevler ve müşteri onay paneli
CREATE TABLE IF NOT EXISTS crm_recurring_task_templates (
 id uuid DEFAULT gen_random_uuid() PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
 client_id uuid NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE, title text NOT NULL, description text DEFAULT '',
 interval_days int NOT NULL CHECK(interval_days>0), next_run_date date NOT NULL, priority text DEFAULT 'normal' CHECK(priority IN('dusuk','normal','yuksek')), active boolean DEFAULT true
);
CREATE TABLE IF NOT EXISTS crm_recurring_task_runs (
 id uuid DEFAULT gen_random_uuid() PRIMARY KEY, template_id uuid NOT NULL REFERENCES crm_recurring_task_templates(id) ON DELETE CASCADE,
 run_date date NOT NULL, generated_task_id uuid REFERENCES musteri_gorevler(id) ON DELETE SET NULL, UNIQUE(template_id,run_date)
);
CREATE TABLE IF NOT EXISTS crm_approval_requests (
 id uuid DEFAULT gen_random_uuid() PRIMARY KEY, token uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
 client_id uuid NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE, job_type text NOT NULL CHECK(job_type IN('edit','design')),
 edit_job_id uuid REFERENCES crm_edit_jobs(id) ON DELETE CASCADE, design_job_id uuid REFERENCES crm_design_jobs(id) ON DELETE CASCADE,
 title text NOT NULL, preview_url text NOT NULL, status text DEFAULT 'bekliyor' CHECK(status IN('bekliyor','onaylandi','revize_istendi','suresi_doldu')),
 customer_note text DEFAULT '', expires_at timestamptz NOT NULL DEFAULT(now()+interval '14 days'), responded_at timestamptz,
 CHECK((job_type='edit' AND edit_job_id IS NOT NULL AND design_job_id IS NULL) OR (job_type='design' AND design_job_id IS NOT NULL AND edit_job_id IS NULL))
);
ALTER TABLE crm_recurring_task_templates DISABLE ROW LEVEL SECURITY; ALTER TABLE crm_recurring_task_runs DISABLE ROW LEVEL SECURITY; ALTER TABLE crm_approval_requests DISABLE ROW LEVEL SECURITY;
