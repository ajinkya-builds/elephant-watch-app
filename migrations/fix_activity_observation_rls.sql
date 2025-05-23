-- Drop all existing policies on activity_observation
DROP POLICY IF EXISTS "Users can view their own observations" ON public.activity_observation;
DROP POLICY IF EXISTS "Users can create their own observations" ON public.activity_observation;
DROP POLICY IF EXISTS "Users can update their own observations" ON public.activity_observation;
DROP POLICY IF EXISTS "Users can delete their own observations" ON public.activity_observation;
DROP POLICY IF EXISTS "Allow read for all authenticated users" ON public.activity_observation;

-- Create new policies for activity_observation
CREATE POLICY "Enable read access for authenticated users"
ON public.activity_observation FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON public.activity_observation FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON public.activity_observation FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON public.activity_observation FOR DELETE
TO authenticated
USING (true);

-- Grant permissions
GRANT ALL ON public.activity_observation TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated; 