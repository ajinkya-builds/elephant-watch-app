-- Create the user_id_mapping table
CREATE TABLE IF NOT EXISTS user_id_mapping (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_id UUID NOT NULL,
    public_id UUID NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(auth_id),
    UNIQUE(public_id)
);

-- Create an index on auth_id and public_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_id_mapping_auth_id ON user_id_mapping(auth_id);
CREATE INDEX IF NOT EXISTS idx_user_id_mapping_public_id ON user_id_mapping(public_id);

-- Create a function to get the public ID from an auth ID
CREATE OR REPLACE FUNCTION get_public_id(auth_id UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT public_id FROM user_id_mapping WHERE user_id_mapping.auth_id = auth_id);
END;
$$ LANGUAGE plpgsql;

-- Create a function to get the auth ID from a public ID
CREATE OR REPLACE FUNCTION get_auth_id(public_id UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT auth_id FROM user_id_mapping WHERE user_id_mapping.public_id = public_id);
END;
$$ LANGUAGE plpgsql;

-- Create a function to create the mapping table if it doesn't exist
CREATE OR REPLACE FUNCTION create_user_id_mapping()
RETURNS void AS $$
BEGIN
    -- The table creation is handled by the migration
    -- This function is just a placeholder for the RPC call
    RETURN;
END;
$$ LANGUAGE plpgsql; 