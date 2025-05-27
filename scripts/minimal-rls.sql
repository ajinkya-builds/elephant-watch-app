-- First, disable RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(polname) || ' ON public.users;', E'\n')
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'users'
    );
END $$;

-- Create a single, simple policy for authenticated users
CREATE POLICY "Allow authenticated access"
ON public.users
FOR ALL
USING (
    -- Allow service role full access
    auth.role() = 'service_role'
    OR
    -- Allow authenticated users to see their own data
    (auth.role() = 'authenticated' AND auth_id = auth.uid())
);

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Verify the policy
SELECT * FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'; 