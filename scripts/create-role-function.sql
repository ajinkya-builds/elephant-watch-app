-- Create a function to safely check user role
CREATE OR REPLACE FUNCTION auth.check_user_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- First try to get role from JWT claim
    user_role := current_setting('request.jwt.claims', true)::json->>'role';
    
    -- If no role in JWT, check auth.users metadata
    IF user_role IS NULL THEN
        SELECT raw_app_meta_data->>'role'
        INTO user_role
        FROM auth.users
        WHERE id = user_id;
    END IF;
    
    -- Return true if user has the required role
    RETURN user_role = required_role;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION auth.check_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION auth.check_user_role TO service_role;

-- Now create simplified RLS policies that use this function
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;
DROP POLICY IF EXISTS "Service role has full access" ON public.users;
DROP POLICY IF EXISTS "Admin users have full access" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.users;
DROP POLICY IF EXISTS "Admin full access" ON public.users;

-- Create new non-recursive policies
CREATE POLICY "Basic read access"
ON public.users
FOR SELECT
USING (
    auth.uid() = auth_id
    OR auth.role() = 'service_role'
    OR auth.check_user_role(auth.uid(), 'admin')
);

CREATE POLICY "Service role access"
ON public.users
FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Self update access"
ON public.users
FOR UPDATE
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Admin access"
ON public.users
FOR ALL
USING (auth.check_user_role(auth.uid(), 'admin'));

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY; 