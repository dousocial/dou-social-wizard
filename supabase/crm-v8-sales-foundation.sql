-- DOU CRM Faz 1: satış alanları, görüşme/sözleşme temeli ve güvenli dönüşüm

ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS first_name text DEFAULT '';
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS last_name text DEFAULT '';
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS city text DEFAULT '';
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS district text DEFAULT '';
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS interested_service text DEFAULT '';
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS referral_source text DEFAULT '';
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS estimated_budget numeric;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS company_size text DEFAULT '';
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS first_contact_date date DEFAULT CURRENT_DATE;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS lost_reason text DEFAULT '';

ALTER TABLE crm_leads DROP CONSTRAINT IF EXISTS crm_leads_status_check;
ALTER TABLE crm_leads ADD CONSTRAINT crm_leads_status_check CHECK (status IN (
  'yeni', 'ilk_arama', 'gorusuldu', 'bilgi_bekleniyor', 'gorusme_planlanacak',
  'teklif_istendi', 'teklif_gonderildi', 'donus_bekleniyor', 'teklif_kabul',
  'teklif_reddedildi', 'takipte', 'daha_sonra', 'kazanildi', 'kaybedildi'
));

ALTER TABLE crm_leads DROP CONSTRAINT IF EXISTS crm_leads_score_check;
ALTER TABLE crm_leads ADD CONSTRAINT crm_leads_score_check CHECK (score BETWEEN 0 AND 100);

CREATE TABLE IF NOT EXISTS crm_meetings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  lead_id uuid NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  meeting_at timestamptz NOT NULL,
  location text DEFAULT '',
  participants text[] DEFAULT '{}',
  purpose text DEFAULT '',
  current_problems text DEFAULT '',
  expectations text DEFAULT '',
  current_accounts text DEFAULT '',
  requested_services text[] DEFAULT '{}',
  estimated_monthly_budget numeric,
  notes text DEFAULT ''
);

CREATE TABLE IF NOT EXISTS crm_contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  client_id uuid NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES crm_leads(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date,
  monthly_fee numeric NOT NULL DEFAULT 0 CHECK (monthly_fee >= 0),
  payment_day int CHECK (payment_day BETWEEN 1 AND 31),
  duration_months int CHECK (duration_months > 0),
  auto_renew boolean DEFAULT false,
  monthly_post_count int DEFAULT 0 CHECK (monthly_post_count >= 0),
  monthly_video_count int DEFAULT 0 CHECK (monthly_video_count >= 0),
  monthly_shoot_days int DEFAULT 0 CHECK (monthly_shoot_days >= 0),
  story_service boolean DEFAULT false,
  advertising_management boolean DEFAULT false,
  services jsonb DEFAULT '[]'::jsonb,
  extra_services text DEFAULT '',
  signed_contract_url text DEFAULT '',
  notes text DEFAULT ''
);

CREATE TABLE IF NOT EXISTS crm_activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE crm_meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activity_logs DISABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION convert_crm_lead_to_client(
  p_lead_id uuid,
  p_monthly_fee numeric,
  p_start_date date,
  p_platforms text[],
  p_actor_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead crm_leads%ROWTYPE;
  v_client_id uuid;
  v_company_name text;
  v_contact_name text;
  v_task text;
BEGIN
  IF p_monthly_fee < 0 THEN
    RAISE EXCEPTION 'Aylık ücret negatif olamaz.';
  END IF;

  SELECT * INTO v_lead FROM crm_leads WHERE id = p_lead_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Fırsat kaydı bulunamadı.'; END IF;
  IF v_lead.converted_client_id IS NOT NULL THEN
    RAISE EXCEPTION 'Bu fırsat daha önce müşteriye dönüştürülmüş.';
  END IF;

  v_company_name := COALESCE(NULLIF(v_lead.company_name, ''), v_lead.title);
  IF v_lead.company_id IS NOT NULL THEN
    SELECT name INTO v_company_name FROM crm_companies WHERE id = v_lead.company_id;
  END IF;
  v_contact_name := COALESCE(NULLIF(v_lead.contact_name, ''), trim(concat_ws(' ', v_lead.first_name, v_lead.last_name)), '');
  IF v_lead.contact_id IS NOT NULL THEN
    SELECT name INTO v_contact_name FROM crm_contacts WHERE id = v_lead.contact_id;
  END IF;

  INSERT INTO musteriler (
    ad, sektor, website, email, telefon, sorumlu, durum, platformlar,
    aylik_ucret, baslangic_tarihi, notlar
  ) VALUES (
    v_company_name, COALESCE(NULLIF(v_lead.sector, ''), 'Diğer'), v_lead.website,
    v_lead.email, v_lead.phone, v_lead.assigned_user, 'aktif', COALESCE(p_platforms, '{}'),
    p_monthly_fee, p_start_date,
    concat('[Fırsat Dönüşümü] Yetkili: ', v_contact_name, '. Lead Notları: ', COALESCE(v_lead.notes, ''))
  ) RETURNING id INTO v_client_id;

  UPDATE crm_leads
  SET converted_client_id = v_client_id, status = 'kazanildi', updated_at = now()
  WHERE id = p_lead_id;

  UPDATE musteri_teklifler
  SET musteri_id = v_client_id,
      durum = CASE WHEN durum IN ('kabul_edildi', 'kazanildi') THEN durum ELSE 'kabul_edildi' END
  WHERE lead_id = p_lead_id;

  FOREACH v_task IN ARRAY ARRAY[
    'Sözleşmenin hazırlanması', 'Sözleşme görüşmesinin planlanması',
    'Sözleşmenin imzalanması', 'Müşteri hesap bilgilerinin alınması',
    'Marka bilgilerinin sisteme girilmesi', 'Drive klasörünün oluşturulması',
    'İletişim grubunun oluşturulması', 'İlk çekim gününün planlanması',
    'Aylık içerik planının hazırlanması'
  ] LOOP
    INSERT INTO musteri_gorevler (musteri_id, baslik, aciklama, oncelik)
    VALUES (v_client_id, v_task, 'Fırsat müşteriye dönüştürülürken otomatik oluşturuldu.', 'yuksek');
  END LOOP;

  INSERT INTO crm_activity_logs (user_id, entity_type, entity_id, action, details)
  VALUES (p_actor_id, 'lead', p_lead_id, 'lead_converted', jsonb_build_object('client_id', v_client_id));

  RETURN v_client_id;
END;
$$;

REVOKE ALL ON FUNCTION convert_crm_lead_to_client(uuid, numeric, date, text[], uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION convert_crm_lead_to_client(uuid, numeric, date, text[], uuid) TO service_role;
