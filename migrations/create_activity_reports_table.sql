-- Create activity_reports table with geographical information
CREATE TABLE public.activity_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    associated_division TEXT,
    associated_range TEXT,
    associated_beat TEXT,
    associated_division_id UUID,
    associated_range_id UUID,
    associated_beat_id UUID,
    activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
    observation_type TEXT NOT NULL,
    elephant_count INTEGER,
    unknown_elephants INTEGER,
    notes TEXT,
    created_by UUID REFERENCES public.users(auth_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180)
);

-- Create indexes for better query performance
CREATE INDEX idx_activity_reports_coordinates ON public.activity_reports USING gist (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);
CREATE INDEX idx_activity_reports_division ON public.activity_reports(associated_division);
CREATE INDEX idx_activity_reports_range ON public.activity_reports(associated_range);
CREATE INDEX idx_activity_reports_beat ON public.activity_reports(associated_beat);
CREATE INDEX idx_activity_reports_date ON public.activity_reports(activity_date);
CREATE INDEX idx_activity_reports_created_by ON public.activity_reports(created_by);

-- Enable Row Level Security
ALTER TABLE public.activity_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Users can view their own reports"
ON public.activity_reports FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own reports"
ON public.activity_reports FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own reports"
ON public.activity_reports FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins have full access"
ON public.activity_reports FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE auth_id = auth.uid()
        AND role = 'admin'
    )
);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_activity_reports_updated_at
    BEFORE UPDATE ON public.activity_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.activity_reports IS 'Stores activity reports with geographical information and associated administrative boundaries';
COMMENT ON COLUMN public.activity_reports.latitude IS 'Latitude coordinate of the activity location';
COMMENT ON COLUMN public.activity_reports.longitude IS 'Longitude coordinate of the activity location';
COMMENT ON COLUMN public.activity_reports.associated_division IS 'Name of the division where the activity occurred';
COMMENT ON COLUMN public.activity_reports.associated_range IS 'Name of the range where the activity occurred';
COMMENT ON COLUMN public.activity_reports.associated_beat IS 'Name of the beat where the activity occurred'; 