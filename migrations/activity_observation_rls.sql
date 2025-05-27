-- Enable Row Level Security on the table
ALTER TABLE public.activity_observation ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read (SELECT) from the table
CREATE POLICY "Allow read for all authenticated users"
  ON public.activity_observation
  FOR SELECT
  TO authenticated
  USING (true);

-- (Optional) Uncomment to allow service_role and/or anon to read as well
-- CREATE POLICY "Allow read for service role"
--   ON public.activity_observation
--   FOR SELECT
--   TO service_role
--   USING (true);
-- CREATE POLICY "Allow read for anon"
--   ON public.activity_observation
--   FOR SELECT
--   TO anon
--   USING (true); 