-- 1. Ensure user_id is UUID, NOT NULL, and references auth.users(id)
ALTER TABLE public.activity_reports
    ALTER COLUMN user_id SET DATA TYPE uuid USING user_id::uuid,
    ALTER COLUMN user_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'activity_reports'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name = 'activity_reports_user_id_fkey'
    ) THEN
        ALTER TABLE public.activity_reports
        ADD CONSTRAINT activity_reports_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Enable RLS and drop all policies
ALTER TABLE public.activity_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.activity_reports;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.activity_reports;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.activity_reports;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.activity_reports;

-- 3. Create correct policies
CREATE POLICY "Enable read access for authenticated users"
ON public.activity_reports FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON public.activity_reports FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid()::uuid = user_id
);

CREATE POLICY "Enable update for users based on user_id"
ON public.activity_reports FOR UPDATE
TO authenticated
USING (
    auth.uid()::uuid = user_id
)
WITH CHECK (
    auth.uid()::uuid = user_id
);

CREATE POLICY "Enable delete for users based on user_id"
ON public.activity_reports FOR DELETE
TO authenticated
USING (
    auth.uid()::uuid = user_id
);

-- 4. Grant permissions
GRANT ALL ON public.activity_reports TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure the users table exists and has the correct structure
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        CREATE TABLE public.users (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Grant permissions on the users table
GRANT SELECT ON public.users TO authenticated;

-- Create debug_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.debug_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    operation TEXT,
    auth_uid UUID,
    user_id UUID,
    details JSONB
);

-- Grant permissions on debug_logs
GRANT ALL ON public.debug_logs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.debug_logs_id_seq TO authenticated;

-- Create a function to help debug RLS policies
CREATE OR REPLACE FUNCTION public.debug_rls_policy()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.debug_logs (operation, auth_uid, user_id, details)
    VALUES (
        TG_OP,
        auth.uid()::uuid,
        NEW.user_id::uuid,
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'policy', current_setting('role', true),
            'session_user', session_user
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to log RLS policy checks
DROP TRIGGER IF EXISTS debug_rls_trigger ON public.activity_reports;
CREATE TRIGGER debug_rls_trigger
    BEFORE INSERT OR UPDATE OR DELETE ON public.activity_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.debug_rls_policy(); 