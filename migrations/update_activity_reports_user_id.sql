-- Drop all policies on activity_reports
do $$
declare r record;
begin
  for r in (select policyname from pg_policies where schemaname = 'public' and tablename = 'activity_reports')
  loop
    execute format('drop policy if exists "%s" on public.activity_reports;', r.policyname);
  end loop;
end$$;

-- Drop all policies on activity_observation
do $$
declare r record;
begin
  for r in (select policyname from pg_policies where schemaname = 'public' and tablename = 'activity_observation')
  loop
    execute format('drop policy if exists "%s" on public.activity_observation;', r.policyname);
  end loop;
end$$;

-- First, drop the foreign key constraint if it exists
ALTER TABLE public.activity_reports 
DROP CONSTRAINT IF EXISTS activity_reports_user_id_fkey;

-- Update the user_id column to reference public.users
ALTER TABLE public.activity_reports
ALTER COLUMN user_id TYPE UUID USING user_id::UUID,
ADD CONSTRAINT activity_reports_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id);

-- Add helpful comments
COMMENT ON COLUMN public.activity_reports.user_id IS 'References public.users.id, not auth.uid()'; 