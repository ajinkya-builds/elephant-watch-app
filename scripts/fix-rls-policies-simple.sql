-- Step 1: Temporarily disable RLS to allow operations
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies for the users table
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can view users they created" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users are viewable by admins" ON public.users;
DROP POLICY IF EXISTS "Users are viewable by managers" ON public.users;
DROP POLICY IF EXISTS "Users are insertable by admins" ON public.users;
DROP POLICY IF EXISTS "Users are insertable by managers" ON public.users;
DROP POLICY IF EXISTS "Users are updatable by admins" ON public.users;
DROP POLICY IF EXISTS "Users are updatable by managers" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Service role has full access" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins have full access" ON public.users;
DROP POLICY IF EXISTS "Managers can view all users and manage data collectors" ON public.users;
DROP POLICY IF EXISTS "Admins can view and manage all users" ON public.users;
DROP POLICY IF EXISTS "Managers can view and manage data collectors" ON public.users;
DROP POLICY IF EXISTS "Admins can do anything" ON public.users;

-- Step 3: Create new simplified policies

-- Policy 1: Users can read their own profile
CREATE POLICY "Users can read their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = auth_id);

-- Policy 2: Service role has full access (won't cause recursion)
CREATE POLICY "Service role has full access"
ON public.users
FOR ALL
USING (auth.role() = 'service_role');

-- Policy 3: Admin access based on JWT role claim, not table lookup
CREATE POLICY "Admin users have full access"
ON public.users
FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- Policy 4: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- Step 4: Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'users'; 