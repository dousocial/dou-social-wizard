-- Preserve cancelled history while disallowing active lunch reservations.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.interview_bookings'::regclass
      AND conname = 'interview_lunch_break'
  ) THEN
    ALTER TABLE public.interview_bookings
      ADD CONSTRAINT interview_lunch_break
      CHECK (cancelled_at IS NOT NULL OR slot_index NOT BETWEEN 8 AND 11);
  END IF;
END $$;
