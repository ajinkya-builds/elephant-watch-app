-- Temporarily disable RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;
DROP POLICY IF EXISTS "Service role has full access" ON public.users;
DROP POLICY IF EXISTS "Admin users have full access" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.users;
DROP POLICY IF EXISTS "Admin full access" ON public.users;

-- Create new non-recursive policies

-- Policy 1: Basic read access for own profile
CREATE POLICY "Enable read access for own profile"
ON public.users
FOR SELECT
USING (auth.uid() = auth_id);

-- Policy 2: Service role access
CREATE POLICY "Service role full access"
ON public.users
FOR ALL
USING (auth.role() = 'service_role');

-- Policy 3: Self update access
CREATE POLICY "Enable update for own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- Policy 4: Admin access (using direct role check)
CREATE POLICY "Admin full access"
ON public.users
FOR ALL
USING (
  COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  OR 
  COALESCE((SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()), '') = 'admin'
);

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY; 