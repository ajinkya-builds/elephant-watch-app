-- Add boundary columns to activity_observation table if they don't exist
DO $$ 
BEGIN
    -- Add division columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'activity_observation' AND column_name = 'associated_division') THEN
        ALTER TABLE public.activity_observation 
        ADD COLUMN associated_division TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'activity_observation' AND column_name = 'associated_division_id') THEN
        ALTER TABLE public.activity_observation 
        ADD COLUMN associated_division_id INTEGER;
    END IF;

    -- Add range columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'activity_observation' AND column_name = 'associated_range') THEN
        ALTER TABLE public.activity_observation 
        ADD COLUMN associated_range TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'activity_observation' AND column_name = 'associated_range_id') THEN
        ALTER TABLE public.activity_observation 
        ADD COLUMN associated_range_id INTEGER;
    END IF;

    -- Add beat columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'activity_observation' AND column_name = 'associated_beat') THEN
        ALTER TABLE public.activity_observation 
        ADD COLUMN associated_beat TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'activity_observation' AND column_name = 'associated_beat_id') THEN
        ALTER TABLE public.activity_observation 
        ADD COLUMN associated_beat_id INTEGER;
    END IF;
END $$;

-- Add comments
COMMENT ON COLUMN public.activity_observation.associated_division IS 'Name of the division where the observation occurred';
COMMENT ON COLUMN public.activity_observation.associated_division_id IS 'ID of the division where the observation occurred';
COMMENT ON COLUMN public.activity_observation.associated_range IS 'Name of the range where the observation occurred';
COMMENT ON COLUMN public.activity_observation.associated_range_id IS 'ID of the range where the observation occurred';
COMMENT ON COLUMN public.activity_observation.associated_beat IS 'Name of the beat where the observation occurred';
COMMENT ON COLUMN public.activity_observation.associated_beat_id IS 'ID of the beat where the observation occurred'; 