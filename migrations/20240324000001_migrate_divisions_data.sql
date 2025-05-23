-- Copy data from old divisions table to new one
INSERT INTO public.divisions_new (division_id, name, state, district, created_at, updated_at)
SELECT 
    division_id,
    name,
    state,
    district,
    created_at,
    updated_at
FROM public.divisions
ON CONFLICT (division_id) DO UPDATE
SET 
    name = EXCLUDED.name,
    state = EXCLUDED.state,
    district = EXCLUDED.district,
    updated_at = CURRENT_TIMESTAMP;

-- Verify the data was copied correctly
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM public.divisions;
    SELECT COUNT(*) INTO new_count FROM public.divisions_new;
    
    IF old_count != new_count THEN
        RAISE EXCEPTION 'Data migration failed: count mismatch. Old: %, New: %', old_count, new_count;
    END IF;
END $$; 