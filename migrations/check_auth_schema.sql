-- Check auth schema configuration
SELECT nspname, nspowner::regrole as owner
FROM pg_namespace
WHERE nspname = 'auth';

-- Check auth schema permissions
SELECT 
    n.nspname as schema_name,
    r.rolname as role_name,
    has_schema_privilege(r.oid, n.oid, 'USAGE') as has_usage,
    has_schema_privilege(r.oid, n.oid, 'CREATE') as has_create
FROM pg_namespace n
CROSS JOIN pg_roles r
WHERE n.nspname = 'auth'
AND r.rolname IN ('anon', 'authenticated', 'service_role');

-- Check auth.users table permissions
SELECT 
    r.rolname,
    has_table_privilege(r.oid, 'auth.users', 'SELECT') as has_select,
    has_table_privilege(r.oid, 'auth.users', 'INSERT') as has_insert,
    has_table_privilege(r.oid, 'auth.users', 'UPDATE') as has_update,
    has_table_privilege(r.oid, 'auth.users', 'DELETE') as has_delete
FROM pg_roles r
WHERE r.rolname IN ('anon', 'authenticated', 'service_role');

-- Check auth functions
SELECT 
    p.proname as function_name,
    pg_get_function_result(p.oid) as result_type,
    pg_get_function_arguments(p.oid) as arguments,
    r.rolname as owner
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_roles r ON p.proowner = r.oid
WHERE n.nspname = 'auth'
AND p.proname IN ('role', 'uid'); 