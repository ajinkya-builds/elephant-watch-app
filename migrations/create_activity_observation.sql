-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create activity_observation table
CREATE TABLE public.activity_observation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_report_id UUID NOT NULL REFERENCES public.activity_reports(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    activity_date DATE NOT NULL,
    activity_time TIME NOT NULL,
    observation_type TEXT NOT NULL CHECK (observation_type IN ('direct', 'indirect', 'loss')),
    total_elephants INTEGER,
    male_elephants INTEGER,
    female_elephants INTEGER,
    unknown_elephants INTEGER,
    calves INTEGER,
    indirect_sighting_type TEXT CHECK (indirect_sighting_type IN ('Pugmark', 'Dung', 'Broken Branches', 'Sound', 'Eyewitness')),
    loss_type TEXT CHECK (loss_type IN ('No loss', 'crop', 'livestock', 'property', 'fencing', 'solar panels', 'FD establishment', 'Other')),
    compass_bearing INTEGER CHECK (compass_bearing >= 0 AND compass_bearing <= 360),
    photo_url TEXT,
    user_id UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180)
);

-- Create indexes for better query performance
CREATE INDEX idx_activity_observation_coordinates ON public.activity_observation USING gist (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);
CREATE INDEX idx_activity_observation_report_id ON public.activity_observation(activity_report_id);
CREATE INDEX idx_activity_observation_user_id ON public.activity_observation(user_id);
CREATE INDEX idx_activity_observation_date ON public.activity_observation(activity_date);

-- Enable Row Level Security
ALTER TABLE public.activity_observation ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Users can view their own observations"
ON public.activity_observation FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own observations"
ON public.activity_observation FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own observations"
ON public.activity_observation FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_activity_observation_updated_at
    BEFORE UPDATE ON public.activity_observation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.activity_observation IS 'Stores detailed observations of elephant activities with geographical information';
COMMENT ON COLUMN public.activity_observation.id IS 'Unique identifier for the observation';
COMMENT ON COLUMN public.activity_observation.activity_report_id IS 'Reference to the parent activity report';
COMMENT ON COLUMN public.activity_observation.latitude IS 'Latitude coordinate of the observation';
COMMENT ON COLUMN public.activity_observation.longitude IS 'Longitude coordinate of the observation';
COMMENT ON COLUMN public.activity_observation.activity_date IS 'Date of the observation';
COMMENT ON COLUMN public.activity_observation.activity_time IS 'Time of the observation';
COMMENT ON COLUMN public.activity_observation.observation_type IS 'Type of observation (direct, indirect, or loss)';
COMMENT ON COLUMN public.activity_observation.total_elephants IS 'Total number of elephants observed';
COMMENT ON COLUMN public.activity_observation.male_elephants IS 'Number of male elephants observed';
COMMENT ON COLUMN public.activity_observation.female_elephants IS 'Number of female elephants observed';
COMMENT ON COLUMN public.activity_observation.unknown_elephants IS 'Number of elephants of unknown gender';
COMMENT ON COLUMN public.activity_observation.calves IS 'Number of elephant calves observed';
COMMENT ON COLUMN public.activity_observation.indirect_sighting_type IS 'Type of indirect sighting evidence';
COMMENT ON COLUMN public.activity_observation.loss_type IS 'Type of loss or damage reported';
COMMENT ON COLUMN public.activity_observation.compass_bearing IS 'Compass bearing of the observation';
COMMENT ON COLUMN public.activity_observation.photo_url IS 'URL to any associated photos';
COMMENT ON COLUMN public.activity_observation.user_id IS 'ID of the user who created the observation';
COMMENT ON COLUMN public.activity_observation.created_at IS 'Timestamp when the observation was created';
COMMENT ON COLUMN public.activity_observation.updated_at IS 'Timestamp when the observation was last updated';

-- Create function to identify geographical boundaries
CREATE OR REPLACE FUNCTION public.identify_geographical_boundaries(
    p_latitude DECIMAL,
    p_longitude DECIMAL
)
RETURNS TABLE (
    division_name TEXT,
    division_id UUID,
    range_name TEXT,
    range_id UUID,
    beat_name TEXT,
    beat_id UUID
) AS $$
BEGIN
    RETURN QUERY
    WITH point AS (
        SELECT ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326) AS geom
    )
    SELECT 
        d.name AS division_name,
        d.id AS division_id,
        r.name AS range_name,
        r.id AS range_id,
        b.name AS beat_name,
        b.id AS beat_id
    FROM point p
    LEFT JOIN public.division_polygons dp ON ST_Contains(dp.polygon, p.geom)
    LEFT JOIN public.divisions d ON dp.new_division_id = d.id
    LEFT JOIN public.range_polygons rp ON ST_Contains(rp.polygon, p.geom)
    LEFT JOIN public.ranges r ON rp.range_id = r.id AND r.division_id = d.id
    LEFT JOIN public.beat_polygons bp ON ST_Contains(bp.geometry, p.geom)
    LEFT JOIN public.beats b ON bp.associated_beat_id = b.id AND b.range_id = r.id
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to automatically set geographical boundaries
CREATE OR REPLACE FUNCTION public.set_observation_boundaries()
RETURNS TRIGGER AS $$
DECLARE
    v_boundaries RECORD;
BEGIN
    -- Get the geographical boundaries for the coordinates
    SELECT * INTO v_boundaries
    FROM public.identify_geographical_boundaries(NEW.latitude, NEW.longitude);

    -- Set the values in the new record
    NEW.associated_division := v_boundaries.division_name;
    NEW.associated_division_id := v_boundaries.division_id;
    NEW.associated_range := v_boundaries.range_name;
    NEW.associated_range_id := v_boundaries.range_id;
    NEW.associated_beat := v_boundaries.beat_name;
    NEW.associated_beat_id := v_boundaries.beat_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set geographical boundaries
CREATE TRIGGER set_observation_boundaries_trigger
    BEFORE INSERT OR UPDATE ON public.activity_observation
    FOR EACH ROW
    EXECUTE FUNCTION public.set_observation_boundaries();

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_observation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_observation_updated_at_trigger
    BEFORE UPDATE ON public.activity_observation
    FOR EACH ROW
    EXECUTE FUNCTION public.update_observation_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.activity_observation IS 'Stores activity observations with geographical information and associated administrative boundaries';
COMMENT ON COLUMN public.activity_observation.latitude IS 'Latitude coordinate of the observation location';
COMMENT ON COLUMN public.activity_observation.longitude IS 'Longitude coordinate of the observation location';
COMMENT ON COLUMN public.activity_observation.associated_division IS 'Name of the division where the observation occurred';
COMMENT ON COLUMN public.activity_observation.associated_range IS 'Name of the range where the observation occurred';
COMMENT ON COLUMN public.activity_observation.associated_beat IS 'Name of the beat where the observation occurred'; 