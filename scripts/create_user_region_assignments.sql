-- Create user_region_assignments table
CREATE TABLE IF NOT EXISTS public.user_region_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
    range_id UUID NOT NULL REFERENCES public.ranges(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    UNIQUE(user_id, division_id, range_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_region_assignments_user_id ON public.user_region_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_region_assignments_division_id ON public.user_region_assignments(division_id);
CREATE INDEX IF NOT EXISTS idx_user_region_assignments_range_id ON public.user_region_assignments(range_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.user_region_assignments ENABLE ROW LEVEL SECURITY;

-- Policy for viewing assignments (any authenticated user can view)
CREATE POLICY "Allow authenticated users to view assignments"
    ON public.user_region_assignments
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy for inserting assignments (only admins can create)
CREATE POLICY "Allow admins to create assignments"
    ON public.user_region_assignments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Policy for updating assignments (only admins can update)
CREATE POLICY "Allow admins to update assignments"
    ON public.user_region_assignments
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Policy for deleting assignments (only admins can delete)
CREATE POLICY "Allow admins to delete assignments"
    ON public.user_region_assignments
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.user_region_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 