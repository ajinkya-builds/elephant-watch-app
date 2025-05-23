-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create division_polygons table
CREATE TABLE IF NOT EXISTS public.division_polygons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    polygon GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id)
);

-- Create range_polygons table
CREATE TABLE IF NOT EXISTS public.range_polygons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    range_id UUID NOT NULL REFERENCES public.ranges(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    polygon GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id)
);

-- Create beat_polygons table
CREATE TABLE IF NOT EXISTS public.beat_polygons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beat_id UUID NOT NULL REFERENCES public.beats(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    polygon GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_division_polygons_division_id ON public.division_polygons(division_id);
CREATE INDEX IF NOT EXISTS idx_division_polygons_polygon ON public.division_polygons USING GIST(polygon);
CREATE INDEX IF NOT EXISTS idx_division_polygons_created_by ON public.division_polygons(created_by);
CREATE INDEX IF NOT EXISTS idx_division_polygons_updated_by ON public.division_polygons(updated_by);

CREATE INDEX IF NOT EXISTS idx_range_polygons_range_id ON public.range_polygons(range_id);
CREATE INDEX IF NOT EXISTS idx_range_polygons_polygon ON public.range_polygons USING GIST(polygon);
CREATE INDEX IF NOT EXISTS idx_range_polygons_created_by ON public.range_polygons(created_by);
CREATE INDEX IF NOT EXISTS idx_range_polygons_updated_by ON public.range_polygons(updated_by);

CREATE INDEX IF NOT EXISTS idx_beat_polygons_beat_id ON public.beat_polygons(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_polygons_polygon ON public.beat_polygons USING GIST(polygon);
CREATE INDEX IF NOT EXISTS idx_beat_polygons_created_by ON public.beat_polygons(created_by);
CREATE INDEX IF NOT EXISTS idx_beat_polygons_updated_by ON public.beat_polygons(updated_by);

-- Enable Row Level Security
ALTER TABLE public.division_polygons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.range_polygons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beat_polygons ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Users can view polygons"
ON public.division_polygons FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can view polygons"
ON public.range_polygons FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can view polygons"
ON public.beat_polygons FOR SELECT
TO authenticated
USING (true);

-- Add helpful comments
COMMENT ON TABLE public.division_polygons IS 'Stores polygon shapes for divisions with geographic coordinates';
COMMENT ON TABLE public.range_polygons IS 'Stores polygon shapes for ranges with geographic coordinates';
COMMENT ON TABLE public.beat_polygons IS 'Stores polygon shapes for beats with geographic coordinates'; 