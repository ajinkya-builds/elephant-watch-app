-- Add mobile column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile VARCHAR(10);

-- Add unique constraint for mobile numbers
ALTER TABLE users ADD CONSTRAINT unique_mobile UNIQUE (mobile);

-- Add index for faster mobile number lookups
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);

-- Update RLS policies to allow mobile number access
ALTER POLICY "Users can view their own data" ON users
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Add comment to the mobile column
COMMENT ON COLUMN users.mobile IS 'User''s 10-digit mobile number for login'; 