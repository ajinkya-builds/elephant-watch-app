-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create divisions table
CREATE TABLE public.divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_division_name UNIQUE (name)
);

-- Create ranges table
CREATE TABLE public.ranges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    division_id UUID REFERENCES public.divisions(id),
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_range_name_per_division UNIQUE (name, division_id)
);

-- Create beats table
CREATE TABLE public.beats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    range_id UUID REFERENCES public.ranges(id),
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_beat_name_per_range UNIQUE (name, range_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_divisions_geom ON public.divisions USING gist(geom);
CREATE INDEX idx_ranges_geom ON public.ranges USING gist(geom);
CREATE INDEX idx_beats_geom ON public.beats USING gist(geom);
CREATE INDEX idx_ranges_division ON public.ranges(division_id);
CREATE INDEX idx_beats_range ON public.beats(range_id);

-- Enable Row Level Security
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beats ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Admins have full access to divisions"
ON public.divisions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE auth_id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "Admins have full access to ranges"
ON public.ranges FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE auth_id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "Admins have full access to beats"
ON public.beats FOR ALL
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

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_divisions_updated_at
    BEFORE UPDATE ON public.divisions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ranges_updated_at
    BEFORE UPDATE ON public.ranges
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_beats_updated_at
    BEFORE UPDATE ON public.beats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.divisions IS 'Stores division boundaries with their geographical data';
COMMENT ON TABLE public.ranges IS 'Stores range boundaries with their geographical data and associated division';
COMMENT ON TABLE public.beats IS 'Stores beat boundaries with their geographical data and associated range'; 