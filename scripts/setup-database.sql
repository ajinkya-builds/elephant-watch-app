-- Create the exec_sql function
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can view users they created" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users; 
DROP POLICY IF EXISTS "Users are viewable by admins" ON users;
DROP POLICY IF EXISTS "Users are viewable by managers" ON users;
DROP POLICY IF EXISTS "Users are insertable by admins" ON users;
DROP POLICY IF EXISTS "Users are insertable by managers" ON users;
DROP POLICY IF EXISTS "Users are updatable by admins" ON users;
DROP POLICY IF EXISTS "Users are updatable by managers" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Service role has full access" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins have full access" ON users;
DROP POLICY IF EXISTS "Managers can view all users and manage data collectors" ON users;
DROP POLICY IF EXISTS "Admins can view and manage all users" ON users;
DROP POLICY IF EXISTS "Managers can view and manage data collectors" ON users;
DROP POLICY IF EXISTS "Admins can do anything" ON users;
DROP POLICY IF EXISTS "Authenticated users can view all users" ON users;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update for users based on auth_id" ON users;
DROP POLICY IF EXISTS "Enable all access for service role" ON users;
DROP POLICY IF EXISTS "Enable all access for admin users" ON users;
DROP POLICY IF EXISTS "Enable read access for anonymous users" ON users;

-- Make sure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;
GRANT ALL ON users TO anon;

-- Create simplified policies
-- 1. Allow all authenticated users to read
CREATE POLICY "Enable read access for all authenticated users"
ON users FOR SELECT
TO authenticated
USING (true);

-- 2. Allow users to update their own profile
CREATE POLICY "Enable update for users based on auth_id"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- 3. Allow service role full access
CREATE POLICY "Enable all access for service role"
ON users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Allow admin users full access (using role check without recursion)
CREATE POLICY "Enable all access for admin users"
ON users FOR ALL
TO authenticated
USING (role = 'admin')
WITH CHECK (role = 'admin');

-- 5. Allow anonymous users to read (needed for initial access)
CREATE POLICY "Enable read access for anonymous users"
ON users FOR SELECT
TO anon
USING (true); 