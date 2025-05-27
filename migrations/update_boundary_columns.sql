-- Update boundary columns in activity_observation table to use UUIDs
ALTER TABLE public.activity_observation
    DROP COLUMN IF EXISTS associated_division_id,
    DROP COLUMN IF EXISTS associated_range_id,
    DROP COLUMN IF EXISTS associated_beat_id;
 
ALTER TABLE public.activity_observation
    ADD COLUMN associated_division_id UUID,
    ADD COLUMN associated_range_id UUID,
    ADD COLUMN associated_beat_id UUID; 