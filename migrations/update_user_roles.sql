-- Update the role column to use the new role types
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users 
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'manager', 'data_collector'));

-- Add a comment to document the role hierarchy
COMMENT ON COLUMN users.role IS 'User roles: admin (full access), manager (user management + data collection), data_collector (data collection only)';

-- Update RLS policies to reflect new role structure
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Managers can view data collectors" ON users;

-- Policy for users to view their own data
CREATE POLICY "Users can view their own data" 
ON users FOR SELECT 
USING (auth.uid() = id);

-- Policy for admins to view and manage all users
CREATE POLICY "Admins can view and manage all users" 
ON users FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy for managers to view and manage data collectors
CREATE POLICY "Managers can view and manage data collectors" 
ON users FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'manager'
  )
  AND role = 'data_collector'
);

-- Create a function to check if a user can create another user with a specific role
CREATE OR REPLACE FUNCTION can_create_user_with_role(creator_role text, new_user_role text)
RETURNS boolean AS $$
BEGIN
  -- Admin can create any role
  IF creator_role = 'admin' THEN
    RETURN true;
  -- Manager can only create data_collector
  ELSIF creator_role = 'manager' AND new_user_role = 'data_collector' THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a trigger to enforce role creation permissions
CREATE OR REPLACE FUNCTION check_user_creation_permissions()
RETURNS TRIGGER AS $$
DECLARE
  creator_role text;
BEGIN
  -- Get the role of the creating user
  SELECT role INTO creator_role
  FROM users
  WHERE id = auth.uid();

  -- Check if the creator has permission to create a user with the specified role
  IF NOT can_create_user_with_role(creator_role, NEW.role) THEN
    RAISE EXCEPTION 'User with role % cannot create users with role %', creator_role, NEW.role;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS enforce_user_creation_permissions ON users;
CREATE TRIGGER enforce_user_creation_permissions
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_user_creation_permissions(); 