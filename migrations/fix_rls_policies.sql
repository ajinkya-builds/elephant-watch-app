-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Service role can view all users" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Service role can update users" ON users;
DROP POLICY IF EXISTS "Users are viewable by admins" ON users;
DROP POLICY IF EXISTS "Users are viewable by managers" ON users;
DROP POLICY IF EXISTS "Users are insertable by admins" ON users;
DROP POLICY IF EXISTS "Users are insertable by managers" ON users;
DROP POLICY IF EXISTS "Users are updatable by admins" ON users;
DROP POLICY IF EXISTS "Users are updatable by managers" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Service role has full access" ON users;
DROP POLICY IF EXISTS "Allow public read access for auth" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

-- Create a policy for authentication queries (no auth required)
CREATE POLICY "Allow authentication queries"
ON users FOR SELECT
USING (true)
WITH CHECK (true);

-- Allow service role to do everything
CREATE POLICY "Service role has full access"
ON users FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Allow users to update their own data
CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
USING (
  auth.uid() = id 
  OR auth.role() = 'service_role'
  OR email_or_phone = auth.jwt()->>'email_or_phone'
)
WITH CHECK (
  auth.uid() = id 
  OR auth.role() = 'service_role'
  OR email_or_phone = auth.jwt()->>'email_or_phone'
);

-- Create policies for login_logs table
CREATE POLICY "Anyone can insert login logs"
ON login_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all login logs"
ON login_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Users can view their own login logs"
ON login_logs FOR SELECT
USING (
  user_identifier IN (
    SELECT email_or_phone FROM users
    WHERE id = auth.uid()
  )
); 