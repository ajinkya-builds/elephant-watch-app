-- Function to get public tables
create or replace function get_public_tables()
returns table (table_name text)
language sql
security definer
set search_path = public
as $$
  select table_name::text
  from information_schema.tables 
  where table_schema = 'public'
  and table_type = 'BASE TABLE'
  order by table_name;
$$;

-- Function to get public views
create or replace function get_public_views()
returns table (view_name text)
language sql
security definer
set search_path = public
as $$
  select table_name::text
  from information_schema.views 
  where table_schema = 'public'
  order by table_name;
$$;

-- Grant execute permission to authenticated users
grant execute on function get_public_tables to authenticated;
grant execute on function get_public_views to authenticated; 