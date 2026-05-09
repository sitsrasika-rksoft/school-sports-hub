-- Helper function (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add sport_code to sports
ALTER TABLE public.sports ADD COLUMN IF NOT EXISTS sport_code text;
CREATE UNIQUE INDEX IF NOT EXISTS sports_sport_code_key ON public.sports(sport_code) WHERE sport_code IS NOT NULL;

-- Coaches table
CREATE TABLE IF NOT EXISTS public.coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  specialization text,
  role text,
  sport text,
  profile_image_key text,
  address text,
  experience text,
  ranking text,
  since_year integer,
  achievements text[],
  date_of_birth date,
  hired_at date,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coaches viewable by authenticated" ON public.coaches;
CREATE POLICY "Coaches viewable by authenticated"
  ON public.coaches FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins insert coaches" ON public.coaches;
CREATE POLICY "Admins insert coaches"
  ON public.coaches FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins update coaches" ON public.coaches;
CREATE POLICY "Admins update coaches"
  ON public.coaches FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins delete coaches" ON public.coaches;
CREATE POLICY "Admins delete coaches"
  ON public.coaches FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS update_coaches_updated_at ON public.coaches;
CREATE TRIGGER update_coaches_updated_at
  BEFORE UPDATE ON public.coaches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for coach profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('coach-profiles', 'coach-profiles', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Coach images public read" ON storage.objects;
CREATE POLICY "Coach images public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'coach-profiles');

DROP POLICY IF EXISTS "Admins upload coach images" ON storage.objects;
CREATE POLICY "Admins upload coach images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'coach-profiles' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins update coach images" ON storage.objects;
CREATE POLICY "Admins update coach images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'coach-profiles' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins delete coach images" ON storage.objects;
CREATE POLICY "Admins delete coach images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'coach-profiles' AND has_role(auth.uid(), 'admin'::app_role));
