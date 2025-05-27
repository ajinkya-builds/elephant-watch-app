-- Create function to execute SQL as superuser
CREATE OR REPLACE FUNCTION execute_as_superuser(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION execute_as_superuser(text) TO service_role;

-- Create function to get policies
CREATE OR REPLACE FUNCTION get_table_policies(table_name text)
RETURNS TABLE (
  policyname text,
  tablename text,
  cmd text,
  permissive text,
  roles text[],
  qual text,
  with_check text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    polname::text as policyname,
    relname::text as tablename,
    cmd::text,
    permissive::text,
    roles::text[],
    pg_get_expr(qual, polrelid)::text,
    pg_get_expr(with_check, polrelid)::text
  FROM pg_policy
  JOIN pg_class ON pg_class.oid = pg_policy.polrelid
  WHERE relname = table_name;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION get_table_policies(text) TO service_role;

COMMENT ON FUNCTION execute_as_superuser(text) IS 'Executes SQL with superuser privileges';
COMMENT ON FUNCTION get_table_policies(text) IS 'Returns RLS policies for a given table'; 