-- Drop all existing policies on the users table
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

-- Make sure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
-- 1. Basic policy for everyone to see own profile by auth_id
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (auth.uid() = auth_id);

-- 2. Service role can do anything
CREATE POLICY "Service role has full access"
ON users FOR ALL
USING (auth.role() = 'service_role');

-- 3. Admin users can do anything (based on role column in users table)
CREATE POLICY "Admins can do anything"
ON users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_id = auth.uid()
    AND role = 'admin'
  )
);

-- 4. Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- 5. Allow authenticated users to view all users (needed for profile lookups)
CREATE POLICY "Authenticated users can view all users"
ON users FOR SELECT
USING (auth.role() = 'authenticated'); 