-- Drop any existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins have full access" ON users;
DROP POLICY IF EXISTS "Managers can view all users and manage data collectors" ON users;
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

-- 4. Allow admin users full access
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