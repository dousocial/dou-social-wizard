-- DOU CRM Faz 1: genişletilmiş ekip rolleri
-- Mevcut rol kısıtını güvenli biçimde yeniler.

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT tc.constraint_name INTO constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
   AND ccu.constraint_schema = tc.constraint_schema
  WHERE tc.table_schema = 'public'
    AND tc.table_name = 'admin_users'
    AND tc.constraint_type = 'CHECK'
    AND ccu.column_name = 'role'
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.admin_users DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE public.admin_users
  ADD CONSTRAINT admin_users_role_check
  CHECK (role IN (
    'yonetici',
    'koordinator',
    'editor',
    'tasarimci',
    'cekim_ekibi',
    'reklam_sorumlusu',
    'izleyici'
  ));
