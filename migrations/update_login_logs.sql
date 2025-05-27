-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own login logs" ON login_logs;
DROP POLICY IF EXISTS "Admins can view all login logs" ON login_logs;

-- Update the login_logs table structure
ALTER TABLE login_logs
  DROP COLUMN IF EXISTS user_email,
  ADD COLUMN IF NOT EXISTS user_identifier text NOT NULL,
  ADD COLUMN IF NOT EXISTS login_type text NOT NULL CHECK (login_type IN ('email', 'phone')),
  ADD COLUMN IF NOT EXISTS status text NOT NULL CHECK (status IN ('success', 'failed')),
  ADD COLUMN IF NOT EXISTS time timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS ip text,
  ADD COLUMN IF NOT EXISTS browser text;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_login_logs_user_identifier ON login_logs(user_identifier);
CREATE INDEX IF NOT EXISTS idx_login_logs_time ON login_logs(time);

-- Add RLS policies
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own login logs
CREATE POLICY "Users can view their own login logs"
ON login_logs FOR SELECT
USING (
  user_identifier = (
    SELECT email_or_phone 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Policy for admins to view all login logs
CREATE POLICY "Admins can view all login logs"
ON login_logs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy for managers to view login logs
CREATE POLICY "Managers can view login logs"
ON login_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'manager'
  )
);

-- Add comment to document the table
COMMENT ON TABLE login_logs IS 'Stores user login attempts with their status and metadata';

-- Update existing records to have login_type = 'email'
UPDATE login_logs SET login_type = 'email' WHERE login_type IS NULL; 