-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create new divisions table with UUID primary key
CREATE TABLE public.divisions_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    division_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100),
    district VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_divisions_new_division_id ON public.divisions_new(division_id);
CREATE INDEX idx_divisions_new_state ON public.divisions_new(state);
CREATE INDEX idx_divisions_new_district ON public.divisions_new(district);

-- Enable Row Level Security
ALTER TABLE public.divisions_new ENABLE ROW LEVEL SECURITY;

-- Create policy for access control
CREATE POLICY "Admins have full access to divisions_new"
ON public.divisions_new FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE auth_id = auth.uid()
        AND role = 'admin'
    )
);

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_divisions_new_updated_at
    BEFORE UPDATE ON public.divisions_new
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.divisions_new IS 'New divisions table with UUID primary key';
COMMENT ON COLUMN public.divisions_new.id IS 'UUID primary key';
COMMENT ON COLUMN public.divisions_new.division_id IS 'Unique identifier for the division';
COMMENT ON COLUMN public.divisions_new.name IS 'Name of the division';
COMMENT ON COLUMN public.divisions_new.state IS 'State where the division is located';
COMMENT ON COLUMN public.divisions_new.district IS 'District where the division is located'; 