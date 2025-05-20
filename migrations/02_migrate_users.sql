-- Split email_or_phone into separate columns in the mapping table
UPDATE user_migration_map
SET
  email = CASE 
    WHEN email_or_phone LIKE '%@%' THEN email_or_phone 
    ELSE NULL 
  END,
  phone = CASE 
    WHEN email_or_phone NOT LIKE '%@%' THEN email_or_phone 
    ELSE NULL 
  END;

-- First add new columns to the users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS auth_id UUID,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS position TEXT;

-- Drop existing constraints if they exist
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS users_auth_id_fkey,
  DROP CONSTRAINT IF EXISTS users_auth_id_key,
  DROP CONSTRAINT IF EXISTS users_email_key,
  DROP CONSTRAINT IF EXISTS users_phone_key,
  DROP CONSTRAINT IF EXISTS users_role_check,
  DROP CONSTRAINT IF EXISTS users_position_check;

-- Now add the constraints and foreign key
ALTER TABLE users 
  ADD CONSTRAINT users_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id),
  ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id),
  ADD CONSTRAINT users_email_key UNIQUE (email),
  ADD CONSTRAINT users_phone_key UNIQUE (phone),
  ALTER COLUMN role SET NOT NULL,
  ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'data_collector')),
  ADD CONSTRAINT users_position_check CHECK (position IN ('Ranger', 'DFO', 'Officer', 'Guard'));

-- Now remove old columns
ALTER TABLE users 
  DROP COLUMN IF EXISTS password_hash CASCADE,
  DROP COLUMN IF EXISTS email_or_phone CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_position ON users(position);

-- Update login_logs policies for new structure
CREATE POLICY "Users can view their own login logs"
ON login_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_id = auth.uid()
    AND (
      users.email = login_logs.email
      OR users.phone = login_logs.phone
    )
  )
);

CREATE POLICY "Admins can view all login logs"
ON login_logs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_id = auth.uid()
    AND role = 'admin'
  )
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for Supabase Auth integration
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Admins have full access"
ON users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_id = auth.uid()
    AND role = 'admin'
  )
);

-- Fixed policy without using CURRENT_OPERATION
CREATE POLICY "Managers can view all users and manage data collectors"
ON users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_id = auth.uid()
    AND role = 'manager'
  )
  AND (
    CASE 
      WHEN (SELECT current_setting('statement_type')) IN ('INSERT', 'UPDATE', 'DELETE') THEN role = 'data_collector'
      ELSE true
    END
  )
);

-- Add helpful comments
COMMENT ON TABLE users IS 'Extended user profiles linked to Supabase Auth';
COMMENT ON COLUMN users.auth_id IS 'Reference to auth.users.id for Supabase Auth integration';
COMMENT ON COLUMN users.position IS 'User''s position in the organization (Ranger, DFO, Officer, Guard)'; 