-- Drop any remaining constraints or indexes that reference email_or_phone
DO $$ 
BEGIN
    -- Drop constraints
    EXECUTE (
        SELECT string_agg('ALTER TABLE ' || quote_ident(table_schema) || '.' || quote_ident(table_name) || 
               ' DROP CONSTRAINT ' || quote_ident(constraint_name) || ';', E'\n')
        FROM information_schema.constraint_column_usage
        WHERE column_name = 'email_or_phone'
    );

    -- Drop indexes
    EXECUTE (
        SELECT string_agg('DROP INDEX IF EXISTS ' || quote_ident(schemaname) || '.' || quote_ident(indexname) || ';', E'\n')
        FROM pg_indexes
        WHERE indexdef LIKE '%email_or_phone%'
    );
END $$;

-- Drop the column if it still exists
ALTER TABLE public.users DROP COLUMN IF EXISTS email_or_phone CASCADE;

-- Ensure we have the correct columns and constraints
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS position TEXT;

-- Add constraints if they don't exist
DO $$ 
BEGIN
    -- Unique constraints
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'users_auth_id_key') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'users_email_key') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'users_phone_key') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_phone_key UNIQUE (phone);
    END IF;

    -- Check constraints
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'users_role_check') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'data_collector'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'users_position_check') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_position_check CHECK (position IN ('Ranger', 'DFO', 'Officer', 'Guard'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'users_status_check') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_status_check CHECK (status IN ('active', 'inactive'));
    END IF;
END $$;

-- Create or replace indexes
DROP INDEX IF EXISTS idx_users_auth_id;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_phone;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_status;

CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'users'
ORDER BY 
    ordinal_position; 