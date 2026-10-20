-- Only the trusted server service role can read names or book a slot.
-- Both unique indexes resolve simultaneous requests atomically in PostgreSQL.
CREATE TABLE IF NOT EXISTS public.interview_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL CHECK (event_id = '2026-10-23'),
  slot_index integer NOT NULL CHECK (slot_index BETWEEN 0 AND 32),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 5 AND 100),
  name_key text NOT NULL,
  browser_key text NOT NULL CHECK (char_length(browser_key) = 64),
  created_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz
);
ALTER TABLE public.interview_bookings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.interview_bookings FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.interview_bookings TO service_role;
CREATE UNIQUE INDEX IF NOT EXISTS interview_one_slot ON public.interview_bookings (event_id, slot_index) WHERE cancelled_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS interview_one_name ON public.interview_bookings (event_id, name_key) WHERE cancelled_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS interview_one_browser ON public.interview_bookings (event_id, browser_key) WHERE cancelled_at IS NULL;
