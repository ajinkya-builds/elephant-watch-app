-- Create function to get reports within a radius
CREATE OR REPLACE FUNCTION public.get_reports_within_radius(
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_radius_km DECIMAL
)
RETURNS TABLE (
    id UUID,
    latitude DECIMAL,
    longitude DECIMAL,
    associated_division TEXT,
    associated_range TEXT,
    associated_beat TEXT,
    associated_division_id UUID,
    associated_range_id UUID,
    associated_beat_id UUID,
    activity_date TIMESTAMP WITH TIME ZONE,
    observation_type TEXT,
    elephant_count INTEGER,
    unknown_elephants INTEGER,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH point AS (
        SELECT ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326) AS geom
    )
    SELECT 
        ar.*,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(ar.longitude, ar.latitude), 4326)::geography,
            p.geom::geography
        ) / 1000 AS distance_km
    FROM public.activity_reports ar, point p
    WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(ar.longitude, ar.latitude), 4326)::geography,
        p.geom::geography,
        p_radius_km * 1000
    )
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comment
COMMENT ON FUNCTION public.get_reports_within_radius IS 'Returns activity reports within a specified radius (in kilometers) from a given point'; 