-- Add a unique constraint that allows either email or mobile to be null
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_mobile_key;

-- Create a unique constraint that ensures at least one of email or mobile is present
ALTER TABLE users ADD CONSTRAINT users_identifier_check 
    CHECK (email IS NOT NULL OR mobile IS NOT NULL);

-- Create a unique constraint for email (when present)
ALTER TABLE users ADD CONSTRAINT users_email_key 
    UNIQUE (email) 
    WHERE email IS NOT NULL;

-- Create a unique constraint for mobile (when present)
ALTER TABLE users ADD CONSTRAINT users_mobile_key 
    UNIQUE (mobile) 
    WHERE mobile IS NOT NULL;

-- Add an index for faster lookups on both fields
CREATE INDEX IF NOT EXISTS idx_users_email_mobile ON users(email, mobile);

-- Update RLS policies to allow access to both email and mobile
ALTER POLICY "Users can view their own data" ON users
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Add comments to clarify the new constraints
COMMENT ON CONSTRAINT users_identifier_check ON users IS 'Ensures at least one of email or mobile is present';
COMMENT ON CONSTRAINT users_email_key ON users IS 'Email must be unique when present';
COMMENT ON CONSTRAINT users_mobile_key ON users IS 'Mobile must be unique when present'; 