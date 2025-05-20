-- Step 1: Temporarily disable RLS to allow operations
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;
DROP POLICY IF EXISTS "Service role has full access" ON public.users;
DROP POLICY IF EXISTS "Admin users have full access" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Step 3: Create new non-recursive policies

-- Policy 1: Allow users to read their own profile using auth.uid()
CREATE POLICY "Enable read access for own profile"
ON public.users
FOR SELECT
USING (auth.uid() = auth_id);

-- Policy 2: Allow service role full access without any checks
CREATE POLICY "Service role full access"
ON public.users
FOR ALL
USING (auth.role() = 'service_role');

-- Policy 3: Allow authenticated users to update their own profile
CREATE POLICY "Enable update for own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- Policy 4: Allow admins full access based on JWT claim
CREATE POLICY "Admin full access"
ON public.users
FOR ALL
USING (
  auth.jwt() ->> 'role' = 'admin'
  OR 
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- Step 4: Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify policies
SELECT * FROM pg_policies WHERE tablename = 'users'; 