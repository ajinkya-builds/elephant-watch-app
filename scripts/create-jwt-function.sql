-- Create a function to set user role in JWT claims
CREATE OR REPLACE FUNCTION auth.set_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Get the user's role from public.users
    SELECT role INTO user_role
    FROM public.users
    WHERE auth_id = NEW.id;

    -- If role found, set it in the JWT claims
    IF user_role IS NOT NULL THEN
        NEW.raw_app_meta_data := 
            COALESCE(NEW.raw_app_meta_data, '{}'::jsonb) || 
            jsonb_build_object('role', user_role);
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger to set role on user creation/update
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auth.set_user_role();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION auth.set_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION auth.set_user_role TO service_role; 