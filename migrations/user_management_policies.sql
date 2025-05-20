-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can view users they created" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can delete their own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Managers can manage their created users" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for viewing users
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (
    auth.uid() = id 
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'manager'
        AND created_by = auth.uid()
    )
);

-- Policy for updating users
CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
USING (
    auth.uid() = id 
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'manager'
        AND created_by = auth.uid()
    )
)
WITH CHECK (
    auth.uid() = id 
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'manager'
        AND created_by = auth.uid()
    )
);

-- Policy for deleting users
CREATE POLICY "Users can delete their own data"
ON users FOR DELETE
USING (
    auth.uid() = id 
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'manager'
        AND created_by = auth.uid()
    )
);

-- Policy for inserting new users
CREATE POLICY "Admins and managers can create users"
ON users FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'manager'
    )
);

-- Add created_by column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Add index for faster lookups on created_by
CREATE INDEX IF NOT EXISTS idx_users_created_by ON users(created_by);

-- Add comment to document the column
COMMENT ON COLUMN users.created_by IS 'ID of the user who created this user';

-- Ensure email and phone are unique
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email) WHERE email IS NOT NULL;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE users ADD CONSTRAINT users_phone_key UNIQUE (phone) WHERE phone IS NOT NULL; 