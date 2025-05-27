-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can view users they created" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can delete their own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Managers can manage their created users" ON users;
DROP POLICY IF EXISTS "Service role has full access" ON users;
DROP POLICY IF EXISTS "Admins and managers can create users" ON users;

-- Disable RLS temporarily to ensure clean state
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for viewing users
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (
    auth.uid() = auth_id 
    OR auth.role() = 'service_role'
    OR auth.jwt() ->> 'role' = 'admin'
    OR (
        auth.jwt() ->> 'role' = 'manager' 
        AND created_by = auth.uid()
    )
);

-- Policy for updating users
CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
USING (
    auth.uid() = auth_id 
    OR auth.role() = 'service_role'
    OR auth.jwt() ->> 'role' = 'admin'
    OR (
        auth.jwt() ->> 'role' = 'manager' 
        AND created_by = auth.uid()
    )
)
WITH CHECK (
    auth.uid() = auth_id 
    OR auth.role() = 'service_role'
    OR auth.jwt() ->> 'role' = 'admin'
    OR (
        auth.jwt() ->> 'role' = 'manager' 
        AND created_by = auth.uid()
    )
);

-- Policy for deleting users
CREATE POLICY "Users can delete their own data"
ON users FOR DELETE
USING (
    auth.uid() = auth_id 
    OR auth.role() = 'service_role'
    OR auth.jwt() ->> 'role' = 'admin'
    OR (
        auth.jwt() ->> 'role' = 'manager' 
        AND created_by = auth.uid()
    )
);

-- Policy for inserting new users
CREATE POLICY "Admins and managers can create users"
ON users FOR INSERT
WITH CHECK (
    auth.role() = 'service_role'
    OR auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'role' = 'manager'
);

-- Add created_by column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Add index for faster lookups on created_by
CREATE INDEX IF NOT EXISTS idx_users_created_by ON users(created_by);

-- Add comment to document the column
COMMENT ON COLUMN users.created_by IS 'ID of the user who created this user';

-- Drop existing constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_key;

-- Create unique indexes instead of constraints
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_key ON users(phone) WHERE phone IS NOT NULL;

-- Add trigger to automatically set created_by
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_by IS NULL THEN
        NEW.created_by := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_created_by_trigger ON users;
CREATE TRIGGER set_created_by_trigger
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_created_by(); 