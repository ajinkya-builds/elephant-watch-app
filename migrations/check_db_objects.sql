-- Check for triggers on users table
SELECT 
    trigger_name,
    event_manipulation,
    event_object_schema,
    event_object_table,
    action_statement,
    action_orientation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND event_object_schema = 'public';

-- Check for functions used in policies
SELECT 
    p.polname as policy_name,
    p.polcmd as operation,
    p.polroles as roles,
    pg_get_expr(p.polqual, p.polrelid) as using_expression,
    pg_get_expr(p.polwithcheck, p.polrelid) as with_check_expression
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
WHERE c.relname = 'users'
AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Check for functions that might be causing recursion
SELECT 
    p.proname as function_name,
    n.nspname as schema_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN (
    SELECT regexp_matches(pg_get_expr(polqual, polrelid), '[a-zA-Z_]+\([^)]*\)')
    FROM pg_policy
    WHERE polrelid = 'public.users'::regclass
); 