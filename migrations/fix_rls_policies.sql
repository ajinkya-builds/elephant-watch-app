-- Drop all existing policies
DO $$ 
BEGIN
  -- Get all policy names for the users table
  FOR r IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'users' AND schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON users', r.policyname);
  END LOOP;
END $$;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create base policies without circular references

-- 1. Service role has full access (no conditions)
CREATE POLICY "service_role_access"
ON users FOR ALL
USING (current_setting('role') = 'service_role');

-- 2. Allow public read access for auth
CREATE POLICY "public_read"
ON users FOR SELECT
USING (current_setting('role') IN ('anon', 'authenticated'));

-- 3. Allow authenticated users to manage their own data
CREATE POLICY "self_manage"
ON users FOR ALL
USING (
  current_setting('role') = 'authenticated' AND
  current_setting('request.jwt.claims', true)::jsonb->>'sub' = id::text
);

-- Add helpful comments
COMMENT ON TABLE users IS 'User profiles with role-based access control';
COMMENT ON COLUMN users.role IS 'User role: admin, manager, or data_collector'; 