-- Function to sync a user from auth.users to public.users
CREATE OR REPLACE FUNCTION sync_user_from_auth()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a new user in auth.users
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.users (
            id,
            email,
            phone,
            role,
            status,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            NEW.phone,
            'data_collector', -- default role
            'active',         -- default status
            NEW.created_at,
            NEW.updated_at
        )
        ON CONFLICT (id) DO UPDATE
        SET
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            updated_at = EXCLUDED.updated_at;
    
    -- If this is an update to auth.users
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE public.users
        SET
            email = NEW.email,
            phone = NEW.phone,
            updated_at = NEW.updated_at
        WHERE id = NEW.id;
    
    -- If this is a delete from auth.users
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.users
        SET
            status = 'inactive',
            updated_at = NOW()
        WHERE id = OLD.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS sync_user_trigger ON auth.users;
CREATE TRIGGER sync_user_trigger
    AFTER INSERT OR UPDATE OR DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_from_auth();

-- Function to sync a user from public.users to auth.users
CREATE OR REPLACE FUNCTION sync_user_to_auth()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a new user in public.users
    IF (TG_OP = 'INSERT') THEN
        -- Note: We can't create auth users directly, this is just for updates
        RETURN NEW;
    
    -- If this is an update to public.users
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Update auth.users if it exists
        UPDATE auth.users
        SET
            email = NEW.email,
            phone = NEW.phone,
            updated_at = NEW.updated_at
        WHERE id = NEW.id;
    
    -- If this is a delete from public.users
    ELSIF (TG_OP = 'DELETE') THEN
        -- Note: We can't delete auth users directly, this is just for updates
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on public.users
DROP TRIGGER IF EXISTS sync_user_to_auth_trigger ON public.users;
CREATE TRIGGER sync_user_to_auth_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_to_auth();

-- Function to sync all existing users
CREATE OR REPLACE FUNCTION sync_all_users()
RETURNS void AS $$
DECLARE
    auth_user RECORD;
BEGIN
    -- Loop through all auth users and sync them to public.users
    FOR auth_user IN SELECT * FROM auth.users LOOP
        INSERT INTO public.users (
            id,
            email,
            phone,
            role,
            status,
            created_at,
            updated_at
        ) VALUES (
            auth_user.id,
            auth_user.email,
            auth_user.phone,
            'data_collector', -- default role
            'active',         -- default status
            auth_user.created_at,
            auth_user.updated_at
        )
        ON CONFLICT (id) DO UPDATE
        SET
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            updated_at = EXCLUDED.updated_at;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the initial sync
SELECT sync_all_users(); 