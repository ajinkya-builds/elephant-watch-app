-- Disable RLS on activity_observation table to make it completely public
ALTER TABLE public.activity_observation DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.activity_observation;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.activity_observation;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.activity_observation;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.activity_observation;

-- Grant all permissions to public
GRANT ALL ON public.activity_observation TO public;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO public; 