-- Drop existing tables and views that depend on the current user structure
DROP VIEW IF EXISTS v_user_activity CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;

-- Modify users table to work with Supabase Auth
ALTER TABLE users 
  -- Remove columns that will be handled by Supabase Auth
  DROP COLUMN IF EXISTS password_hash,
  DROP COLUMN IF EXISTS email_or_phone,
  
  -- Add new columns for enhanced user profile
  ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS last_name TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS position TEXT CHECK (position IN ('Ranger', 'DFO', 'Officer', 'Guard')),
  
  -- Add constraints
  ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id),
  ADD CONSTRAINT users_email_key UNIQUE (email),
  ADD CONSTRAINT users_phone_key UNIQUE (phone),
  ALTER COLUMN role SET NOT NULL,
  ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'data_collector'));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_position ON users(position);

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

CREATE POLICY "Managers can view all users and manage data collectors"
ON users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_id = auth.uid()
    AND role = 'manager'
  )
  AND (role = 'data_collector' OR CURRENT_OPERATION = 'SELECT')
);

-- Create a function to sync user data from auth.users
CREATE OR REPLACE FUNCTION sync_user_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- For new sign-ups, create a corresponding users record
  INSERT INTO public.users (auth_id, email, phone, role, status, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    'data_collector',  -- Default role for new sign-ups
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (auth_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on sign-up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_from_auth();

-- Add helpful comments
COMMENT ON TABLE users IS 'Extended user profiles linked to Supabase Auth';
COMMENT ON COLUMN users.auth_id IS 'Reference to auth.users.id for Supabase Auth integration';
COMMENT ON COLUMN users.position IS 'User''s position in the organization (Ranger, DFO, Officer, Guard)'; 