-- Add created_by column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Add index for faster lookups on created_by
CREATE INDEX IF NOT EXISTS idx_users_created_by ON users(created_by);

-- Add comment to document the column
COMMENT ON COLUMN users.created_by IS 'ID of the user who created this user';

-- Ensure email_or_phone is unique
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_or_phone_key;
ALTER TABLE users ADD CONSTRAINT users_email_or_phone_key UNIQUE (email_or_phone);

-- Drop ALL existing policies
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

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own data and data they created
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (
    auth.uid() = id
    OR created_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
    OR auth.role() = 'service_role'
);

-- Create policy for users to update their own data
CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
USING (
    auth.uid() = id
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
    OR auth.role() = 'service_role'
)
WITH CHECK (
    auth.uid() = id
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
    OR auth.role() = 'service_role'
);

-- Create policy for service role to insert users
CREATE POLICY "Service role can insert users"
ON users FOR INSERT
WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
); 