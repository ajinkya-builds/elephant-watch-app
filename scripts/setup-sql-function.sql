-- Create the exec_sql function with appropriate permissions
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE query;
    RETURN json_build_object('status', 'success');
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'status', 'error',
        'message', SQLERRM,
        'detail', SQLSTATE
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql TO service_role; 