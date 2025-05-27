-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Recreate activity_reports table
CREATE TABLE public.activity_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
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
    associated_division TEXT,
    associated_division_id UUID,
    associated_range TEXT,
    associated_range_id UUID,
    associated_beat TEXT,
    associated_beat_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180)
);

-- Indexes for activity_reports
CREATE INDEX idx_activity_reports_coordinates ON public.activity_reports USING gist (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);
CREATE INDEX idx_activity_reports_user_id ON public.activity_reports(user_id);
CREATE INDEX idx_activity_reports_date ON public.activity_reports(activity_date);

-- Triggers for activity_reports
CREATE OR REPLACE FUNCTION update_activity_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activity_reports_updated_at_trigger
    BEFORE UPDATE ON public.activity_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_activity_reports_updated_at();

-- Comments for activity_reports
COMMENT ON TABLE public.activity_reports IS 'Stores reports of elephant activities with geographical information';
COMMENT ON COLUMN public.activity_reports.user_id IS 'References public.users.id, not auth.uid()';

-- Enable RLS and add policies for activity_reports
ALTER TABLE public.activity_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
ON public.activity_reports FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = activity_reports.user_id
        AND users.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can create their own reports"
ON public.activity_reports FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = activity_reports.user_id
        AND users.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own reports"
ON public.activity_reports FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = activity_reports.user_id
        AND users.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own reports"
ON public.activity_reports FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = activity_reports.user_id
        AND users.auth_id = auth.uid()
    )
);

-- Recreate activity_observation table
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
    associated_division TEXT,
    associated_division_id UUID,
    associated_range TEXT,
    associated_range_id UUID,
    associated_beat TEXT,
    associated_beat_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180)
);

-- Indexes for activity_observation
CREATE INDEX idx_activity_observation_coordinates ON public.activity_observation USING gist (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);
CREATE INDEX idx_activity_observation_report_id ON public.activity_observation(activity_report_id);
CREATE INDEX idx_activity_observation_user_id ON public.activity_observation(user_id);
CREATE INDEX idx_activity_observation_date ON public.activity_observation(activity_date);

-- Triggers for activity_observation
CREATE OR REPLACE FUNCTION update_activity_observation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activity_observation_updated_at_trigger
    BEFORE UPDATE ON public.activity_observation
    FOR EACH ROW
    EXECUTE FUNCTION update_activity_observation_updated_at();

-- Comments for activity_observation
COMMENT ON TABLE public.activity_observation IS 'Stores detailed observations of elephant activities with geographical information';
COMMENT ON COLUMN public.activity_observation.user_id IS 'References public.users.id, not auth.uid()';

-- Enable RLS and add policies for activity_observation
ALTER TABLE public.activity_observation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own observations"
ON public.activity_observation FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = activity_observation.user_id
        AND users.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can create their own observations"
ON public.activity_observation FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = activity_observation.user_id
        AND users.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own observations"
ON public.activity_observation FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = activity_observation.user_id
        AND users.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own observations"
ON public.activity_observation FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = activity_observation.user_id
        AND users.auth_id = auth.uid()
    )
); 