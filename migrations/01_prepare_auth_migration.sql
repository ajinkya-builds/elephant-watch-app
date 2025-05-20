-- First, drop all dependent policies and views
DROP POLICY IF EXISTS "Users can view their own login logs" ON login_logs;
DROP POLICY IF EXISTS "Admins can view all login logs" ON login_logs;
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

-- Drop dependent views
DROP VIEW IF EXISTS v_user_activity CASCADE;
DROP VIEW IF EXISTS v_user_stats CASCADE;
DROP VIEW IF EXISTS v_active_users CASCADE;

-- Modify login_logs table to work with new structure
ALTER TABLE login_logs
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Copy data from user_identifier to appropriate columns
UPDATE login_logs
SET 
  email = CASE WHEN login_type = 'email' THEN user_identifier ELSE NULL END,
  phone = CASE WHEN login_type = 'phone' THEN user_identifier ELSE NULL END;

-- Create temporary table to store user mappings
CREATE TABLE IF NOT EXISTS user_migration_map (
  old_id UUID,
  new_auth_id UUID,
  email_or_phone TEXT,
  email TEXT,
  phone TEXT,
  PRIMARY KEY (old_id)
);

-- Store current user data for migration
INSERT INTO user_migration_map (old_id, email_or_phone)
SELECT id, email_or_phone
FROM users
ON CONFLICT (old_id) DO NOTHING; 