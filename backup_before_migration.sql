--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.13 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;


--
-- Name: EXTENSION pgjwt; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgjwt IS 'JSON Web Token API for Postgresql';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: postgres
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO postgres;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: postgres
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: postgres
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO postgres;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: postgres
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: can_create_user_with_role(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.can_create_user_with_role(creator_role text, new_user_role text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Admin can create any role
  IF creator_role = 'admin' THEN
    RETURN true;
  -- Manager can only create data_collector
  ELSIF creator_role = 'manager' AND new_user_role = 'data_collector' THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;


ALTER FUNCTION public.can_create_user_with_role(creator_role text, new_user_role text) OWNER TO postgres;

--
-- Name: check_user_creation_permissions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_user_creation_permissions() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  creator_role text;
BEGIN
  -- Allow service role to bypass all checks
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Get the role of the creating user
  SELECT role INTO creator_role
  FROM users
  WHERE id = auth.uid();

  -- Check if the creator has permission to create a user with the specified role
  IF NOT can_create_user_with_role(creator_role, NEW.role) THEN
    RAISE EXCEPTION 'User with role % cannot create users with role %', creator_role, NEW.role;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_user_creation_permissions() OWNER TO postgres;

--
-- Name: get_browser_info(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_browser_info() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN json_build_object(
    'user_agent', current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$;


ALTER FUNCTION public.get_browser_info() OWNER TO postgres;

--
-- Name: get_ip_info(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_ip_info() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN json_build_object(
    'ip', current_setting('request.headers', true)::json->>'x-forwarded-for'
  );
END;
$$;


ALTER FUNCTION public.get_ip_info() OWNER TO postgres;

--
-- Name: get_service_status(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_service_status() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN true;
END;
$$;


ALTER FUNCTION public.get_service_status() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      PERFORM pg_notify(
          'realtime:system',
          jsonb_build_object(
              'error', SQLERRM,
              'function', 'realtime.send',
              'event', event,
              'topic', topic,
              'private', private
          )::text
      );
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_email character varying(255) NOT NULL,
    action character varying(255) NOT NULL,
    "time" timestamp without time zone NOT NULL,
    ip character varying(64),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activity_logs_id_seq OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: activity_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_reports (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    activity_date date NOT NULL,
    activity_time time without time zone NOT NULL,
    latitude text NOT NULL,
    longitude text NOT NULL,
    observation_type text,
    total_elephants integer,
    male_elephants integer,
    female_elephants integer,
    unknown_elephants integer,
    calves integer,
    indirect_sighting_type text,
    loss_type text,
    compass_bearing numeric,
    photo_url text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT activity_reports_indirect_sighting_type_check CHECK ((indirect_sighting_type = ANY (ARRAY['Pugmark'::text, 'Dung'::text, 'Broken Branches'::text, 'Sound'::text, 'Eyewitness'::text]))),
    CONSTRAINT activity_reports_loss_type_check CHECK ((loss_type = ANY (ARRAY['No loss'::text, 'crop'::text, 'livestock'::text, 'property'::text, 'fencing'::text, 'solar panels'::text, 'FD establishment'::text, 'Other'::text]))),
    CONSTRAINT activity_reports_observation_type_check CHECK ((observation_type = ANY (ARRAY['direct'::text, 'indirect'::text, 'loss'::text]))),
    CONSTRAINT valid_elephant_counts CHECK (((observation_type <> 'direct'::text) OR ((observation_type = 'direct'::text) AND (total_elephants = (((COALESCE(male_elephants, 0) + COALESCE(female_elephants, 0)) + COALESCE(unknown_elephants, 0)) + COALESCE(calves, 0)))))),
    CONSTRAINT valid_observation_type CHECK ((((observation_type = 'direct'::text) AND (total_elephants IS NOT NULL)) OR ((observation_type = 'indirect'::text) AND (indirect_sighting_type IS NOT NULL)) OR ((observation_type = 'loss'::text) AND (loss_type IS NOT NULL)) OR (observation_type IS NULL)))
);


ALTER TABLE public.activity_reports OWNER TO postgres;

--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_settings (
    id integer NOT NULL,
    app_name character varying(255) NOT NULL,
    default_timezone character varying(64) NOT NULL,
    default_language character varying(16) NOT NULL,
    maintenance_mode boolean DEFAULT false NOT NULL,
    system_version character varying(32) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.app_settings OWNER TO postgres;

--
-- Name: app_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.app_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.app_settings_id_seq OWNER TO postgres;

--
-- Name: app_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.app_settings_id_seq OWNED BY public.app_settings.id;


--
-- Name: auth_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_settings (
    id integer NOT NULL,
    password_policy character varying(255) NOT NULL,
    enable_2fa boolean DEFAULT false NOT NULL,
    session_timeout integer DEFAULT 30 NOT NULL,
    login_attempt_limit integer DEFAULT 5 NOT NULL,
    ip_whitelist text,
    ip_blacklist text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.auth_settings OWNER TO postgres;

--
-- Name: auth_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auth_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_settings_id_seq OWNER TO postgres;

--
-- Name: auth_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auth_settings_id_seq OWNED BY public.auth_settings.id;


--
-- Name: backup_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.backup_settings (
    id integer NOT NULL,
    backup_schedule character varying(128) NOT NULL,
    backup_location character varying(255) NOT NULL,
    data_retention character varying(128) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.backup_settings OWNER TO postgres;

--
-- Name: backup_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.backup_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.backup_settings_id_seq OWNER TO postgres;

--
-- Name: backup_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.backup_settings_id_seq OWNED BY public.backup_settings.id;


--
-- Name: coordinates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coordinates (
    uid bigint NOT NULL,
    "DID" bigint,
    "Division_Name" text,
    "SID" bigint,
    "State" text,
    division_lat double precision,
    division_lon double precision,
    "Division_range" text,
    "RID" bigint,
    "Range_Name" text,
    "State_range" text,
    range_lat double precision,
    range_lon double precision,
    "BID" bigint,
    "Beat_Name" text,
    "Beat_Ar" double precision,
    "Division_beat" text,
    "Range" text,
    "State_beat" text,
    beat_lat double precision,
    beat_lon double precision
);


ALTER TABLE public.coordinates OWNER TO postgres;

--
-- Name: email_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_settings (
    id integer NOT NULL,
    smtp_server character varying(255) NOT NULL,
    sender_email character varying(255) NOT NULL,
    notify_on_register boolean DEFAULT true NOT NULL,
    email_template text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_settings OWNER TO postgres;

--
-- Name: email_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.email_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.email_settings_id_seq OWNER TO postgres;

--
-- Name: email_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.email_settings_id_seq OWNED BY public.email_settings.id;


--
-- Name: error_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.error_logs (
    id integer NOT NULL,
    level character varying(32) NOT NULL,
    message text NOT NULL,
    "time" timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.error_logs OWNER TO postgres;

--
-- Name: error_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.error_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.error_logs_id_seq OWNER TO postgres;

--
-- Name: error_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.error_logs_id_seq OWNED BY public.error_logs.id;


--
-- Name: integration_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.integration_settings (
    id integer NOT NULL,
    api_keys text,
    webhook_url character varying(255),
    connected_services character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.integration_settings OWNER TO postgres;

--
-- Name: integration_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.integration_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.integration_settings_id_seq OWNER TO postgres;

--
-- Name: integration_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.integration_settings_id_seq OWNED BY public.integration_settings.id;


--
-- Name: login_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_logs (
    id integer NOT NULL,
    status character varying(32) NOT NULL,
    "time" timestamp without time zone NOT NULL,
    ip character varying(64),
    browser character varying(512),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_identifier text NOT NULL,
    login_type text NOT NULL,
    email text,
    phone text,
    CONSTRAINT login_logs_login_type_check CHECK ((login_type = ANY (ARRAY['email'::text, 'phone'::text]))),
    CONSTRAINT login_logs_status_check CHECK (((status)::text = ANY ((ARRAY['success'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.login_logs OWNER TO postgres;

--
-- Name: login_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.login_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.login_logs_id_seq OWNER TO postgres;

--
-- Name: login_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.login_logs_id_seq OWNED BY public.login_logs.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    role_name character varying NOT NULL,
    role_description character varying NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: TABLE roles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.roles IS 'The role assigned for each user';


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.roles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: shapefiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shapefiles (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    geo_data jsonb NOT NULL,
    feature_count integer NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now(),
    uploaded_by uuid
);


ALTER TABLE public.shapefiles OWNER TO postgres;

--
-- Name: system_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_logs (
    id integer NOT NULL,
    job character varying(64) NOT NULL,
    status character varying(32) NOT NULL,
    "time" timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_logs OWNER TO postgres;

--
-- Name: system_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.system_logs_id_seq OWNER TO postgres;

--
-- Name: system_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_logs_id_seq OWNED BY public.system_logs.id;


--
-- Name: user_migration_map; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_migration_map (
    old_id uuid NOT NULL,
    new_auth_id uuid,
    email_or_phone text,
    email text,
    phone text
);


ALTER TABLE public.user_migration_map OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email_or_phone text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    role text NOT NULL,
    status text NOT NULL,
    updated_at timestamp with time zone,
    created_by uuid,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'manager'::text, 'data_collector'::text]))),
    CONSTRAINT users_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: COLUMN users.role; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.role IS 'User roles: admin (full access), manager (user management + data collection), data_collector (data collection only)';


--
-- Name: COLUMN users.created_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.created_by IS 'ID of the user who created this user';


--
-- Name: v_activity_heatmap; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_activity_heatmap AS
 SELECT activity_reports.latitude,
    activity_reports.longitude,
    count(*) AS activity_count
   FROM public.activity_reports
  GROUP BY activity_reports.latitude, activity_reports.longitude;


ALTER TABLE public.v_activity_heatmap OWNER TO postgres;

--
-- Name: v_calve_count; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_calve_count AS
 SELECT activity_reports.activity_date,
    sum(activity_reports.calves) AS total_calves
   FROM public.activity_reports
  WHERE (activity_reports.observation_type = 'direct'::text)
  GROUP BY activity_reports.activity_date
  ORDER BY activity_reports.activity_date DESC;


ALTER TABLE public.v_calve_count OWNER TO postgres;

--
-- Name: v_division_statistics; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_division_statistics AS
 SELECT activity_reports.observation_type,
    count(*) AS count,
    date_trunc('month'::text, (activity_reports.activity_date)::timestamp with time zone) AS month
   FROM public.activity_reports
  GROUP BY activity_reports.observation_type, (date_trunc('month'::text, (activity_reports.activity_date)::timestamp with time zone))
  ORDER BY (date_trunc('month'::text, (activity_reports.activity_date)::timestamp with time zone)) DESC;


ALTER TABLE public.v_division_statistics OWNER TO postgres;

--
-- Name: v_female_elephant_counts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_female_elephant_counts AS
 SELECT activity_reports.activity_date,
    sum(activity_reports.female_elephants) AS total_females
   FROM public.activity_reports
  WHERE (activity_reports.observation_type = 'direct'::text)
  GROUP BY activity_reports.activity_date
  ORDER BY activity_reports.activity_date DESC;


ALTER TABLE public.v_female_elephant_counts OWNER TO postgres;

--
-- Name: v_male_elephant_counts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_male_elephant_counts AS
 SELECT activity_reports.activity_date,
    sum(activity_reports.male_elephants) AS total_males
   FROM public.activity_reports
  WHERE (activity_reports.observation_type = 'direct'::text)
  GROUP BY activity_reports.activity_date
  ORDER BY activity_reports.activity_date DESC;


ALTER TABLE public.v_male_elephant_counts OWNER TO postgres;

--
-- Name: v_recent_observations; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_recent_observations AS
 SELECT activity_reports.id,
    activity_reports.activity_date,
    activity_reports.activity_time,
    activity_reports.observation_type,
    activity_reports.total_elephants,
    activity_reports.indirect_sighting_type,
    activity_reports.loss_type,
    activity_reports.created_at
   FROM public.activity_reports
  ORDER BY activity_reports.created_at DESC
 LIMIT 10;


ALTER TABLE public.v_recent_observations OWNER TO postgres;

--
-- Name: v_total_elephants; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_total_elephants AS
 SELECT activity_reports.activity_date,
    sum(activity_reports.total_elephants) AS total_count
   FROM public.activity_reports
  WHERE (activity_reports.observation_type = 'direct'::text)
  GROUP BY activity_reports.activity_date
  ORDER BY activity_reports.activity_date DESC;


ALTER TABLE public.v_total_elephants OWNER TO postgres;

--
-- Name: v_total_loss; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_total_loss AS
 SELECT activity_reports.loss_type,
    count(*) AS count
   FROM public.activity_reports
  WHERE (activity_reports.observation_type = 'loss'::text)
  GROUP BY activity_reports.loss_type;


ALTER TABLE public.v_total_loss OWNER TO postgres;

--
-- Name: v_total_observations; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_total_observations AS
 SELECT activity_reports.observation_type,
    count(*) AS count
   FROM public.activity_reports
  GROUP BY activity_reports.observation_type;


ALTER TABLE public.v_total_observations OWNER TO postgres;

--
-- Name: v_unknown_elephants; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_unknown_elephants AS
 SELECT activity_reports.activity_date,
    sum(activity_reports.unknown_elephants) AS total_unknown
   FROM public.activity_reports
  WHERE (activity_reports.observation_type = 'direct'::text)
  GROUP BY activity_reports.activity_date
  ORDER BY activity_reports.activity_date DESC;


ALTER TABLE public.v_unknown_elephants OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: messages_2025_05_17; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_05_17 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_05_17 OWNER TO supabase_admin;

--
-- Name: messages_2025_05_18; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_05_18 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_05_18 OWNER TO supabase_admin;

--
-- Name: messages_2025_05_19; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_05_19 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_05_19 OWNER TO supabase_admin;

--
-- Name: messages_2025_05_20; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_05_20 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_05_20 OWNER TO supabase_admin;

--
-- Name: messages_2025_05_21; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_05_21 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_05_21 OWNER TO supabase_admin;

--
-- Name: messages_2025_05_22; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_05_22 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_05_22 OWNER TO supabase_admin;

--
-- Name: messages_2025_05_23; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_05_23 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_05_23 OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: messages_2025_05_17; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_17 FOR VALUES FROM ('2025-05-17 00:00:00') TO ('2025-05-18 00:00:00');


--
-- Name: messages_2025_05_18; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_18 FOR VALUES FROM ('2025-05-18 00:00:00') TO ('2025-05-19 00:00:00');


--
-- Name: messages_2025_05_19; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_19 FOR VALUES FROM ('2025-05-19 00:00:00') TO ('2025-05-20 00:00:00');


--
-- Name: messages_2025_05_20; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_20 FOR VALUES FROM ('2025-05-20 00:00:00') TO ('2025-05-21 00:00:00');


--
-- Name: messages_2025_05_21; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_21 FOR VALUES FROM ('2025-05-21 00:00:00') TO ('2025-05-22 00:00:00');


--
-- Name: messages_2025_05_22; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_22 FOR VALUES FROM ('2025-05-22 00:00:00') TO ('2025-05-23 00:00:00');


--
-- Name: messages_2025_05_23; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_23 FOR VALUES FROM ('2025-05-23 00:00:00') TO ('2025-05-24 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: app_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings ALTER COLUMN id SET DEFAULT nextval('public.app_settings_id_seq'::regclass);


--
-- Name: auth_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_settings ALTER COLUMN id SET DEFAULT nextval('public.auth_settings_id_seq'::regclass);


--
-- Name: backup_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup_settings ALTER COLUMN id SET DEFAULT nextval('public.backup_settings_id_seq'::regclass);


--
-- Name: email_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_settings ALTER COLUMN id SET DEFAULT nextval('public.email_settings_id_seq'::regclass);


--
-- Name: error_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.error_logs ALTER COLUMN id SET DEFAULT nextval('public.error_logs_id_seq'::regclass);


--
-- Name: integration_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_settings ALTER COLUMN id SET DEFAULT nextval('public.integration_settings_id_seq'::regclass);


--
-- Name: login_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_logs ALTER COLUMN id SET DEFAULT nextval('public.login_logs_id_seq'::regclass);


--
-- Name: system_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs ALTER COLUMN id SET DEFAULT nextval('public.system_logs_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	909ed798-eb53-49c5-8864-3a893b534631	{"action":"user_confirmation_requested","actor_id":"588ec7a3-7c1d-40b1-99ce-b93cb3673a3f","actor_username":"testuser@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-12 17:16:45.764656+00	
00000000-0000-0000-0000-000000000000	92b829d4-fc4f-4099-aee5-01839299d495	{"action":"user_confirmation_requested","actor_id":"39a10e89-8ab5-44a6-90c9-15dd0467aa48","actor_username":"testuser123@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-12 17:19:10.217938+00	
00000000-0000-0000-0000-000000000000	afe5dfcd-359e-4543-bcfb-3caf636cb584	{"action":"user_confirmation_requested","actor_id":"39a10e89-8ab5-44a6-90c9-15dd0467aa48","actor_username":"testuser123@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-12 17:20:53.495778+00	
00000000-0000-0000-0000-000000000000	cbc973de-fa60-4c6e-a8a1-961e182d8398	{"action":"user_confirmation_requested","actor_id":"588ec7a3-7c1d-40b1-99ce-b93cb3673a3f","actor_username":"testuser@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-12 18:05:06.567394+00	
00000000-0000-0000-0000-000000000000	9c020598-2978-4b2b-add5-1f72a176d37b	{"action":"user_confirmation_requested","actor_id":"588ec7a3-7c1d-40b1-99ce-b93cb3673a3f","actor_username":"testuser@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-12 18:05:08.395572+00	
00000000-0000-0000-0000-000000000000	fdb97e58-8ee5-4ec1-b6f8-ac902a0600e4	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"testuser@gmail.com","user_id":"588ec7a3-7c1d-40b1-99ce-b93cb3673a3f","user_phone":""}}	2025-05-12 18:20:09.825183+00	
00000000-0000-0000-0000-000000000000	b3bb5f0d-c221-4067-8ce7-2ab5be1b7f9b	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"testuser123@gmail.com","user_id":"39a10e89-8ab5-44a6-90c9-15dd0467aa48","user_phone":""}}	2025-05-12 18:20:09.8251+00	
00000000-0000-0000-0000-000000000000	202b835c-8db8-4eff-b1b1-6dece7994195	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"yashtagai23@gmail.com","user_id":"5ea6aa51-b259-4d9f-aa24-d7d694a0f51d","user_phone":""}}	2025-05-19 06:42:05.289393+00	
00000000-0000-0000-0000-000000000000	3d150bd1-7192-46ae-8ac8-31dacd997607	{"action":"login","actor_id":"5ea6aa51-b259-4d9f-aa24-d7d694a0f51d","actor_username":"yashtagai23@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-19 06:42:05.476635+00	
00000000-0000-0000-0000-000000000000	bc55c64e-c3fc-43a9-b808-12931dc519dd	{"action":"logout","actor_id":"5ea6aa51-b259-4d9f-aa24-d7d694a0f51d","actor_username":"yashtagai23@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-19 06:42:15.497137+00	
00000000-0000-0000-0000-000000000000	a54933d9-71ef-4f51-b781-b864d8fdb619	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"9756326656@elephant.watch","user_id":"dea78cbb-db92-4ff0-b67f-c1e387191de6","user_phone":""}}	2025-05-19 06:42:25.333857+00	
00000000-0000-0000-0000-000000000000	145b0899-e792-4fe2-ac67-16ce5e6867a2	{"action":"login","actor_id":"dea78cbb-db92-4ff0-b67f-c1e387191de6","actor_username":"9756326656@elephant.watch","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-19 06:42:25.499921+00	
00000000-0000-0000-0000-000000000000	21b914a7-111a-4123-a1b8-aaf5a130e790	{"action":"token_refreshed","actor_id":"dea78cbb-db92-4ff0-b67f-c1e387191de6","actor_username":"9756326656@elephant.watch","actor_via_sso":false,"log_type":"token"}	2025-05-19 07:40:33.631937+00	
00000000-0000-0000-0000-000000000000	2549640a-f9c2-4195-b483-178bad4afcc3	{"action":"token_revoked","actor_id":"dea78cbb-db92-4ff0-b67f-c1e387191de6","actor_username":"9756326656@elephant.watch","actor_via_sso":false,"log_type":"token"}	2025-05-19 07:40:33.634695+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
5ea6aa51-b259-4d9f-aa24-d7d694a0f51d	5ea6aa51-b259-4d9f-aa24-d7d694a0f51d	{"sub": "5ea6aa51-b259-4d9f-aa24-d7d694a0f51d", "email": "yashtagai23@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-05-19 06:42:05.288332+00	2025-05-19 06:42:05.288401+00	2025-05-19 06:42:05.288401+00	465f3318-0a0b-45e2-b443-1d2a9210c57d
dea78cbb-db92-4ff0-b67f-c1e387191de6	dea78cbb-db92-4ff0-b67f-c1e387191de6	{"sub": "dea78cbb-db92-4ff0-b67f-c1e387191de6", "email": "9756326656@elephant.watch", "email_verified": false, "phone_verified": false}	email	2025-05-19 06:42:25.332964+00	2025-05-19 06:42:25.33302+00	2025-05-19 06:42:25.33302+00	c2f6cff9-ad33-4258-8eae-4fcaf6b233fc
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
fe003d34-85fe-4936-b30b-5c294de199f3	2025-05-19 06:42:25.504227+00	2025-05-19 06:42:25.504227+00	password	1c703cd4-7544-4eba-9cb5-3d72d4c1209b
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	2	cdsorxpo7n3e	dea78cbb-db92-4ff0-b67f-c1e387191de6	t	2025-05-19 06:42:25.502859+00	2025-05-19 07:40:33.635276+00	\N	fe003d34-85fe-4936-b30b-5c294de199f3
00000000-0000-0000-0000-000000000000	3	ibn5pmox7lkf	dea78cbb-db92-4ff0-b67f-c1e387191de6	f	2025-05-19 07:40:33.641514+00	2025-05-19 07:40:33.641514+00	cdsorxpo7n3e	fe003d34-85fe-4936-b30b-5c294de199f3
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
fe003d34-85fe-4936-b30b-5c294de199f3	dea78cbb-db92-4ff0-b67f-c1e387191de6	2025-05-19 06:42:25.501942+00	2025-05-19 07:40:33.648039+00	\N	aal1	\N	2025-05-19 07:40:33.64796	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	49.43.2.5	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	5ea6aa51-b259-4d9f-aa24-d7d694a0f51d	authenticated	authenticated	yashtagai23@gmail.com	$2a$10$FNbTmknRfBsAZYCz5V5dvOeM4KQWXt7YpeyOG/Sw05A/KSK9mtjZa	2025-05-19 06:42:05.293458+00	\N		\N		\N			\N	2025-05-19 06:42:05.478102+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-05-19 06:42:05.284673+00	2025-05-19 06:42:05.505701+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	dea78cbb-db92-4ff0-b67f-c1e387191de6	authenticated	authenticated	9756326656@elephant.watch	$2a$10$5zZ9XA2w0qCV6lM2F.xrjuIi1Vf1jsnTcpN.BYM8bLEHjE/3C1Igi	2025-05-19 06:42:25.33492+00	\N		\N		\N			\N	2025-05-19 06:42:25.501866+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-05-19 06:42:25.331082+00	2025-05-19 07:40:33.645282+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, user_email, action, "time", ip, created_at) FROM stdin;
11	yashtagai23@gmail.com	report_submitted	2025-05-14 07:05:06.745	49.43.0.36	2025-05-14 07:05:06.745
12	yashtagai23@gmail.com	report_submitted	2025-05-14 07:08:17.329	49.43.0.36	2025-05-14 07:08:17.329
\.


--
-- Data for Name: activity_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_reports (id, activity_date, activity_time, latitude, longitude, observation_type, total_elephants, male_elephants, female_elephants, unknown_elephants, calves, indirect_sighting_type, loss_type, compass_bearing, photo_url, user_id, created_at) FROM stdin;
5b5a116b-7889-41b5-baec-392c519e11d9	2025-05-20	15:30:00	21.834349	75.626198	indirect	\N	\N	\N	\N	\N	Dung	\N	15	activity-photos/3dce2d28-d752-4eee-bd58-1bcb5153ec1f_1747735751521.png	3dce2d28-d752-4eee-bd58-1bcb5153ec1f	2025-05-20 10:22:52.955926+00
1981fb8d-938a-4e35-9d14-43c45d75b104	2025-05-20	15:53:00	21.834349	75.626198	indirect	\N	\N	\N	\N	\N	Sound	\N	50	\N	32e21079-f012-464a-ab0c-ed2cbbb81196	2025-05-20 10:23:48.192938+00
3226e3b0-b2eb-42ed-8f2c-a47e5c1f857a	2025-05-20	16:02:00	21.834391	75.626224	indirect	\N	\N	\N	\N	\N	Eyewitness	\N	343	\N	3dce2d28-d752-4eee-bd58-1bcb5153ec1f	2025-05-20 10:33:55.181458+00
9b2c75ac-1fcc-4b4e-800e-13644431eeec	2025-05-20	19:06:00	21.834349	75.626198	loss	\N	\N	\N	\N	\N	\N	property	100	activity-photos/3dce2d28-d752-4eee-bd58-1bcb5153ec1f_1747748300027.png	3dce2d28-d752-4eee-bd58-1bcb5153ec1f	2025-05-20 13:38:29.202374+00
\.


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_settings (id, app_name, default_timezone, default_language, maintenance_mode, system_version, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: auth_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_settings (id, password_policy, enable_2fa, session_timeout, login_attempt_limit, ip_whitelist, ip_blacklist, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: backup_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backup_settings (id, backup_schedule, backup_location, data_retention, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: coordinates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coordinates (uid, "DID", "Division_Name", "SID", "State", division_lat, division_lon, "Division_range", "RID", "Range_Name", "State_range", range_lat, range_lon, "BID", "Beat_Name", "Beat_Ar", "Division_beat", "Range", "State_beat", beat_lat, beat_lon) FROM stdin;
1	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	1	Atraila	Madhya_Pradesh	2539468.811	1930842.022	1	Atraila	13.26702506	Rewa	Atraila	Madhya_Pradesh	2539906.371	1936643.871
2	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	1	Atraila	Madhya_Pradesh	2539468.811	1930842.022	2	Chand	11.48837016	Rewa	Atraila	Madhya_Pradesh	2532075.623	1931021.753
3	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	1	Atraila	Madhya_Pradesh	2539468.811	1930842.022	3	Choukhandi	3.78297592	Rewa	Atraila	Madhya_Pradesh	2544210.777	1939807.886
4	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	1	Atraila	Madhya_Pradesh	2539468.811	1930842.022	4	Deokhar	13.27793467	Rewa	Atraila	Madhya_Pradesh	2537468.351	1933957.581
5	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	1	Atraila	Madhya_Pradesh	2539468.811	1930842.022	12	Gurdari_East	12.31977822	Rewa	Atraila	Madhya_Pradesh	2544176.523	1928701.652
6	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	1	Atraila	Madhya_Pradesh	2539468.811	1930842.022	6	Gurdari_West	8.891673624	Rewa	Atraila	Madhya_Pradesh	2544160.021	1925318.168
7	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	1	Atraila	Madhya_Pradesh	2539468.811	1930842.022	7	Gurguda	11.31206393	Rewa	Atraila	Madhya_Pradesh	2532791.519	1928457.473
8	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	1	Atraila	Madhya_Pradesh	2539468.811	1930842.022	8	Harahai	9.312000983	Rewa	Atraila	Madhya_Pradesh	2542530.202	1933944.979
9	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	1	Atraila	Madhya_Pradesh	2539468.811	1930842.022	9	Hardoli	10.28689758	Rewa	Atraila	Madhya_Pradesh	2540925.114	1931424.198
10	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	1	Atraila	Madhya_Pradesh	2539468.811	1930842.022	10	Obari_North	12.56700513	Rewa	Atraila	Madhya_Pradesh	2541552.115	1926318.615
11	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	1	Atraila	Madhya_Pradesh	2539468.811	1930842.022	11	Obari_South	13.300415	Rewa	Atraila	Madhya_Pradesh	2539010.761	1928593.794
12	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	2	Chakghat	Madhya_Pradesh	2532724.616	1979066.519	1	Badagawn	4.253417233	Rewa	Chakghat	Madhya_Pradesh	2538704.89	1976279.188
13	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	2	Chakghat	Madhya_Pradesh	2532724.616	1979066.519	2	Dhakhara	4.968133138	Rewa	Chakghat	Madhya_Pradesh	2524304.521	1983542.102
14	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	2	Chakghat	Madhya_Pradesh	2532724.616	1979066.519	10	Duaari	7.503035617	Rewa	Chakghat	Madhya_Pradesh	2535428.778	1977813.992
15	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	2	Chakghat	Madhya_Pradesh	2532724.616	1979066.519	3	Duari	2.326904893	Rewa	Chakghat	Madhya_Pradesh	2533660.74	1979624.362
16	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	2	Chakghat	Madhya_Pradesh	2532724.616	1979066.519	7	Fulawari	8.860924117	Rewa	Chakghat	Madhya_Pradesh	2525779.512	1986385.154
17	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	2	Chakghat	Madhya_Pradesh	2532724.616	1979066.519	4	Kakaraha	4.347585135	Rewa	Chakghat	Madhya_Pradesh	2526143.128	1991469.259
18	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	2	Chakghat	Madhya_Pradesh	2532724.616	1979066.519	5	Katara	9.125583928	Rewa	Chakghat	Madhya_Pradesh	2536636.443	1974161.04
19	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	2	Chakghat	Madhya_Pradesh	2532724.616	1979066.519	6	Maheba	8.249490704	Rewa	Chakghat	Madhya_Pradesh	2535462.316	1975938.381
20	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	2	Chakghat	Madhya_Pradesh	2532724.616	1979066.519	8	Raipur	10.21211589	Rewa	Chakghat	Madhya_Pradesh	2529459.228	1983572.614
21	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	2	Chakghat	Madhya_Pradesh	2532724.616	1979066.519	9	Sohagi	11.80787262	Rewa	Chakghat	Madhya_Pradesh	2537733.621	1970894.209
22	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	3	Dabhaura	Madhya_Pradesh	2554151.694	1935564.971	1	Akouria	3.723251815	Rewa	Dabhaura	Madhya_Pradesh	2560603.017	1933888.701
23	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	3	Dabhaura	Madhya_Pradesh	2554151.694	1935564.971	2	Chhamuha	5.117413085	Rewa	Dabhaura	Madhya_Pradesh	2552523.111	1932483.385
24	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	3	Dabhaura	Madhya_Pradesh	2554151.694	1935564.971	3	Dabhaura_North	12.45717699	Rewa	Dabhaura	Madhya_Pradesh	2558603.714	1929275.14
25	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	3	Dabhaura	Madhya_Pradesh	2554151.694	1935564.971	5	Dabhoura_South	8.847424473	Rewa	Dabhaura	Madhya_Pradesh	2554081.135	1929223.403
26	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	3	Dabhaura	Madhya_Pradesh	2554151.694	1935564.971	6	Darraha	3.729101943	Rewa	Dabhaura	Madhya_Pradesh	2551583.999	1938505.282
27	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	3	Dabhaura	Madhya_Pradesh	2554151.694	1935564.971	7	Ghateha	7.258861977	Rewa	Dabhaura	Madhya_Pradesh	2558462.538	1952807.034
28	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	3	Dabhaura	Madhya_Pradesh	2554151.694	1935564.971	8	Ghuman	11.92097617	Rewa	Dabhaura	Madhya_Pradesh	2554389.596	1940073.601
29	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	3	Dabhaura	Madhya_Pradesh	2554151.694	1935564.971	9	Jatari	10.42318081	Rewa	Dabhaura	Madhya_Pradesh	2550097.785	1927940.189
30	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	3	Dabhaura	Madhya_Pradesh	2554151.694	1935564.971	10	Khajha	9.631401992	Rewa	Dabhaura	Madhya_Pradesh	2553182.49	1942503.519
31	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	3	Dabhaura	Madhya_Pradesh	2554151.694	1935564.971	11	Panwar	11.84061748	Rewa	Dabhaura	Madhya_Pradesh	2551244.736	1930897.469
32	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	3	Dabhaura	Madhya_Pradesh	2554151.694	1935564.971	12	Rimari	3.255982631	Rewa	Dabhaura	Madhya_Pradesh	2551767.385	1946429.95
33	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	3	Dabhaura	Madhya_Pradesh	2554151.694	1935564.971	13	Sohawal	6.669989768	Rewa	Dabhaura	Madhya_Pradesh	2553956.656	1935435.693
34	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	4	Hanumana	Madhya_Pradesh	2508291.779	2014099.938	1	Billighat_East	5.086663403	Rewa	Hanumana	Madhya_Pradesh	2524039.82	2005971.438
35	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	4	Hanumana	Madhya_Pradesh	2508291.779	2014099.938	2	Billighat_West	5.36553997	Rewa	Hanumana	Madhya_Pradesh	2525473.537	1999604.841
36	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	4	Hanumana	Madhya_Pradesh	2508291.779	2014099.938	3	Damodargarh	10.98289358	Rewa	Hanumana	Madhya_Pradesh	2499480.346	2000138.709
37	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	4	Hanumana	Madhya_Pradesh	2508291.779	2014099.938	4	Hanumana	4.341168173	Rewa	Hanumana	Madhya_Pradesh	2520078.499	2014015.059
38	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	4	Hanumana	Madhya_Pradesh	2508291.779	2014099.938	16	Harraha	7.173720349	Rewa	Hanumana	Madhya_Pradesh	2497003.912	1998468.478
39	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	4	Hanumana	Madhya_Pradesh	2508291.779	2014099.938	5	Jadkud_North	11.00272526	Rewa	Hanumana	Madhya_Pradesh	2505424.745	2027311.927
40	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	4	Hanumana	Madhya_Pradesh	2508291.779	2014099.938	6	Jadkud_South	11.2874063	Rewa	Hanumana	Madhya_Pradesh	2500392.137	2027607.422
41	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	4	Hanumana	Madhya_Pradesh	2508291.779	2014099.938	7	Kailashpur	9.516715308	Rewa	Hanumana	Madhya_Pradesh	2502631.561	2011032.34
42	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	4	Hanumana	Madhya_Pradesh	2508291.779	2014099.938	8	Korhawa	16.52111058	Rewa	Hanumana	Madhya_Pradesh	2504129.563	2024206.058
43	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	4	Hanumana	Madhya_Pradesh	2508291.779	2014099.938	9	Lorhi	6.476624246	Rewa	Hanumana	Madhya_Pradesh	2515743.373	2023729.864
44	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	4	Hanumana	Madhya_Pradesh	2508291.779	2014099.938	10	Munahai	11.44901059	Rewa	Hanumana	Madhya_Pradesh	2502189.94	2018429.446
45	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	4	Hanumana	Madhya_Pradesh	2508291.779	2014099.938	11	Naunkala	6.650279657	Rewa	Hanumana	Madhya_Pradesh	2520615.968	2018038.875
46	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	4	Hanumana	Madhya_Pradesh	2508291.779	2014099.938	12	Naunkhurd	4.774698009	Rewa	Hanumana	Madhya_Pradesh	2519163.981	2020038.748
47	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	4	Hanumana	Madhya_Pradesh	2508291.779	2014099.938	13	Piprahi	5.098555941	Rewa	Hanumana	Madhya_Pradesh	2500305.23	2011965.559
48	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	4	Hanumana	Madhya_Pradesh	2508291.779	2014099.938	14	Salaiya	12.13795503	Rewa	Hanumana	Madhya_Pradesh	2524030.455	2002483.242
49	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	4	Hanumana	Madhya_Pradesh	2508291.779	2014099.938	15	Saradaman	6.417343944	Rewa	Hanumana	Madhya_Pradesh	2498169.81	2003932.614
50	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	5	Mauganj	Madhya_Pradesh	2507812.818	1983961.642	2	BaheraDabar	15.5368475	Rewa	Mauganj	Madhya_Pradesh	2495116.942	1986272.757
51	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	5	Mauganj	Madhya_Pradesh	2507812.818	1983961.642	3	Bhaisahai	8.672629047	Rewa	Mauganj	Madhya_Pradesh	2524928.702	1987518.849
52	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	5	Mauganj	Madhya_Pradesh	2507812.818	1983961.642	4	Bhati	3.735895331	Rewa	Mauganj	Madhya_Pradesh	2499163.945	1988937.73
53	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	5	Mauganj	Madhya_Pradesh	2507812.818	1983961.642	5	Gauri	12.1836298	Rewa	Mauganj	Madhya_Pradesh	2524350.458	1994559.206
54	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	5	Mauganj	Madhya_Pradesh	2507812.818	1983961.642	1	Sarai	12.60237882	Rewa	Mauganj	Madhya_Pradesh	2490251.194	1977209.523
55	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	5	Mauganj	Madhya_Pradesh	2507812.818	1983961.642	7	Shankarpur	9.828960331	Rewa	Mauganj	Madhya_Pradesh	2531076.764	1981336.434
56	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	5	Mauganj	Madhya_Pradesh	2507812.818	1983961.642	8	Shivrajpur	10.67778783	Rewa	Mauganj	Madhya_Pradesh	2522307.314	1982840.642
57	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	5	Mauganj	Madhya_Pradesh	2507812.818	1983961.642	9	Sitapur	11.61841352	Rewa	Mauganj	Madhya_Pradesh	2493138.078	1977532.179
58	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	6	Rewa	Madhya_Pradesh	2480640.096	1947043.85	1	Badwar	27.21929894	Rewa	Rewa	Madhya_Pradesh	2489136.52	1959843.891
59	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	6	Rewa	Madhya_Pradesh	2480640.096	1947043.85	2	Bansa	11.3148382	Rewa	Rewa	Madhya_Pradesh	2473438.716	1933201.596
60	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	6	Rewa	Madhya_Pradesh	2480640.096	1947043.85	3	Govindgarh	14.13886529	Rewa	Rewa	Madhya_Pradesh	2472323.207	1928385.67
61	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	6	Rewa	Madhya_Pradesh	2480640.096	1947043.85	5	Kusamani	9.000591664	Rewa	Rewa	Madhya_Pradesh	2471959.4	1930783.236
62	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	6	Rewa	Madhya_Pradesh	2480640.096	1947043.85	8	Mahadandi	27.68949279	Rewa	Rewa	Madhya_Pradesh	2483156.349	1952499.363
63	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	6	Rewa	Madhya_Pradesh	2480640.096	1947043.85	6	Marwa_East	12.31505388	Rewa	Rewa	Madhya_Pradesh	2476464.401	1938154.056
64	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	6	Rewa	Madhya_Pradesh	2480640.096	1947043.85	7	Marwa_West	7.698390204	Rewa	Rewa	Madhya_Pradesh	2474713.212	1935712.115
65	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	6	Rewa	Madhya_Pradesh	2480640.096	1947043.85	9	Mehna	19.67919092	Rewa	Rewa	Madhya_Pradesh	2487249.2	1965186.984
66	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	6	Rewa	Madhya_Pradesh	2480640.096	1947043.85	10	Sahijana	9.744169255	Rewa	Rewa	Madhya_Pradesh	2479787.597	1945411.627
67	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	6	Rewa	Madhya_Pradesh	2480640.096	1947043.85	11	Sendhahai	7.970284629	Rewa	Rewa	Madhya_Pradesh	2478114.516	1942886.986
68	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	6	Rewa	Madhya_Pradesh	2480640.096	1947043.85	12	Teekar	6.777088211	Rewa	Rewa	Madhya_Pradesh	2476497.2	1940614.374
69	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	7	Semaria	Madhya_Pradesh	2531674.072	1924076.115	1	Bamhani	6.544063966	Rewa	Semaria	Madhya_Pradesh	2530647.257	1926402.835
70	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	7	Semaria	Madhya_Pradesh	2531674.072	1924076.115	2	Baudaha	7.151282881	Rewa	Semaria	Madhya_Pradesh	2530745.541	1920234.84
71	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	7	Semaria	Madhya_Pradesh	2531674.072	1924076.115	3	Jadua	10.75862632	Rewa	Semaria	Madhya_Pradesh	2528995.158	1929407.506
72	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	7	Semaria	Madhya_Pradesh	2531674.072	1924076.115	11	Kakaredi_East	20.11921067	Rewa	Semaria	Madhya_Pradesh	2535834.418	1927420.346
73	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	7	Semaria	Madhya_Pradesh	2531674.072	1924076.115	4	Kakredi_West	28.77912644	Rewa	Semaria	Madhya_Pradesh	2537354.338	1922989.228
74	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	7	Semaria	Madhya_Pradesh	2531674.072	1924076.115	5	Katai	8.512942913	Rewa	Semaria	Madhya_Pradesh	2532076.682	1915961.823
75	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	7	Semaria	Madhya_Pradesh	2531674.072	1924076.115	6	Mainaha	17.04400814	Rewa	Semaria	Madhya_Pradesh	2535280.678	1918597.661
76	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	7	Semaria	Madhya_Pradesh	2531674.072	1924076.115	7	Piyavan	15.01764522	Rewa	Semaria	Madhya_Pradesh	2532526.119	1924131.6
77	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	7	Semaria	Madhya_Pradesh	2531674.072	1924076.115	8	Poorva_North	13.83563997	Rewa	Semaria	Madhya_Pradesh	2525060.434	1927783.641
78	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	7	Semaria	Madhya_Pradesh	2531674.072	1924076.115	9	Poorva_South	16.22458807	Rewa	Semaria	Madhya_Pradesh	2523731.562	1930210.627
79	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	7	Semaria	Madhya_Pradesh	2531674.072	1924076.115	10	Semaria	8.255619944	Rewa	Semaria	Madhya_Pradesh	2524125.162	1915557.421
80	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	8	Sirmaour	Madhya_Pradesh	2531527.115	1948737.758	1	Bhadara	12.54219928	Rewa	Sirmaour	Madhya_Pradesh	2527446.648	1932878.554
81	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	8	Sirmaour	Madhya_Pradesh	2531527.115	1948737.758	2	Bhanigawan	8.16596903	Rewa	Sirmaour	Madhya_Pradesh	2532405.186	1949734.108
82	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	8	Sirmaour	Madhya_Pradesh	2531527.115	1948737.758	3	Chachai	6.390422036	Rewa	Sirmaour	Madhya_Pradesh	2523014.26	1931330.395
83	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	8	Sirmaour	Madhya_Pradesh	2531527.115	1948737.758	15	Chilla	8.246555866	Rewa	Sirmaour	Madhya_Pradesh	2536108.259	1960221.043
84	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	8	Sirmaour	Madhya_Pradesh	2531527.115	1948737.758	6	Jankahai	10.80426951	Rewa	Sirmaour	Madhya_Pradesh	2534298.679	1955443.252
85	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	8	Sirmaour	Madhya_Pradesh	2531527.115	1948737.758	16	Jhiriya	12.22888224	Rewa	Sirmaour	Madhya_Pradesh	2538425.793	1967738.357
86	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	8	Sirmaour	Madhya_Pradesh	2531527.115	1948737.758	7	Kankar	9.557617182	Rewa	Sirmaour	Madhya_Pradesh	2535380.85	1964009.772
87	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	8	Sirmaour	Madhya_Pradesh	2531527.115	1948737.758	8	Luke	14.09990618	Rewa	Sirmaour	Madhya_Pradesh	2530423.307	1943983.995
88	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	8	Sirmaour	Madhya_Pradesh	2531527.115	1948737.758	9	Padari	7.863442811	Rewa	Sirmaour	Madhya_Pradesh	2528935.801	1935034.513
89	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	8	Sirmaour	Madhya_Pradesh	2531527.115	1948737.758	10	Pangari	15.66997114	Rewa	Sirmaour	Madhya_Pradesh	2534204.562	1958051.87
90	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	8	Sirmaour	Madhya_Pradesh	2531527.115	1948737.758	11	Patehara	6.810072869	Rewa	Sirmaour	Madhya_Pradesh	2530743.654	1937295.133
91	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	8	Sirmaour	Madhya_Pradesh	2531527.115	1948737.758	12	Rajgarh	13.45702757	Rewa	Sirmaour	Madhya_Pradesh	2528755.006	1942122.278
92	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	8	Sirmaour	Madhya_Pradesh	2531527.115	1948737.758	13	Sarai	26.41207276	Rewa	Sirmaour	Madhya_Pradesh	2529824.875	1948907.42
93	48	Rewa	14	Madhya_Pradesh	2521366.732	1955691.018	Rewa	8	Sirmaour	Madhya_Pradesh	2531527.115	1948737.758	14	Sirmour	4.989820782	Rewa	Sirmaour	Madhya_Pradesh	2529738.286	1938286.204
94	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	1	Amarpatan	Madhya_Pradesh	2459598	1905903.404	14	Bagdari	12.80718075	Satna	Amarpatan	Madhya_Pradesh	2465232.187	1915097.526
95	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	1	Amarpatan	Madhya_Pradesh	2459598	1905903.404	1	Bhismpur	24.26076445	Satna	Amarpatan	Madhya_Pradesh	2466703.068	1909904.373
96	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	1	Amarpatan	Madhya_Pradesh	2459598	1905903.404	2	Bihra	13.60055209	Satna	Amarpatan	Madhya_Pradesh	2455899.766	1891588.718
97	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	1	Amarpatan	Madhya_Pradesh	2459598	1905903.404	3	Daga_Gulbar	6.837943914	Satna	Amarpatan	Madhya_Pradesh	2458887.643	1923457.279
98	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	1	Amarpatan	Madhya_Pradesh	2459598	1905903.404	4	Gidhaila	14.20184601	Satna	Amarpatan	Madhya_Pradesh	2462315.331	1915177.811
99	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	1	Amarpatan	Madhya_Pradesh	2459598	1905903.404	5	Gorsari	9.155902423	Satna	Amarpatan	Madhya_Pradesh	2461791.637	1905669.628
100	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	1	Amarpatan	Madhya_Pradesh	2459598	1905903.404	6	Jariyari	10.06076101	Satna	Amarpatan	Madhya_Pradesh	2458667.594	1896105.957
101	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	1	Amarpatan	Madhya_Pradesh	2459598	1905903.404	7	Kakra	13.77069975	Satna	Amarpatan	Madhya_Pradesh	2475040.783	1900991.401
102	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	1	Amarpatan	Madhya_Pradesh	2459598	1905903.404	8	Khajuri	9.31687733	Satna	Amarpatan	Madhya_Pradesh	2452325.429	1919360.065
103	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	1	Amarpatan	Madhya_Pradesh	2459598	1905903.404	9	Khamhariya	6.16478587	Satna	Amarpatan	Madhya_Pradesh	2455499.986	1925137.731
104	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	1	Amarpatan	Madhya_Pradesh	2459598	1905903.404	10	Kirhai	14.93281936	Satna	Amarpatan	Madhya_Pradesh	2462205.098	1903338.084
105	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	1	Amarpatan	Madhya_Pradesh	2459598	1905903.404	11	Koigarh	20.23841031	Satna	Amarpatan	Madhya_Pradesh	2447668.815	1900831.228
106	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	1	Amarpatan	Madhya_Pradesh	2459598	1905903.404	12	Laluaa	13.74392911	Satna	Amarpatan	Madhya_Pradesh	2449571.282	1910898.27
107	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	1	Amarpatan	Madhya_Pradesh	2459598	1905903.404	13	Tenduhati	17.17204719	Satna	Amarpatan	Madhya_Pradesh	2458548.256	1889879.554
108	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	2	Barondha	Madhya_Pradesh	2540414.106	1860584.579	1	Baroundha	27.71013469	Satna	Barondha	Madhya_Pradesh	2546095.595	1863925.033
109	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	2	Barondha	Madhya_Pradesh	2540414.106	1860584.579	2	Bhatawa	28.04524853	Satna	Barondha	Madhya_Pradesh	2533897.728	1861303.371
110	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	2	Barondha	Madhya_Pradesh	2540414.106	1860584.579	3	Jawarin	3.80904702	Satna	Barondha	Madhya_Pradesh	2540875.257	1857747.076
111	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	2	Barondha	Madhya_Pradesh	2540414.106	1860584.579	5	Kilhoura	8.641043471	Satna	Barondha	Madhya_Pradesh	2532835.644	1868229.506
112	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	2	Barondha	Madhya_Pradesh	2540414.106	1860584.579	6	Kishanpur	29.89374312	Satna	Barondha	Madhya_Pradesh	2538371.668	1862275.541
113	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	2	Barondha	Madhya_Pradesh	2540414.106	1860584.579	7	Kounhari	11.58558988	Satna	Barondha	Madhya_Pradesh	2537895.803	1851700.179
114	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	2	Barondha	Madhya_Pradesh	2540414.106	1860584.579	8	Maharajnagar	4.120964199	Satna	Barondha	Madhya_Pradesh	2554187.138	1864131.623
115	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	2	Barondha	Madhya_Pradesh	2540414.106	1860584.579	9	Mahatein	11.30630711	Satna	Barondha	Madhya_Pradesh	2537073.002	1870290.175
116	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	2	Barondha	Madhya_Pradesh	2540414.106	1860584.579	10	Mohani	8.249570748	Satna	Barondha	Madhya_Pradesh	2550160.559	1868799.555
117	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	2	Barondha	Madhya_Pradesh	2540414.106	1860584.579	11	Mudiyadev	21.14702453	Satna	Barondha	Madhya_Pradesh	2543641.842	1857396.247
118	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	2	Barondha	Madhya_Pradesh	2540414.106	1860584.579	12	Nivi	20.73755795	Satna	Barondha	Madhya_Pradesh	2540770.349	1865245.505
119	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	2	Barondha	Madhya_Pradesh	2540414.106	1860584.579	13	Patharkachhar	18.02660094	Satna	Barondha	Madhya_Pradesh	2547493.571	1858143.412
120	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	2	Barondha	Madhya_Pradesh	2540414.106	1860584.579	14	Saraieyan	12.8086328	Satna	Barondha	Madhya_Pradesh	2542357.192	1852156.322
121	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	2	Barondha	Madhya_Pradesh	2540414.106	1860584.579	15	Thar	11.52493702	Satna	Barondha	Madhya_Pradesh	2538596.7	1856384.442
122	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	3	Chitrakoot	Madhya_Pradesh	2548617.12	1880371.763	15	Anusuiya	25.65117106	Satna	Chitrakoot	Madhya_Pradesh	2550517.172	1885059.292
123	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	3	Chitrakoot	Madhya_Pradesh	2548617.12	1880371.763	1	Chauraha	15.68875723	Satna	Chitrakoot	Madhya_Pradesh	2542615.063	1879471.529
124	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	3	Chitrakoot	Madhya_Pradesh	2548617.12	1880371.763	2	Harduaa	8.476432394	Satna	Chitrakoot	Madhya_Pradesh	2553720.924	1878725.629
125	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	3	Chitrakoot	Madhya_Pradesh	2548617.12	1880371.763	3	Jhari	24.84978992	Satna	Chitrakoot	Madhya_Pradesh	2539177.262	1873489.82
126	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	3	Chitrakoot	Madhya_Pradesh	2548617.12	1880371.763	4	Judehi	16.33587528	Satna	Chitrakoot	Madhya_Pradesh	2545501.716	1884154.574
127	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	3	Chitrakoot	Madhya_Pradesh	2548617.12	1880371.763	5	Kamata	0.677026164	Satna	Chitrakoot	Madhya_Pradesh	2562003.109	1886294.69
128	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	3	Chitrakoot	Madhya_Pradesh	2548617.12	1880371.763	6	Kharaha	6.639006738	Satna	Chitrakoot	Madhya_Pradesh	2555715.82	1874464.174
129	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	3	Chitrakoot	Madhya_Pradesh	2548617.12	1880371.763	7	Mohakamgarh	10.34070004	Satna	Chitrakoot	Madhya_Pradesh	2556047.03	1887980.327
130	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	3	Chitrakoot	Madhya_Pradesh	2548617.12	1880371.763	8	Nakeila	12.53297839	Satna	Chitrakoot	Madhya_Pradesh	2548596.188	1873119.635
131	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	3	Chitrakoot	Madhya_Pradesh	2548617.12	1880371.763	9	Nayagaon	5.919724119	Satna	Chitrakoot	Madhya_Pradesh	2559797.824	1889404.604
132	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	3	Chitrakoot	Madhya_Pradesh	2548617.12	1880371.763	10	Padmaniya	9.579937611	Satna	Chitrakoot	Madhya_Pradesh	2549899.42	1880501.635
133	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	3	Chitrakoot	Madhya_Pradesh	2548617.12	1880371.763	11	Paldev	14.04361695	Satna	Chitrakoot	Madhya_Pradesh	2553310.387	1882720.802
134	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	3	Chitrakoot	Madhya_Pradesh	2548617.12	1880371.763	12	Piparaha	13.06533358	Satna	Chitrakoot	Madhya_Pradesh	2546841.257	1878071.503
135	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	3	Chitrakoot	Madhya_Pradesh	2548617.12	1880371.763	13	Rajoula	8.239939951	Satna	Chitrakoot	Madhya_Pradesh	2555564.782	1886071.541
136	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	3	Chitrakoot	Madhya_Pradesh	2548617.12	1880371.763	14	Sanda	9.92729143	Satna	Chitrakoot	Madhya_Pradesh	2546244.763	1876328.549
137	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	1	Amdara	9.740806432	Satna	Maihar	Madhya_Pradesh	2446379.068	1855265.996
138	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	2	Bahilee	12.99708876	Satna	Maihar	Madhya_Pradesh	2444705.27	1896067.901
139	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	3	Bamhani	18.19529766	Satna	Maihar	Madhya_Pradesh	2457832.597	1884472.582
140	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	6	Bhadanpur	20.97917719	Satna	Maihar	Madhya_Pradesh	2454567.013	1885331.446
141	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	8	Dhanwahi	9.893783991	Satna	Maihar	Madhya_Pradesh	2442844.809	1883624.523
142	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	9	Dhobaha	11.84325567	Satna	Maihar	Madhya_Pradesh	2438510.794	1841792.332
143	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	10	Ghunwara	15.90731066	Satna	Maihar	Madhya_Pradesh	2448904.831	1863590.279
144	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	11	Jhukehi	15.50964332	Satna	Maihar	Madhya_Pradesh	2434784.223	1840952.916
145	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	12	Judwani	21.64402533	Satna	Maihar	Madhya_Pradesh	2447131.593	1893019.238
146	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	21	Kalyanpur	7.670313544	Satna	Maihar	Madhya_Pradesh	2466852.169	1872760.147
147	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	13	Maihar	7.001326766	Satna	Maihar	Madhya_Pradesh	2464000.871	1871574.353
148	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	14	Manoura	21.30669139	Satna	Maihar	Madhya_Pradesh	2448902.787	1869616.125
149	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	15	Pondi	8.550006707	Satna	Maihar	Madhya_Pradesh	2460455.199	1870851.782
150	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	16	Sabhaganj	23.24152573	Satna	Maihar	Madhya_Pradesh	2440259.479	1848427.547
151	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	17	Sadhera	12.13640239	Satna	Maihar	Madhya_Pradesh	2451179.066	1878362.829
152	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	18	Sagmaniya	20.67902692	Satna	Maihar	Madhya_Pradesh	2453574.527	1877968.228
153	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	19	Sarang	9.836808732	Satna	Maihar	Madhya_Pradesh	2445400.811	1888182.719
154	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	20	Tighara	23.61054308	Satna	Maihar	Madhya_Pradesh	2442883.107	1859463.644
155	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	22	Vanshipur	7.168183277	Satna	Maihar	Madhya_Pradesh	2469046.365	1884389.253
156	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	4	Maihar	Madhya_Pradesh	2449433.303	1870943.098	23	Verme	19.39800953	Satna	Maihar	Madhya_Pradesh	2457280.953	1866093.443
157	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	5	Majhgawan	Madhya_Pradesh	2532225.289	1888630.679	2	Amirati	10.96096904	Satna	Majhgawan	Madhya_Pradesh	2535415.564	1893783.809
158	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	5	Majhgawan	Madhya_Pradesh	2532225.289	1888630.679	1	Amuaa	8.727090251	Satna	Majhgawan	Madhya_Pradesh	2532803.06	1906241.367
159	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	5	Majhgawan	Madhya_Pradesh	2532225.289	1888630.679	3	Bhargawan	7.027881761	Satna	Majhgawan	Madhya_Pradesh	2526591.687	1884788.203
160	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	5	Majhgawan	Madhya_Pradesh	2532225.289	1888630.679	4	Birsinghpur	7.066864015	Satna	Majhgawan	Madhya_Pradesh	2528560.732	1898150.873
161	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	5	Majhgawan	Madhya_Pradesh	2532225.289	1888630.679	5	Chhatahari	19.21642015	Satna	Majhgawan	Madhya_Pradesh	2535946.403	1903849.164
162	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	5	Majhgawan	Madhya_Pradesh	2532225.289	1888630.679	6	Chitahara	20.67810568	Satna	Majhgawan	Madhya_Pradesh	2529290.458	1887251.391
163	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	5	Majhgawan	Madhya_Pradesh	2532225.289	1888630.679	7	Devlaha	15.68080919	Satna	Majhgawan	Madhya_Pradesh	2536249.151	1876676.671
164	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	5	Majhgawan	Madhya_Pradesh	2532225.289	1888630.679	8	Gardi	8.718462842	Satna	Majhgawan	Madhya_Pradesh	2534604.832	1898369.227
165	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	5	Majhgawan	Madhya_Pradesh	2532225.289	1888630.679	9	Karariya	28.36133045	Satna	Majhgawan	Madhya_Pradesh	2534665.932	1887796.086
166	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	5	Majhgawan	Madhya_Pradesh	2532225.289	1888630.679	10	Keilashpur	53.70230129	Satna	Majhgawan	Madhya_Pradesh	2526984.384	1878275.623
167	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	5	Majhgawan	Madhya_Pradesh	2532225.289	1888630.679	11	Ledari	11.75622149	Satna	Majhgawan	Madhya_Pradesh	2537821.61	1894619.718
168	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	5	Majhgawan	Madhya_Pradesh	2532225.289	1888630.679	12	Majhgawan	19.46979177	Satna	Majhgawan	Madhya_Pradesh	2533264.647	1880303.65
169	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	5	Majhgawan	Madhya_Pradesh	2532225.289	1888630.679	13	Ormani	7.168337998	Satna	Majhgawan	Madhya_Pradesh	2532750.629	1910989.813
170	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	5	Majhgawan	Madhya_Pradesh	2532225.289	1888630.679	14	Patna	16.93595487	Satna	Majhgawan	Madhya_Pradesh	2532867.076	1873036.309
171	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	5	Majhgawan	Madhya_Pradesh	2532225.289	1888630.679	15	Pipritola	14.85301262	Satna	Majhgawan	Madhya_Pradesh	2531211.348	1891151.086
172	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	5	Majhgawan	Madhya_Pradesh	2532225.289	1888630.679	16	Pratappur	16.66002664	Satna	Majhgawan	Madhya_Pradesh	2535673.153	1908201.018
173	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	6	Mukundpur	Madhya_Pradesh	2468914.906	1923484.792	1	Anandgarh	11.14217516	Satna	Mukundpur	Madhya_Pradesh	2472633.343	1924519.709
174	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	6	Mukundpur	Madhya_Pradesh	2468914.906	1923484.792	2	Gopalpur	10.15639949	Satna	Mukundpur	Madhya_Pradesh	2468383.496	1915327.615
175	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	6	Mukundpur	Madhya_Pradesh	2468914.906	1923484.792	4	Hinouti	8.571033121	Satna	Mukundpur	Madhya_Pradesh	2469029.97	1927526.113
176	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	6	Mukundpur	Madhya_Pradesh	2468914.906	1923484.792	8	Jhinna	7.750570459	Satna	Mukundpur	Madhya_Pradesh	2459981.655	1929552.007
177	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	6	Mukundpur	Madhya_Pradesh	2468914.906	1923484.792	5	Jigana	7.601084826	Satna	Mukundpur	Madhya_Pradesh	2464529.767	1923170.062
178	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	6	Mukundpur	Madhya_Pradesh	2468914.906	1923484.792	6	Kastara	1.150901095	Satna	Mukundpur	Madhya_Pradesh	2479350.157	1923789.281
179	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	6	Mukundpur	Madhya_Pradesh	2468914.906	1923484.792	7	Khajuri	1.941036384	Satna	Mukundpur	Madhya_Pradesh	2481166.793	1925219.041
180	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	6	Mukundpur	Madhya_Pradesh	2468914.906	1923484.792	9	Madhi	1.161533634	Satna	Mukundpur	Madhya_Pradesh	2479675.517	1923342.53
181	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	6	Mukundpur	Madhya_Pradesh	2468914.906	1923484.792	10	Mankisar	9.2289423	Satna	Mukundpur	Madhya_Pradesh	2464516.676	1930673.366
182	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	6	Mukundpur	Madhya_Pradesh	2468914.906	1923484.792	11	Mukundpur	1.034758419	Satna	Mukundpur	Madhya_Pradesh	2480086.504	1925077.385
183	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	6	Mukundpur	Madhya_Pradesh	2468914.906	1923484.792	12	Papra	12.58221047	Satna	Mukundpur	Madhya_Pradesh	2469566.776	1923224.265
184	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	6	Mukundpur	Madhya_Pradesh	2468914.906	1923484.792	13	Ramgarh	15.09415475	Satna	Mukundpur	Madhya_Pradesh	2470873.013	1917185.034
185	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	6	Mukundpur	Madhya_Pradesh	2468914.906	1923484.792	14	Sariya	5.457195591	Satna	Mukundpur	Madhya_Pradesh	2459853.363	1933542.482
186	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	6	Mukundpur	Madhya_Pradesh	2468914.906	1923484.792	15	Tala	13.42317343	Satna	Mukundpur	Madhya_Pradesh	2471685.502	1920439.945
187	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	7	Nagod	Madhya_Pradesh	2481733.368	1860032.358	1	Amukui	8.490180428	Satna	Nagod	Madhya_Pradesh	2482346.153	1851566.142
188	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	7	Nagod	Madhya_Pradesh	2481733.368	1860032.358	2	Chotarha	11.04239316	Satna	Nagod	Madhya_Pradesh	2477333.16	1850079.565
189	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	7	Nagod	Madhya_Pradesh	2481733.368	1860032.358	3	Devri	22.98439647	Satna	Nagod	Madhya_Pradesh	2474098.069	1854624.842
190	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	7	Nagod	Madhya_Pradesh	2481733.368	1860032.358	4	Dureha	8.891926368	Satna	Nagod	Madhya_Pradesh	2482743.184	1848431.833
191	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	7	Nagod	Madhya_Pradesh	2481733.368	1860032.358	5	Gudha	19.21383227	Satna	Nagod	Madhya_Pradesh	2480064.941	1862009.132
192	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	7	Nagod	Madhya_Pradesh	2481733.368	1860032.358	6	Harduaa	7.944294633	Satna	Nagod	Madhya_Pradesh	2479794.856	1849770.805
193	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	7	Nagod	Madhya_Pradesh	2481733.368	1860032.358	7	Jadopur	15.93183976	Satna	Nagod	Madhya_Pradesh	2485065.637	1864081.649
194	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	7	Nagod	Madhya_Pradesh	2481733.368	1860032.358	8	Jhingodar	13.13832872	Satna	Nagod	Madhya_Pradesh	2484281.112	1855619.442
195	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	7	Nagod	Madhya_Pradesh	2481733.368	1860032.358	9	Khagaha	23.90398173	Satna	Nagod	Madhya_Pradesh	2484665.773	1869551.806
196	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	7	Nagod	Madhya_Pradesh	2481733.368	1860032.358	10	Khamha	26.93184133	Satna	Nagod	Madhya_Pradesh	2482619.745	1865292.289
197	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	7	Nagod	Madhya_Pradesh	2481733.368	1860032.358	11	Maharajpur	11.84241368	Satna	Nagod	Madhya_Pradesh	2480316.632	1854443.058
198	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	7	Nagod	Madhya_Pradesh	2481733.368	1860032.358	12	Pahadi	21.58103708	Satna	Nagod	Madhya_Pradesh	2477727.672	1857096.947
199	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	7	Nagod	Madhya_Pradesh	2481733.368	1860032.358	13	Rahikawara	10.25504717	Satna	Nagod	Madhya_Pradesh	2489665.712	1866884.216
200	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	7	Nagod	Madhya_Pradesh	2481733.368	1860032.358	14	Shyam_Nagar	13.04910616	Satna	Nagod	Madhya_Pradesh	2487145.774	1871065.566
201	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	7	Nagod	Madhya_Pradesh	2481733.368	1860032.358	15	Surdaha	14.28448346	Satna	Nagod	Madhya_Pradesh	2483698.972	1859494.359
202	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	8	Satna	Madhya_Pradesh	2489268.195	1895774.727	9	Bandarkha	1.865543781	Satna	Satna	Madhya_Pradesh	2497386.7	1899058.469
203	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	8	Satna	Madhya_Pradesh	2489268.195	1895774.727	1	Bihra	6.345967172	Satna	Satna	Madhya_Pradesh	2484838.903	1894713.318
204	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	8	Satna	Madhya_Pradesh	2489268.195	1895774.727	3	Gauhari	9.949783517	Satna	Satna	Madhya_Pradesh	2488982.477	1891842.356
205	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	8	Satna	Madhya_Pradesh	2489268.195	1895774.727	4	Guduhuru	10.17439265	Satna	Satna	Madhya_Pradesh	2487564.994	1895459.725
206	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	8	Satna	Madhya_Pradesh	2489268.195	1895774.727	2	Itma	8.891232815	Satna	Satna	Madhya_Pradesh	2484759.349	1891813.327
207	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	8	Satna	Madhya_Pradesh	2489268.195	1895774.727	8	Jamodi	4.77220684	Satna	Satna	Madhya_Pradesh	2500980.5	1896240.038
208	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	8	Satna	Madhya_Pradesh	2489268.195	1895774.727	10	Janardanpur	5.602594899	Satna	Satna	Madhya_Pradesh	2501127.386	1908087.583
209	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	8	Satna	Madhya_Pradesh	2489268.195	1895774.727	11	Khamhariya	1.369302318	Satna	Satna	Madhya_Pradesh	2500520.852	1894851.209
210	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	8	Satna	Madhya_Pradesh	2489268.195	1895774.727	5	Khondhojhalawar	4.289513725	Satna	Satna	Madhya_Pradesh	2485854.754	1901557.64
211	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	8	Satna	Madhya_Pradesh	2489268.195	1895774.727	6	Maheba	7.953922204	Satna	Satna	Madhya_Pradesh	2482753.875	1894662.219
212	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	8	Satna	Madhya_Pradesh	2489268.195	1895774.727	7	Mohar	7.494986942	Satna	Satna	Madhya_Pradesh	2489526.514	1894742.788
213	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	9	Singhpur	Madhya_Pradesh	2519389.199	1858223.964	1	Amdari	35.53205526	Satna	Singhpur	Madhya_Pradesh	2523353.512	1864656.462
214	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	9	Singhpur	Madhya_Pradesh	2519389.199	1858223.964	2	Bandhi	14.57741616	Satna	Singhpur	Madhya_Pradesh	2516246.895	1849383.507
215	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	9	Singhpur	Madhya_Pradesh	2519389.199	1858223.964	3	Bhajikheda	13.98926068	Satna	Singhpur	Madhya_Pradesh	2512005.214	1849002.484
216	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	9	Singhpur	Madhya_Pradesh	2519389.199	1858223.964	4	Chakar	24.14189028	Satna	Singhpur	Madhya_Pradesh	2527633.982	1864684.534
217	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	9	Singhpur	Madhya_Pradesh	2519389.199	1858223.964	13	Jhali	19.6319932	Satna	Singhpur	Madhya_Pradesh	2520159.625	1868151.405
218	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	9	Singhpur	Madhya_Pradesh	2519389.199	1858223.964	5	Khangarh	34.9081144	Satna	Singhpur	Madhya_Pradesh	2520828.549	1857600.173
219	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	9	Singhpur	Madhya_Pradesh	2519389.199	1858223.964	6	Kothi	18.3756873	Satna	Singhpur	Madhya_Pradesh	2522444.714	1873666.49
220	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	9	Singhpur	Madhya_Pradesh	2519389.199	1858223.964	7	Mahatein	12.85261546	Satna	Singhpur	Madhya_Pradesh	2515812.454	1862088.28
221	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	9	Singhpur	Madhya_Pradesh	2519389.199	1858223.964	8	Mora	18.89027354	Satna	Singhpur	Madhya_Pradesh	2514242.177	1845349.981
222	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	9	Singhpur	Madhya_Pradesh	2519389.199	1858223.964	9	Shivrajpur	37.76749422	Satna	Singhpur	Madhya_Pradesh	2512306.905	1841839.219
223	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	9	Singhpur	Madhya_Pradesh	2519389.199	1858223.964	10	Singhpur	26.44206127	Satna	Singhpur	Madhya_Pradesh	2513862.723	1855405.022
224	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	9	Singhpur	Madhya_Pradesh	2519389.199	1858223.964	11	Tagi	31.97841065	Satna	Singhpur	Madhya_Pradesh	2527410.662	1870645.187
225	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	9	Singhpur	Madhya_Pradesh	2519389.199	1858223.964	12	Usrar	15.36273498	Satna	Singhpur	Madhya_Pradesh	2518606.691	1852113.096
226	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	10	Uchehara	Madhya_Pradesh	2471598.38	1867537.083	1	Amdari	21.76923277	Satna	Uchehara	Madhya_Pradesh	2462052.837	1867514.874
227	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	10	Uchehara	Madhya_Pradesh	2471598.38	1867537.083	2	Bandraha	12.9019424	Satna	Uchehara	Madhya_Pradesh	2480310.194	1873507.058
228	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	10	Uchehara	Madhya_Pradesh	2471598.38	1867537.083	3	Dhaniya	14.94459854	Satna	Uchehara	Madhya_Pradesh	2473487.972	1870274.797
229	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	10	Uchehara	Madhya_Pradesh	2471598.38	1867537.083	4	Dundaha	13.37069683	Satna	Uchehara	Madhya_Pradesh	2484248.649	1874734.95
230	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	10	Uchehara	Madhya_Pradesh	2471598.38	1867537.083	5	Kachibari	17.06191443	Satna	Uchehara	Madhya_Pradesh	2471099.55	1858077.203
231	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	10	Uchehara	Madhya_Pradesh	2471598.38	1867537.083	6	Khokharra	6.230278385	Satna	Uchehara	Madhya_Pradesh	2477187.847	1874628.858
232	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	10	Uchehara	Madhya_Pradesh	2471598.38	1867537.083	7	Kushla	17.40018644	Satna	Uchehara	Madhya_Pradesh	2472408.155	1874556.886
233	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	10	Uchehara	Madhya_Pradesh	2471598.38	1867537.083	8	Lanhagi	17.77545344	Satna	Uchehara	Madhya_Pradesh	2468188.216	1861517.038
234	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	10	Uchehara	Madhya_Pradesh	2471598.38	1867537.083	9	Maharajpur	17.28074159	Satna	Uchehara	Madhya_Pradesh	2479618.883	1870184.447
235	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	10	Uchehara	Madhya_Pradesh	2471598.38	1867537.083	10	Panihai	24.47240372	Satna	Uchehara	Madhya_Pradesh	2460300.519	1862377.295
236	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	10	Uchehara	Madhya_Pradesh	2471598.38	1867537.083	11	Parasmaniya	30.12711659	Satna	Uchehara	Madhya_Pradesh	2473305.306	1862775.726
237	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	10	Uchehara	Madhya_Pradesh	2471598.38	1867537.083	12	Patihat	17.3339702	Satna	Uchehara	Madhya_Pradesh	2464386.124	1862212.473
238	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	10	Uchehara	Madhya_Pradesh	2471598.38	1867537.083	13	Rarghat	21.9040045	Satna	Uchehara	Madhya_Pradesh	2466796.155	1868404.779
239	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	10	Uchehara	Madhya_Pradesh	2471598.38	1867537.083	14	Sakhouha	22.7894676	Satna	Uchehara	Madhya_Pradesh	2476179.612	1868668.513
240	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	10	Uchehara	Madhya_Pradesh	2471598.38	1867537.083	15	Sinduriya	9.897868866	Satna	Uchehara	Madhya_Pradesh	2486278.742	1883122.123
241	50	Satna	14	Madhya_Pradesh	2497216.07	1875813.931	Satna	10	Uchehara	Madhya_Pradesh	2471598.38	1867537.083	16	Uraieechuaa	19.15545531	Satna	Uchehara	Madhya_Pradesh	2470825.202	1867829.686
242	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	1	Ahirgawa	5.033214325	Anuppur	Ahirgawa	Madhya_Pradesh	2339044.961	1930388.693
243	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	2	Audhera	17.57177991	Anuppur	Ahirgawa	Madhya_Pradesh	2357030.429	1918091.585
244	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	3	Baditummi	2.617503437	Anuppur	Ahirgawa	Madhya_Pradesh	2355640.12	1915609.077
245	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	4	Dongariya	6.856495776	Anuppur	Ahirgawa	Madhya_Pradesh	2339190.322	1922933.435
246	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	5	Gizari	22.51514008	Anuppur	Ahirgawa	Madhya_Pradesh	2347938.595	1917834.818
247	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	6	Hathbandha	6.815618139	Anuppur	Ahirgawa	Madhya_Pradesh	2327178.394	1937620.505
248	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	7	Hathpura	2.964451673	Anuppur	Ahirgawa	Madhya_Pradesh	2352905.636	1921947.922
249	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	8	Jugwari	8.00027507	Anuppur	Ahirgawa	Madhya_Pradesh	2346034.233	1928534.69
250	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	9	Karpa	3.425266287	Anuppur	Ahirgawa	Madhya_Pradesh	2324509.656	1941953.239
251	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	11	Kathotia-East	5.687042257	Anuppur	Ahirgawa	Madhya_Pradesh	2333546.377	1944719.836
252	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	10	Kathotia-West	5.138933336	Anuppur	Ahirgawa	Madhya_Pradesh	2333376.489	1940556.643
253	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	12	Kharsol	12.44825746	Anuppur	Ahirgawa	Madhya_Pradesh	2353151.326	1916674.854
254	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	13	Lamsarai	4.609720157	Anuppur	Ahirgawa	Madhya_Pradesh	2330193.955	1942510.033
255	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	17	Padmaniya	14.1139932	Anuppur	Ahirgawa	Madhya_Pradesh	2349624.525	1920444.947
256	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	14	Sarfa	14.21921354	Anuppur	Ahirgawa	Madhya_Pradesh	2345754.185	1917479.388
257	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	15	Tankitola	3.359587527	Anuppur	Ahirgawa	Madhya_Pradesh	2335831.075	1926693.708
258	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	1	Ahirgawa	Madhya_Pradesh	2345123.008	1924237.547	16	Titahi-Jaithari	6.380981677	Anuppur	Ahirgawa	Madhya_Pradesh	2343156.432	1928025.847
259	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	2	Amarkantak	Madhya_Pradesh	2299684.258	1972591.655	1	Amarkantak	8.719834712	Anuppur	Amarkantak	Madhya_Pradesh	2297523.739	1974597.02
260	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	2	Amarkantak	Madhya_Pradesh	2299684.258	1972591.655	2	Bhundakona	10.10697124	Anuppur	Amarkantak	Madhya_Pradesh	2298710.855	1973477.872
261	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	2	Amarkantak	Madhya_Pradesh	2299684.258	1972591.655	3	Damgarh	6.485602959	Anuppur	Amarkantak	Madhya_Pradesh	2298791.785	1971583.468
262	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	2	Amarkantak	Madhya_Pradesh	2299684.258	1972591.655	4	Harrai	10.09170958	Anuppur	Amarkantak	Madhya_Pradesh	2303688.776	1968344.262
263	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	2	Amarkantak	Madhya_Pradesh	2299684.258	1972591.655	5	Kapildhara	13.2551807	Anuppur	Amarkantak	Madhya_Pradesh	2295625.542	1971570.702
264	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	2	Amarkantak	Madhya_Pradesh	2299684.258	1972591.655	7	Pondi	11.14109718	Anuppur	Amarkantak	Madhya_Pradesh	2305493.473	1969414.992
265	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	2	Amarkantak	Madhya_Pradesh	2299684.258	1972591.655	8	Sonemooda	5.461941882	Anuppur	Amarkantak	Madhya_Pradesh	2290974.3	1973964.909
266	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	2	Amarkantak	Madhya_Pradesh	2299684.258	1972591.655	9	Taali	6.86442282	Anuppur	Amarkantak	Madhya_Pradesh	2302168.205	1976669.457
267	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	2	Amarkantak	Madhya_Pradesh	2299684.258	1972591.655	10	Umargohan	7.207074753	Anuppur	Amarkantak	Madhya_Pradesh	2299366.16	1976710.085
268	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	3	Anuppur	Madhya_Pradesh	2333956.219	1966182.663	11	Agariyanar	7.832077445	Anuppur	Anuppur	Madhya_Pradesh	2329700.47	1967828.578
269	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	3	Anuppur	Madhya_Pradesh	2333956.219	1966182.663	1	Anuppur	10.46387639	Anuppur	Anuppur	Madhya_Pradesh	2331456.664	1965651.594
270	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	3	Anuppur	Madhya_Pradesh	2333956.219	1966182.663	2	Audhera	18.58642654	Anuppur	Anuppur	Madhya_Pradesh	2325375.616	1968140.638
271	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	3	Anuppur	Madhya_Pradesh	2333956.219	1966182.663	3	Badahar	11.26855366	Anuppur	Anuppur	Madhya_Pradesh	2329237.429	1956878.083
272	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	3	Anuppur	Madhya_Pradesh	2333956.219	1966182.663	4	Bholgarh	10.07385551	Anuppur	Anuppur	Madhya_Pradesh	2346995.821	1974033.028
273	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	3	Anuppur	Madhya_Pradesh	2333956.219	1966182.663	13	Daikhal	4.581454447	Anuppur	Anuppur	Madhya_Pradesh	2344267.728	1977949.329
274	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	3	Anuppur	Madhya_Pradesh	2333956.219	1966182.663	5	Dudhmaniya	4.916377802	Anuppur	Anuppur	Madhya_Pradesh	2329571.689	1973464.544
275	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	3	Anuppur	Madhya_Pradesh	2333956.219	1966182.663	12	Funga	1.507550817	Anuppur	Anuppur	Madhya_Pradesh	2345013.41	1980848.484
276	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	3	Anuppur	Madhya_Pradesh	2333956.219	1966182.663	6	Jamudi	6.682480396	Anuppur	Anuppur	Madhya_Pradesh	2331851.146	1961788.617
277	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	3	Anuppur	Madhya_Pradesh	2333956.219	1966182.663	14	Khamaria	8.962196193	Anuppur	Anuppur	Madhya_Pradesh	2334176.022	1959795.449
278	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	3	Anuppur	Madhya_Pradesh	2333956.219	1966182.663	7	Khutwa	11.2874596	Anuppur	Anuppur	Madhya_Pradesh	2343744.727	1960645.503
279	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	3	Anuppur	Madhya_Pradesh	2333956.219	1966182.663	8	Kirar	19.44580024	Anuppur	Anuppur	Madhya_Pradesh	2327453.531	1962918.092
280	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	3	Anuppur	Madhya_Pradesh	2333956.219	1966182.663	9	Pondi	9.048247012	Anuppur	Anuppur	Madhya_Pradesh	2345495.768	1971376.709
281	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	3	Anuppur	Madhya_Pradesh	2333956.219	1966182.663	10	Sonemauhari	3.96198927	Anuppur	Anuppur	Madhya_Pradesh	2339528.19	1975222.045
282	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	4	Bijuri	Madhya_Pradesh	2360850.121	2008140.103	1	Belganw	9.366918538	Anuppur	Bijuri	Madhya_Pradesh	2361546.177	2016985.144
283	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	4	Bijuri	Madhya_Pradesh	2360850.121	2008140.103	10	Bhedaritalaiya-East	4.335195023	Anuppur	Bijuri	Madhya_Pradesh	2361858.314	1992729.687
284	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	4	Bijuri	Madhya_Pradesh	2360850.121	2008140.103	2	Bhedaritalaiya-West	4.006748914	Anuppur	Bijuri	Madhya_Pradesh	2360591.541	1990900.511
285	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	4	Bijuri	Madhya_Pradesh	2360850.121	2008140.103	8	Bijuri	15.56105619	Anuppur	Bijuri	Madhya_Pradesh	2353882.465	2014704.48
286	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	4	Bijuri	Madhya_Pradesh	2360850.121	2008140.103	3	Chaka	4.394999435	Anuppur	Bijuri	Madhya_Pradesh	2365575.676	1998419.445
287	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	4	Bijuri	Madhya_Pradesh	2360850.121	2008140.103	4	Dulhibandh	4.711432177	Anuppur	Bijuri	Madhya_Pradesh	2365828.127	1995569.195
288	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	4	Bijuri	Madhya_Pradesh	2360850.121	2008140.103	5	Jarratola	2.126701272	Anuppur	Bijuri	Madhya_Pradesh	2368040.91	2000982.412
289	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	4	Bijuri	Madhya_Pradesh	2360850.121	2008140.103	6	Keshauri	5.089415502	Anuppur	Bijuri	Madhya_Pradesh	2362230.615	1994800.84
290	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	4	Bijuri	Madhya_Pradesh	2360850.121	2008140.103	9	Kotma	0.178931113	Anuppur	Bijuri	Madhya_Pradesh	2351740.426	2000162.038
291	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	4	Bijuri	Madhya_Pradesh	2360850.121	2008140.103	11	Nigwani	7.289264519	Anuppur	Bijuri	Madhya_Pradesh	2358160.773	2003537.361
292	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	4	Bijuri	Madhya_Pradesh	2360850.121	2008140.103	12	Pakariha	9.243068262	Anuppur	Bijuri	Madhya_Pradesh	2363670.066	2008272.892
293	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	4	Bijuri	Madhya_Pradesh	2360850.121	2008140.103	13	Sajatola	10.01044586	Anuppur	Bijuri	Madhya_Pradesh	2363367.696	2012525.351
294	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	4	Bijuri	Madhya_Pradesh	2360850.121	2008140.103	14	Saristal	7.356779674	Anuppur	Bijuri	Madhya_Pradesh	2367072.571	2009686.888
295	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	4	Bijuri	Madhya_Pradesh	2360850.121	2008140.103	7	Thanganw	12.56748319	Anuppur	Bijuri	Madhya_Pradesh	2357366.355	2017244.242
296	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	1	Baihar	12.91688457	Anuppur	Jaithari	Madhya_Pradesh	2320496.946	1969234.97
297	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	2	Bhelma	19.99929562	Anuppur	Jaithari	Madhya_Pradesh	2317084.924	1973684.773
298	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	3	Cholna	2.664148319	Anuppur	Jaithari	Madhya_Pradesh	2331578.103	1987405.488
299	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	4	Dhangawa	8.504891359	Anuppur	Jaithari	Madhya_Pradesh	2333787.055	1985411.349
300	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	5	Gathiyatola	7.358447825	Anuppur	Jaithari	Madhya_Pradesh	2322774.794	1993032.15
301	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	6	Gobari	6.142510835	Anuppur	Jaithari	Madhya_Pradesh	2328894.51	1975695.079
302	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	7	Gorasi	9.421361583	Anuppur	Jaithari	Madhya_Pradesh	2322058.317	1978676.512
303	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	8	Jaithari	1.941758575	Anuppur	Jaithari	Madhya_Pradesh	2328871.322	1978829.177
304	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	9	Kerha	13.14567713	Anuppur	Jaithari	Madhya_Pradesh	2315156.134	1977554.45
305	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	10	Khodari	5.98853116	Anuppur	Jaithari	Madhya_Pradesh	2319043.817	1982992.936
306	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	11	Pondi	10.59184544	Anuppur	Jaithari	Madhya_Pradesh	2314793.666	1981068.32
307	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	12	Quontar	5.004062891	Anuppur	Jaithari	Madhya_Pradesh	2336736.478	1983305.468
308	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	13	Thehi	7.388738555	Anuppur	Jaithari	Madhya_Pradesh	2323614.143	1971406.149
309	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	14	Thodipani	11.05651084	Anuppur	Jaithari	Madhya_Pradesh	2321666.989	1973699.674
310	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	15	Tilmandand	11.66949574	Anuppur	Jaithari	Madhya_Pradesh	2319497.779	1978875.809
311	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	16	Umaria	5.226732938	Anuppur	Jaithari	Madhya_Pradesh	2324972.485	1988438.156
312	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	5	Jaithari	Madhya_Pradesh	2321603.812	1979033.162	17	Venkatnagar	9.583011214	Anuppur	Jaithari	Madhya_Pradesh	2320623.1	1989365.819
313	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	1	Chapani	9.035867899	Anuppur	Kotma	Madhya_Pradesh	2357728.408	1992949.322
314	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	2	Chukan	4.398958279	Anuppur	Kotma	Madhya_Pradesh	2342999.755	2001392.984
315	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	18	Daikhal	3.893945297	Anuppur	Kotma	Madhya_Pradesh	2345848.508	1984727.866
316	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	3	Deori	3.672399848	Anuppur	Kotma	Madhya_Pradesh	2355159.258	1984314.873
317	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	4	Dhurwasin	4.6339047	Anuppur	Kotma	Madhya_Pradesh	2338536.361	1984502.78
318	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	5	Dola	7.263250329	Anuppur	Kotma	Madhya_Pradesh	2348539.889	2011997.801
319	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	7	Harad	5.533705398	Anuppur	Kotma	Madhya_Pradesh	2344166.106	1990242.309
320	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	8	Kalyanpur	12.16522493	Anuppur	Kotma	Madhya_Pradesh	2347473.85	1997479.371
321	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	9	Lataar	11.90957613	Anuppur	Kotma	Madhya_Pradesh	2340461.741	1994166.292
322	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	19	Lodhi	5.055194451	Anuppur	Kotma	Madhya_Pradesh	2357885.536	1990307.101
323	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	10	Malga	10.95188837	Anuppur	Kotma	Madhya_Pradesh	2343441.626	2009287.126
324	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	17	Mantolia	8.286592106	Anuppur	Kotma	Madhya_Pradesh	2349534.888	1981382.512
325	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	11	Padaur	5.572877101	Anuppur	Kotma	Madhya_Pradesh	2337175.118	1991246.659
326	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	12	Pauradhar	7.59531131	Anuppur	Kotma	Madhya_Pradesh	2345330.062	2013493.595
327	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	13	Pondi	3.076100314	Anuppur	Kotma	Madhya_Pradesh	2335879.296	1993354.886
328	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	14	Sakola	6.370536352	Anuppur	Kotma	Madhya_Pradesh	2343515.106	1994938.204
329	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	15	Semra	6.420777074	Anuppur	Kotma	Madhya_Pradesh	2346201.848	2010382.328
330	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	16	Taanki	11.08310355	Anuppur	Kotma	Madhya_Pradesh	2340631.05	2012385.986
331	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	6	Kotma	Madhya_Pradesh	2345420.262	1999460.459	6	Taanki-East	9.653537968	Anuppur	Kotma	Madhya_Pradesh	2342622.587	2014127.327
332	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	7	Rajendra_Gram	Madhya_Pradesh	2314124.051	1953408.422	1	Bamhani	4.803824549	Anuppur	Rajendra_Gram	Madhya_Pradesh	2315622.267	1952240.966
333	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	7	Rajendra_Gram	Madhya_Pradesh	2314124.051	1953408.422	2	Basaniha	6.418147138	Anuppur	Rajendra_Gram	Madhya_Pradesh	2314382.898	1958924.846
334	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	7	Rajendra_Gram	Madhya_Pradesh	2314124.051	1953408.422	3	Benibari	15.11451111	Anuppur	Rajendra_Gram	Madhya_Pradesh	2314857.069	1945132.436
335	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	7	Rajendra_Gram	Madhya_Pradesh	2314124.051	1953408.422	4	Chhindpani	14.10690447	Anuppur	Rajendra_Gram	Madhya_Pradesh	2311880.834	1955543.432
336	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	7	Rajendra_Gram	Madhya_Pradesh	2314124.051	1953408.422	5	Guttipara	9.474498181	Anuppur	Rajendra_Gram	Madhya_Pradesh	2310469.702	1949553.97
337	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	7	Rajendra_Gram	Madhya_Pradesh	2314124.051	1953408.422	6	Karanpathar	5.772456033	Anuppur	Rajendra_Gram	Madhya_Pradesh	2317814.155	1936182.111
338	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	7	Rajendra_Gram	Madhya_Pradesh	2314124.051	1953408.422	7	Karaundi	6.193395966	Anuppur	Rajendra_Gram	Madhya_Pradesh	2316645.076	1968212.684
339	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	7	Rajendra_Gram	Madhya_Pradesh	2314124.051	1953408.422	8	Khati	10.43880622	Anuppur	Rajendra_Gram	Madhya_Pradesh	2308116.323	1960920.324
340	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	7	Rajendra_Gram	Madhya_Pradesh	2314124.051	1953408.422	9	Khursi	20.50028337	Anuppur	Rajendra_Gram	Madhya_Pradesh	2307457.793	1956086.651
341	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	7	Rajendra_Gram	Madhya_Pradesh	2314124.051	1953408.422	10	Ledhara	8.959696064	Anuppur	Rajendra_Gram	Madhya_Pradesh	2330061.141	1948482.721
342	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	7	Rajendra_Gram	Madhya_Pradesh	2314124.051	1953408.422	11	Patna	8.035387676	Anuppur	Rajendra_Gram	Madhya_Pradesh	2323894.574	1961912.009
343	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	7	Rajendra_Gram	Madhya_Pradesh	2314124.051	1953408.422	12	Piparaha	14.33465537	Anuppur	Rajendra_Gram	Madhya_Pradesh	2308925.623	1964001.126
344	60	Anuppur	14	Madhya_Pradesh	2332236.64	1970096.325	Anuppur	7	Rajendra_Gram	Madhya_Pradesh	2314124.051	1953408.422	13	Tulra	7.535744358	Anuppur	Rajendra_Gram	Madhya_Pradesh	2322352.243	1926879.032
345	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	1	Kallwah	MadhyaPradesh	2388220.521	1910714.966	1	Chechpur	13.98899419	BTR	Kallwah	MadhyaPradesh	2388405.764	1916129.627
346	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	1	Kallwah	MadhyaPradesh	2388220.521	1910714.966	3	Janad	15.08860258	BTR	Kallwah	MadhyaPradesh	2389550.724	1908644.243
347	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	1	Kallwah	MadhyaPradesh	2388220.521	1910714.966	7	Kallwah_N	12.81457267	BTR	Kallwah	MadhyaPradesh	2388215.722	1912038.38
348	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	1	Kallwah	MadhyaPradesh	2388220.521	1910714.966	9	Kallwah_S	9.026271198	BTR	Kallwah	MadhyaPradesh	2386198.801	1913794.356
349	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	1	Kallwah	MadhyaPradesh	2388220.521	1910714.966	4	Madau	8.514897647	BTR	Kallwah	MadhyaPradesh	2392153.647	1909595.83
350	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	1	Kallwah	MadhyaPradesh	2388220.521	1910714.966	5	Majhkheta_S	6.897492599	BTR	Kallwah	MadhyaPradesh	2393074.463	1906424.954
351	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	1	Kallwah	MadhyaPradesh	2388220.521	1910714.966	6	Malahara	11.26761865	BTR	Kallwah	MadhyaPradesh	2392127.871	1912755.927
352	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	1	Kallwah	MadhyaPradesh	2388220.521	1910714.966	2	Mehanwah_E	10.19410944	BTR	Kallwah	MadhyaPradesh	2383203.399	1910488.494
353	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	1	Kallwah	MadhyaPradesh	2388220.521	1910714.966	8	Mehanwah_N	14.37077284	BTR	Kallwah	MadhyaPradesh	2386755.282	1907587.515
354	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	1	Kallwah	MadhyaPradesh	2388220.521	1910714.966	10	Mehanwah_W	8.877731432	BTR	Kallwah	MadhyaPradesh	2383505.735	1907838.894
355	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	1	Kallwah	MadhyaPradesh	2388220.521	1910714.966	999	Non-Forest	0.19672208	BTR	Kallwah	MadhyaPradesh	2381660.108	1908949.819
356	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	2	Khitauli	MadhyaPradesh	2401901.054	1890314.191	1	Bagdara	9.128330317	BTR	Khitauli	MadhyaPradesh	2400278.826	1889221.493
357	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	2	Khitauli	MadhyaPradesh	2401901.054	1890314.191	7	Bagdari_E	11.75866301	BTR	Khitauli	MadhyaPradesh	2403935.859	1891788.852
358	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	2	Khitauli	MadhyaPradesh	2401901.054	1890314.191	18	Bandhadev	7.254279446	BTR	Khitauli	MadhyaPradesh	2398542.682	1880514.219
359	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	2	Khitauli	MadhyaPradesh	2401901.054	1890314.191	3	Bartari	6.913245443	BTR	Khitauli	MadhyaPradesh	2398431.927	1889068.73
360	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	2	Khitauli	MadhyaPradesh	2401901.054	1890314.191	4	Dadraudi	9.634750125	BTR	Khitauli	MadhyaPradesh	2397407.421	1885117.226
361	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	2	Khitauli	MadhyaPradesh	2401901.054	1890314.191	5	Dhaurkhoh	6.992013177	BTR	Khitauli	MadhyaPradesh	2396984.715	1882058.085
362	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	2	Khitauli	MadhyaPradesh	2401901.054	1890314.191	6	Dobha	7.075852003	BTR	Khitauli	MadhyaPradesh	2406664.844	1895210.56
363	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	2	Khitauli	MadhyaPradesh	2401901.054	1890314.191	8	Gadawah	6.440924829	BTR	Khitauli	MadhyaPradesh	2401220.524	1892531.65
364	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	2	Khitauli	MadhyaPradesh	2401901.054	1890314.191	9	Garhpuri	15.35728048	BTR	Khitauli	MadhyaPradesh	2403653.464	1896049.171
365	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	2	Khitauli	MadhyaPradesh	2401901.054	1890314.191	10	Mahaman	5.815437926	BTR	Khitauli	MadhyaPradesh	2401145.047	1894912.669
366	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	2	Khitauli	MadhyaPradesh	2401901.054	1890314.191	11	Medra	8.733203341	BTR	Khitauli	MadhyaPradesh	2399685.56	1884020.786
367	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	2	Khitauli	MadhyaPradesh	2401901.054	1890314.191	12	Ranchha	6.933743671	BTR	Khitauli	MadhyaPradesh	2405154.296	1898673.564
368	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	2	Khitauli	MadhyaPradesh	2401901.054	1890314.191	13	Salkhaniya	8.860630305	BTR	Khitauli	MadhyaPradesh	2407439.896	1892983.269
369	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	3	Magdhi	MadhyaPradesh	2388984.12	1901342.188	1	Badrehal	7.66797704	BTR	Magdhi	MadhyaPradesh	2390466.101	1898360.174
370	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	3	Magdhi	MadhyaPradesh	2388984.12	1901342.188	2	Dhamokhar	6.322241213	BTR	Magdhi	MadhyaPradesh	2393816.4	1895499.206
371	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	3	Magdhi	MadhyaPradesh	2388984.12	1901342.188	3	Goraiya	10.84184065	BTR	Magdhi	MadhyaPradesh	2383701.921	1904984.874
372	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	3	Magdhi	MadhyaPradesh	2388984.12	1901342.188	4	Khusarwah	8.277339098	BTR	Magdhi	MadhyaPradesh	2387525.738	1899201.554
373	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	3	Magdhi	MadhyaPradesh	2388984.12	1901342.188	5	Magdhi	13.54583704	BTR	Magdhi	MadhyaPradesh	2390107.298	1901098.782
374	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	3	Magdhi	MadhyaPradesh	2388984.12	1901342.188	8	Magdhi_N	8.060210726	BTR	Magdhi	MadhyaPradesh	2392515.398	1902913.721
375	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	3	Magdhi	MadhyaPradesh	2388984.12	1901342.188	6	Mardari	5.31475854	BTR	Magdhi	MadhyaPradesh	2394577.124	1898517.35
376	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	3	Magdhi	MadhyaPradesh	2388984.12	1901342.188	7	Milli	11.58059486	BTR	Magdhi	MadhyaPradesh	2386563.485	1903409.707
377	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	3	Magdhi	MadhyaPradesh	2388984.12	1901342.188	9	Milli_N	12.90323282	BTR	Magdhi	MadhyaPradesh	2390355.409	1904796.069
378	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	3	Magdhi	MadhyaPradesh	2388984.12	1901342.188	10	Pathari	5.572109752	BTR	Magdhi	MadhyaPradesh	2392493.506	1898158.047
379	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	3	Magdhi	MadhyaPradesh	2388984.12	1901342.188	11	Rohaniya	12.33972788	BTR	Magdhi	MadhyaPradesh	2384511.301	1900767.516
380	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	4	Panpatha	MadhyaPradesh	2423265.249	1909265.299	1	Baghdo	8.389341965	BTR	Panpatha	MadhyaPradesh	2423756.92	1911242.729
381	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	4	Panpatha	MadhyaPradesh	2423265.249	1909265.299	3	Chinsura	10.48874403	BTR	Panpatha	MadhyaPradesh	2423625.493	1904627.595
382	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	4	Panpatha	MadhyaPradesh	2423265.249	1909265.299	5	Chitrawan	8.552076757	BTR	Panpatha	MadhyaPradesh	2427344.358	1909708.229
383	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	4	Panpatha	MadhyaPradesh	2423265.249	1909265.299	6	Gangital	10.17070054	BTR	Panpatha	MadhyaPradesh	2421156.872	1909125.314
384	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	4	Panpatha	MadhyaPradesh	2423265.249	1909265.299	7	Hardi	9.962740378	BTR	Panpatha	MadhyaPradesh	2426962.608	1912075.042
385	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	4	Panpatha	MadhyaPradesh	2423265.249	1909265.299	8	Jhalwar	10.03699503	BTR	Panpatha	MadhyaPradesh	2424695.186	1908500.12
386	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	4	Panpatha	MadhyaPradesh	2423265.249	1909265.299	10	Kudri	10.57800894	BTR	Panpatha	MadhyaPradesh	2424685.206	1906342.929
387	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	4	Panpatha	MadhyaPradesh	2423265.249	1909265.299	11	Lakhnauti	9.20403779	BTR	Panpatha	MadhyaPradesh	2417603.065	1908586.301
388	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	4	Panpatha	MadhyaPradesh	2423265.249	1909265.299	999	Non-Forest	5.79985331	BTR	Panpatha	MadhyaPradesh	2419233.496	1907996.106
389	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	4	Panpatha	MadhyaPradesh	2423265.249	1909265.299	17	Sehra'A'	7.660608009	BTR	Panpatha	MadhyaPradesh	2424262.242	1914408.719
390	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	4	Panpatha	MadhyaPradesh	2423265.249	1909265.299	18	Sehra'B'	7.127480586	BTR	Panpatha	MadhyaPradesh	2425710.522	1915702.121
391	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	4	Panpatha	MadhyaPradesh	2423265.249	1909265.299	19	Sejwahi	8.652886991	BTR	Panpatha	MadhyaPradesh	2418975.289	1905638.869
392	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	5	Tala	MadhyaPradesh	2399590.917	1902945.995	1	Bathan	13.60227382	BTR	Tala	MadhyaPradesh	2398078.413	1903456.394
393	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	5	Tala	MadhyaPradesh	2399590.917	1902945.995	2	Bhadrashila	8.264607845	BTR	Tala	MadhyaPradesh	2402033.995	1899984.502
394	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	5	Tala	MadhyaPradesh	2399590.917	1902945.995	3	Damana	9.083951384	BTR	Tala	MadhyaPradesh	2401330.483	1908675.037
395	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	5	Tala	MadhyaPradesh	2399590.917	1902945.995	8	Gohari_N	10.91065199	BTR	Tala	MadhyaPradesh	2398573.991	1899688.175
396	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	5	Tala	MadhyaPradesh	2399590.917	1902945.995	10	Gohari_S	9.464957589	BTR	Tala	MadhyaPradesh	2395813.472	1900380.359
397	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	5	Tala	MadhyaPradesh	2399590.917	1902945.995	4	Hardiya	6.840438018	BTR	Tala	MadhyaPradesh	2398518.733	1906214.885
398	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	5	Tala	MadhyaPradesh	2399590.917	1902945.995	5	Kathli	9.050440334	BTR	Tala	MadhyaPradesh	2403037.379	1906681.089
399	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	5	Tala	MadhyaPradesh	2399590.917	1902945.995	6	Mahaman	9.321441837	BTR	Tala	MadhyaPradesh	2400238.452	1898404.874
400	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	5	Tala	MadhyaPradesh	2399590.917	1902945.995	7	Majhkheta	9.576448486	BTR	Tala	MadhyaPradesh	2394832.615	1903357.244
401	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	5	Tala	MadhyaPradesh	2399590.917	1902945.995	9	Sheshshaiya	7.142962774	BTR	Tala	MadhyaPradesh	2400933.158	1904273.684
402	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	5	Tala	MadhyaPradesh	2399590.917	1902945.995	11	Tala	10.94416432	BTR	Tala	MadhyaPradesh	2403018.794	1902768.935
403	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	7	Badrehal	12.02652662	BTR	Dhamokhar_Buffer	MadhyaPradesh	2387784.646	1895646.635
404	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	13	Badwar	13.19760883	BTR	Dhamokhar_Buffer	MadhyaPradesh	2385224.271	1895132.024
405	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	14	Bandha	9.407162545	BTR	Dhamokhar_Buffer	MadhyaPradesh	2382082.599	1894804.112
406	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	6	Barbaspur	9.372158435	BTR	Dhamokhar_Buffer	MadhyaPradesh	2390445.803	1891032.686
407	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	3	Bartarai	7.34909159	BTR	Dhamokhar_Buffer	MadhyaPradesh	2394934.844	1890600.273
408	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	12	Baskuta	20.56130278	BTR	Dhamokhar_Buffer	MadhyaPradesh	2377735.363	1903704.118
409	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	10	Chechariya	18.66671122	BTR	Dhamokhar_Buffer	MadhyaPradesh	2383616.841	1914964.881
410	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	5	Dadrauri	9.805685109	BTR	Dhamokhar_Buffer	MadhyaPradesh	2396505.936	1887795.492
411	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	1	Dhamokhar	12.15129828	BTR	Dhamokhar_Buffer	MadhyaPradesh	2391215.788	1894743.38
412	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	18	Dhaurkhoh	26.04958479	BTR	Dhamokhar_Buffer	MadhyaPradesh	2396262.674	1878105.638
413	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	20	Dubbar	8.580660972	BTR	Dhamokhar_Buffer	MadhyaPradesh	2395174.657	1875400.268
414	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	16	Goraia_A	18.37152272	BTR	Dhamokhar_Buffer	MadhyaPradesh	2380252.907	1906963.675
415	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	17	Goraia_B	22.12065456	BTR	Dhamokhar_Buffer	MadhyaPradesh	2378271.211	1899030.081
416	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	4	Mardari	13.08140068	BTR	Dhamokhar_Buffer	MadhyaPradesh	2396436.84	1895809.07
417	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	2	Parasi	11.15034422	BTR	Dhamokhar_Buffer	MadhyaPradesh	2398723.403	1894159.133
418	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	19	Patrei	17.41358352	BTR	Dhamokhar_Buffer	MadhyaPradesh	2401224.232	1878004.63
419	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	15	Pipariya	13.96418125	BTR	Dhamokhar_Buffer	MadhyaPradesh	2384679.929	1891104.87
420	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	8	Raipur	19.99734645	BTR	Dhamokhar_Buffer	MadhyaPradesh	2377771.701	1909773.756
421	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	11	Rohaniya	24.78182157	BTR	Dhamokhar_Buffer	MadhyaPradesh	2382314.997	1899342.747
422	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	6	Dhamokhar_Buffer	MadhyaPradesh	2386885.074	1896599.973	9	Sakariya	17.04958453	BTR	Dhamokhar_Buffer	MadhyaPradesh	2379995.718	1913622.974
423	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	2	Balhaur	10.72676645	BTR	Manpur_Buffer	MadhyaPradesh	2416897.282	1919408.231
424	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	5	Barkhera	17.43997677	BTR	Manpur_Buffer	MadhyaPradesh	2397742.927	1914073.479
425	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	6	Bijauri	16.4356233	BTR	Manpur_Buffer	MadhyaPradesh	2402894.765	1916995.584
426	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	25	Chhapraur	18.71682682	BTR	Manpur_Buffer	MadhyaPradesh	2417570.26	1912910.651
427	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	20	Churaha	15.03581001	BTR	Manpur_Buffer	MadhyaPradesh	2389658.684	1921876.429
428	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	9	Damna	15.07528316	BTR	Manpur_Buffer	MadhyaPradesh	2401157.456	1910703.312
429	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	3	Dewari	25.40534505	BTR	Manpur_Buffer	MadhyaPradesh	2401812.192	1912449.761
430	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	23	Gadrola	13.23521907	BTR	Manpur_Buffer	MadhyaPradesh	2379767.45	1918589.231
431	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	15	Gobratal	12.1602826	BTR	Manpur_Buffer	MadhyaPradesh	2396792.17	1918650.525
432	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	12	Gurwahi	16.49494941	BTR	Manpur_Buffer	MadhyaPradesh	2406699.328	1899988.991
433	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	24	Kathai	6.879738457	BTR	Manpur_Buffer	MadhyaPradesh	2383086.684	1917643.21
434	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	19	Kelhari	12.14878351	BTR	Manpur_Buffer	MadhyaPradesh	2393611.773	1922683.582
435	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	22	Khama	14.41745673	BTR	Manpur_Buffer	MadhyaPradesh	2382631.664	1920763.285
436	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	18	Khichkiri	15.34213657	BTR	Manpur_Buffer	MadhyaPradesh	2387246.971	1924028.706
437	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	17	Khohari	14.25679807	BTR	Manpur_Buffer	MadhyaPradesh	2394029.351	1918947.521
438	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	11	Kuchwahi	16.64571227	BTR	Manpur_Buffer	MadhyaPradesh	2406776.847	1904270.132
439	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	7	Majhakheta	13.29289688	BTR	Manpur_Buffer	MadhyaPradesh	2397027.178	1908279.048
440	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	14	Majhauli	12.67525666	BTR	Manpur_Buffer	MadhyaPradesh	2398640.067	1921807.629
441	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	10	Mala	20.02058687	BTR	Manpur_Buffer	MadhyaPradesh	2407035.524	1907381.937
442	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	1	Manpur	12.19232182	BTR	Manpur_Buffer	MadhyaPradesh	2406638.21	1910868.269
443	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	26	Navgama	6.512188312	BTR	Manpur_Buffer	MadhyaPradesh	2421560.729	1912996.601
444	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	16	Nyusi	13.06426773	BTR	Manpur_Buffer	MadhyaPradesh	2390980.287	1919082.669
445	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	27	Patehara_A	13.48283972	BTR	Manpur_Buffer	MadhyaPradesh	2412469.691	1907159.124
446	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	28	Patehara_B	15.95957306	BTR	Manpur_Buffer	MadhyaPradesh	2414027.413	1910644.378
447	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	21	Patparha	14.84516828	BTR	Manpur_Buffer	MadhyaPradesh	2385807.073	1920317.244
448	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	13	Samarkoini	15.57450335	BTR	Manpur_Buffer	MadhyaPradesh	2392845.542	1915693.215
449	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	7	Manpur_Buffer	MadhyaPradesh	2400339.103	1914472.587	4	Semra	19.74538711	BTR	Manpur_Buffer	MadhyaPradesh	2413153.377	1914372.274
450	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	8	Panpatha_Buffer	MadhyaPradesh	2419777.537	1899637.834	6	Amarpur	5.667667169	BTR	Panpatha_Buffer	MadhyaPradesh	2435070.481	1892334.553
451	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	8	Panpatha_Buffer	MadhyaPradesh	2419777.537	1899637.834	23	BaraghatiTola	9.172455924	BTR	Panpatha_Buffer	MadhyaPradesh	2433002.48	1920125.872
452	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	8	Panpatha_Buffer	MadhyaPradesh	2419777.537	1899637.834	22	Ghorighat	12.34786204	BTR	Panpatha_Buffer	MadhyaPradesh	2427887.93	1920203.647
453	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	8	Panpatha_Buffer	MadhyaPradesh	2419777.537	1899637.834	14	Jajagarh	8.020339403	BTR	Panpatha_Buffer	MadhyaPradesh	2418269.978	1888958.268
454	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	8	Panpatha_Buffer	MadhyaPradesh	2419777.537	1899637.834	24	Jamuniha	13.59088406	BTR	Panpatha_Buffer	MadhyaPradesh	2430620.512	1919931.771
455	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	8	Panpatha_Buffer	MadhyaPradesh	2419777.537	1899637.834	5	Jhal-Jhalwar	3.830031972	BTR	Panpatha_Buffer	MadhyaPradesh	2427724.319	1906813.898
456	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	8	Panpatha_Buffer	MadhyaPradesh	2419777.537	1899637.834	11	Karaundiya	23.77874754	BTR	Panpatha_Buffer	MadhyaPradesh	2415977.15	1892183.096
457	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	8	Panpatha_Buffer	MadhyaPradesh	2419777.537	1899637.834	20	Kharibadi	13.76473689	BTR	Panpatha_Buffer	MadhyaPradesh	2428780.504	1915569.287
458	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	8	Panpatha_Buffer	MadhyaPradesh	2419777.537	1899637.834	21	Khusariya	11.48736582	BTR	Panpatha_Buffer	MadhyaPradesh	2425362.729	1918527.747
459	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	8	Panpatha_Buffer	MadhyaPradesh	2419777.537	1899637.834	2	Paljha_N	9.130628917	BTR	Panpatha_Buffer	MadhyaPradesh	2423698.378	1901636.573
460	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	8	Panpatha_Buffer	MadhyaPradesh	2419777.537	1899637.834	1	Paljha_S	12.48739819	BTR	Panpatha_Buffer	MadhyaPradesh	2420969.197	1900231.405
461	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	8	Panpatha_Buffer	MadhyaPradesh	2419777.537	1899637.834	3	Pitaur	14.36879913	BTR	Panpatha_Buffer	MadhyaPradesh	2423077.217	1894622.503
462	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	8	Panpatha_Buffer	MadhyaPradesh	2419777.537	1899637.834	13	Salkhaniya	7.953682823	BTR	Panpatha_Buffer	MadhyaPradesh	2408424.789	1890750.163
463	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	8	Panpatha_Buffer	MadhyaPradesh	2419777.537	1899637.834	12	Sukhdas	19.58337438	BTR	Panpatha_Buffer	MadhyaPradesh	2419750.636	1892602.576
464	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	8	Panpatha_Buffer	MadhyaPradesh	2419777.537	1899637.834	25	Waturawah	7.074653966	BTR	Panpatha_Buffer	MadhyaPradesh	2429180.477	1900099.746
465	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	9	Pataur	MadhyaPradesh	2414704.829	1899615.365	5	Bagaiha	10.30987489	BTR	Pataur	MadhyaPradesh	2409719.735	1898216.799
466	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	9	Pataur	MadhyaPradesh	2414704.829	1899615.365	6	Bamera	13.32952179	BTR	Pataur	MadhyaPradesh	2411518.312	1897195.003
467	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	9	Pataur	MadhyaPradesh	2414704.829	1899615.365	12	Chilhari	11.58306081	BTR	Pataur	MadhyaPradesh	2418774.088	1899074.966
468	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	9	Pataur	MadhyaPradesh	2414704.829	1899615.365	10	Ganjraha	9.74055625	BTR	Pataur	MadhyaPradesh	2417838.133	1896006.105
469	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	9	Pataur	MadhyaPradesh	2414704.829	1899615.365	9	Kaseru	14.60266971	BTR	Pataur	MadhyaPradesh	2415205.86	1898487.319
470	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	9	Pataur	MadhyaPradesh	2414704.829	1899615.365	13	Majhauli	9.822781065	BTR	Pataur	MadhyaPradesh	2415011.95	1901398.039
471	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	9	Pataur	MadhyaPradesh	2414704.829	1899615.365	999	Non-Forest	7.344445482	BTR	Pataur	MadhyaPradesh	2417354.001	1901393.488
472	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	9	Pataur	MadhyaPradesh	2414704.829	1899615.365	14	Panpatha	10.84229145	BTR	Pataur	MadhyaPradesh	2418876.65	1902847.3
473	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	9	Pataur	MadhyaPradesh	2414704.829	1899615.365	1	Pataur_A	10.29847393	BTR	Pataur	MadhyaPradesh	2413459.277	1905904.636
474	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	9	Pataur	MadhyaPradesh	2414704.829	1899615.365	2	Pataur_B	9.417603331	BTR	Pataur	MadhyaPradesh	2415536.302	1904716.244
475	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	9	Pataur	MadhyaPradesh	2414704.829	1899615.365	3	Pataur_C	8.869222986	BTR	Pataur	MadhyaPradesh	2412239.137	1902261.931
476	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	9	Pataur	MadhyaPradesh	2414704.829	1899615.365	4	Pataur_D	9.414846072	BTR	Pataur	MadhyaPradesh	2409405.93	1901500.312
477	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	9	Pataur	MadhyaPradesh	2414704.829	1899615.365	11	Pitaur	8.382659133	BTR	Pataur	MadhyaPradesh	2421779.278	1896372.527
478	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	9	Pataur	MadhyaPradesh	2414704.829	1899615.365	7	Salkhniya	8.173334092	BTR	Pataur	MadhyaPradesh	2410786.067	1893025.587
479	61	BTR	14	MadhyaPradesh	2401838.1	1903731.367	BTR	9	Pataur	MadhyaPradesh	2414704.829	1899615.365	8	UmariaBakeli	7.683545358	BTR	Pataur	MadhyaPradesh	2413491.121	1895186.988
480	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	26	Amdih	0.740081206	North_Shahdol	Amjhor	Madhya_Pradesh	2420212.416	1948286.806
481	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	1	Badkadol	3.733379206	North_Shahdol	Amjhor	Madhya_Pradesh	2402806.057	1953078.77
482	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	2	Bansa	7.018748142	North_Shahdol	Amjhor	Madhya_Pradesh	2409085.262	1946208.356
483	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	3	Bansukli	13.7961497	North_Shahdol	Amjhor	Madhya_Pradesh	2414829.034	1962505.258
484	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	4	Basnagari	14.39294138	North_Shahdol	Amjhor	Madhya_Pradesh	2410601.839	1943530.263
485	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	5	Chandoula	10.44625112	North_Shahdol	Amjhor	Madhya_Pradesh	2392974.343	1959807.616
486	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	7	Charhet	7.653716673	North_Shahdol	Amjhor	Madhya_Pradesh	2409390.219	1964570.623
487	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	6	Chitron	12.57860755	North_Shahdol	Amjhor	Madhya_Pradesh	2406766.307	1950685.431
488	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	8	Dholar	4.374406471	North_Shahdol	Amjhor	Madhya_Pradesh	2402958.255	1940606.711
489	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	9	Domhar	16.4632144	North_Shahdol	Amjhor	Madhya_Pradesh	2414810.921	1958894.758
490	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	11	Jhara	4.770255199	North_Shahdol	Amjhor	Madhya_Pradesh	2401771.121	1948965.192
491	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	12	Keet	9.903214229	North_Shahdol	Amjhor	Madhya_Pradesh	2410856.477	1949549.743
492	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	15	Kubra	10.25769747	North_Shahdol	Amjhor	Madhya_Pradesh	2398263.772	1942137.24
493	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	16	Kudri	11.24904357	North_Shahdol	Amjhor	Madhya_Pradesh	2404475.889	1957388.455
494	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	17	Mahuatola	18.84725004	North_Shahdol	Amjhor	Madhya_Pradesh	2404630.478	1966522.749
495	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	18	Masiyari	8.5467797	North_Shahdol	Amjhor	Madhya_Pradesh	2407274.161	1947563.213
496	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	19	Mohni	4.669583532	North_Shahdol	Amjhor	Madhya_Pradesh	2405309.576	1944366.984
497	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	20	Nagarvah	7.856113506	North_Shahdol	Amjhor	Madhya_Pradesh	2406254.637	1940191.825
498	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	21	Pahadiya	21.24423192	North_Shahdol	Amjhor	Madhya_Pradesh	2417954.183	1956643.616
499	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	22	Pondi	7.597402074	North_Shahdol	Amjhor	Madhya_Pradesh	2409984.024	1956282.525
500	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	23	Rampur	11.12016629	North_Shahdol	Amjhor	Madhya_Pradesh	2408787.775	1953616.655
501	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	25	Sichoura	19.39919452	North_Shahdol	Amjhor	Madhya_Pradesh	2413751.28	1951651.005
502	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	24	Sidhi	12.52985504	North_Shahdol	Amjhor	Madhya_Pradesh	2402170.728	1961869.558
503	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	1	Amjhor	Madhya_Pradesh	2408979.277	1953986.772	27	Talikala	13.79170282	North_Shahdol	Amjhor	Madhya_Pradesh	2419141.929	1951992.992
504	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	1	Akhetpur	8.414263403	North_Shahdol	Beohari_East	Madhya_Pradesh	2440600.29	1948314.385
505	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	2	Anahra	7.144553747	North_Shahdol	Beohari_East	Madhya_Pradesh	2453769.294	1935165.247
506	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	20	Bedra	16.12030099	North_Shahdol	Beohari_East	Madhya_Pradesh	2434466.889	1934137.202
507	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	5	Boddiha	7.865504237	North_Shahdol	Beohari_East	Madhya_Pradesh	2450932.615	1947512.227
508	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	6	Budwa	6.843158381	North_Shahdol	Beohari_East	Madhya_Pradesh	2460696.23	1943691.212
509	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	21	Charka	0.03718797	North_Shahdol	Beohari_East	Madhya_Pradesh	2443635.396	1932495.036
510	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	8	Deoraon	8.630809373	North_Shahdol	Beohari_East	Madhya_Pradesh	2443490.041	1946129.222
511	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	7	Deori	9.912859843	North_Shahdol	Beohari_East	Madhya_Pradesh	2453004.093	1944430.517
512	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	9	Karoundia	7.253559747	North_Shahdol	Beohari_East	Madhya_Pradesh	2450508.919	1939057.458
513	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	19	Kharpa	5.788410292	North_Shahdol	Beohari_East	Madhya_Pradesh	2442567.61	1942554.844
514	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	11	Magardaha	13.01636478	North_Shahdol	Beohari_East	Madhya_Pradesh	2455548.702	1945319.47
515	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	12	Mau	3.352534115	North_Shahdol	Beohari_East	Madhya_Pradesh	2444012.857	1938659.863
516	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	22	Naudhiya	2.005157492	North_Shahdol	Beohari_East	Madhya_Pradesh	2437696.894	1929975.433
517	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	23	Noudiha	13.55677024	North_Shahdol	Beohari_East	Madhya_Pradesh	2435916.59	1929153.852
518	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	13	Papredi	8.611286629	North_Shahdol	Beohari_East	Madhya_Pradesh	2448608.782	1942189.016
519	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	24	Sannausi_1	0.497335424	North_Shahdol	Beohari_East	Madhya_Pradesh	2430540.524	1948134.091
520	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	25	Sannausi_2	0.346826812	North_Shahdol	Beohari_East	Madhya_Pradesh	2430207.391	1947398.109
521	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	15	Sarvahikala	6.042650519	North_Shahdol	Beohari_East	Madhya_Pradesh	2442562.727	1949391.518
522	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	16	Sarvahikhurd	6.200174013	North_Shahdol	Beohari_East	Madhya_Pradesh	2445758.726	1948876.926
523	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	17	Sehra	8.672069832	North_Shahdol	Beohari_East	Madhya_Pradesh	2452247.456	1937185.759
524	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	18	Sejhari	3.745144993	North_Shahdol	Beohari_East	Madhya_Pradesh	2449281.732	1934225.551
525	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	14	Shakhi	4.764824991	North_Shahdol	Beohari_East	Madhya_Pradesh	2441386.085	1939179.076
526	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	2	Beohari_East	Madhya_Pradesh	2445826.873	1940411.163	26	Sukha	7.565855264	North_Shahdol	Beohari_East	Madhya_Pradesh	2439799.52	1933343.839
527	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	3	Godawal	Madhya_Pradesh	2428342.651	1932999.381	1	Balaudi	9.235690543	North_Shahdol	Godawal	Madhya_Pradesh	2424273.839	1948585.312
528	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	3	Godawal	Madhya_Pradesh	2428342.651	1932999.381	2	Chhataini	17.25897103	North_Shahdol	Godawal	Madhya_Pradesh	2434270.689	1926010.587
529	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	3	Godawal	Madhya_Pradesh	2428342.651	1932999.381	3	Dhanera	11.58777621	North_Shahdol	Godawal	Madhya_Pradesh	2427463.856	1925656.674
530	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	3	Godawal	Madhya_Pradesh	2428342.651	1932999.381	6	Ghorsa	14.7398553	North_Shahdol	Godawal	Madhya_Pradesh	2426883.352	1933578.021
531	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	3	Godawal	Madhya_Pradesh	2428342.651	1932999.381	16	Godawal	11.21325424	North_Shahdol	Godawal	Madhya_Pradesh	2430993.588	1938573.11
532	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	3	Godawal	Madhya_Pradesh	2428342.651	1932999.381	7	Hidwar	10.74399248	North_Shahdol	Godawal	Madhya_Pradesh	2424911.515	1929902.536
533	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	3	Godawal	Madhya_Pradesh	2428342.651	1932999.381	8	Kuthiya	5.289391364	North_Shahdol	Godawal	Madhya_Pradesh	2432474.965	1934943.53
534	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	3	Godawal	Madhya_Pradesh	2428342.651	1932999.381	11	Palha	10.6130795	North_Shahdol	Godawal	Madhya_Pradesh	2422757.725	1950784.411
535	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	3	Godawal	Madhya_Pradesh	2428342.651	1932999.381	10	Pathrahta_North	8.164213159	North_Shahdol	Godawal	Madhya_Pradesh	2430720.24	1924050.794
536	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	3	Godawal	Madhya_Pradesh	2428342.651	1932999.381	14	Pathrahta_South	13.19666209	North_Shahdol	Godawal	Madhya_Pradesh	2430526.733	1927425.787
537	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	3	Godawal	Madhya_Pradesh	2428342.651	1932999.381	12	Pondi	14.14141057	North_Shahdol	Godawal	Madhya_Pradesh	2423885.736	1926692.365
538	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	3	Godawal	Madhya_Pradesh	2428342.651	1932999.381	13	Sannausi	4.718592136	North_Shahdol	Godawal	Madhya_Pradesh	2428986.542	1950539.885
539	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	3	Godawal	Madhya_Pradesh	2428342.651	1932999.381	15	Ufri	19.35112796	North_Shahdol	Godawal	Madhya_Pradesh	2429545.112	1931862.46
540	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	1	Amdih	7.594918665	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2419103.856	1945672.364
541	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	2	Banchachr	18.56431748	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2413864.334	1924109.938
542	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	3	Batoudi	9.672571512	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2414352.803	1945675.583
543	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	27	Bhattu-1	6.23501954	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2418597.355	1941792.335
544	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	26	Bhattu_2	4.55911883	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2418407.679	1937946.323
545	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	6	Chhunda	4.673610904	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2416701.225	1939797.523
546	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	7	Deora	13.07662111	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2400403.366	1929939.853
547	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	9	Ghiyar	17.9778971	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2419179.456	1929181.434
548	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	28	Hudarha	9.179193366	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2420850.892	1933668.153
549	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	10	Jaisinghnagar	10.90356106	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2399668.749	1935766.894
550	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	8	Jhiriya	7.910809856	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2422040.37	1945482.868
551	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	11	Kalleh	15.45240051	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2424674.232	1940031.147
552	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	12	Kanarikhurd	6.706663324	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2406221.358	1936159.037
553	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	24	Karki	10.38058151	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2413819.244	1942119.615
554	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	14	Katira	7.635915889	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2398601.928	1932941.963
555	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	15	Kothigarh	9.811143618	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2416134.486	1931705.478
556	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	13	Kouasari	9.08911021	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2402675.298	1935445.59
557	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	16	Lakhanpur	17.61620863	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2402634.942	1927375.46
558	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	17	Lakhanvar	11.47975385	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2412807.744	1936146.964
559	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	18	Malouti	5.28221387	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2415644.675	1947829.353
560	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	29	Masira_1	3.466330499	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2407082.612	1922999.992
561	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	30	Masira_2	4.847973613	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2408260.466	1923649.21
562	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	20	Nadna	18.24809672	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2413180.548	1929748.744
563	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	21	Pathrapani	4.482282492	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2411440.984	1943742.81
564	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	25	Semra	8.397820694	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2416669.631	1935410.522
565	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	23	Thengrha	12.66942095	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2409723.059	1930130.578
566	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	4	Jaisinghnagar	Madhya_Pradesh	2412551.638	1934327.804	31	Vijha_1	4.936305896	North_Shahdol	Jaisinghnagar	Madhya_Pradesh	2421997.697	1936107.774
567	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	24	Alahra_South	11.1542371	North_Shahdol	Beohari_West	Madhya_Pradesh	2436796.239	1918574.249
568	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	16	Alhara_North	13.56888333	North_Shahdol	Beohari_West	Madhya_Pradesh	2440530.503	1919180.84
569	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	3	Chachai	16.32264627	North_Shahdol	Beohari_West	Madhya_Pradesh	2451272.167	1926618.83
570	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	4	Charka	12.22094172	North_Shahdol	Beohari_West	Madhya_Pradesh	2443877.27	1930037.535
571	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	6	Dhandhokui	11.45592059	North_Shahdol	Beohari_West	Madhya_Pradesh	2442097.298	1924652.704
572	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	8	Jhiriya	7.879671512	North_Shahdol	Beohari_West	Madhya_Pradesh	2450754.862	1931785.142
573	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	9	Karhi	6.428293496	North_Shahdol	Beohari_West	Madhya_Pradesh	2448353.547	1931424.097
574	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	10	Khaira	6.25509922	North_Shahdol	Beohari_West	Madhya_Pradesh	2435147.582	1923738.702
575	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	11	Kharhar	13.76206564	North_Shahdol	Beohari_West	Madhya_Pradesh	2442882.385	1921147.041
576	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	23	Madai	13.77332025	North_Shahdol	Beohari_West	Madhya_Pradesh	2445273.822	1924840.242
577	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	25	Narvar	2.636090756	North_Shahdol	Beohari_West	Madhya_Pradesh	2446692.979	1917105.969
578	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	15	Nipaniya	6.258068251	North_Shahdol	Beohari_West	Madhya_Pradesh	2438695.248	1913393.652
579	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	26	Papaundh	1.782494447	North_Shahdol	Beohari_West	Madhya_Pradesh	2432958.979	1917078.836
580	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	27	Papoundh	4.200100484	North_Shahdol	Beohari_West	Madhya_Pradesh	2433833.873	1913597.756
581	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	22	Shahagarh	9.690179035	North_Shahdol	Beohari_West	Madhya_Pradesh	2447947.584	1928475.607
582	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	17	Spata	8.154651861	North_Shahdol	Beohari_West	Madhya_Pradesh	2442008.978	1908118.869
583	62	North_Shahdol	14	Madhya_Pradesh	2424297.114	1938370.936	North_Shahdol	5	Beohari_West	Madhya_Pradesh	2443193.847	1923020.481	20	Tikhwa	11.31338407	North_Shahdol	Beohari_West	Madhya_Pradesh	2439053.079	1923578.067
584	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	1	Burhar	Madhya_Pradesh	2339136.316	1950757.274	1	Amlai	5.011146735	South_Shahdol	Burhar	Madhya_Pradesh	2345496.594	1957931.502
585	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	1	Burhar	Madhya_Pradesh	2339136.316	1950757.274	2	Arjhuli	7.050078356	South_Shahdol	Burhar	Madhya_Pradesh	2335696.278	1949141.569
586	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	1	Burhar	Madhya_Pradesh	2339136.316	1950757.274	3	Bamhori	5.420959487	South_Shahdol	Burhar	Madhya_Pradesh	2342803.03	1955808.673
587	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	1	Burhar	Madhya_Pradesh	2339136.316	1950757.274	4	Dhanpuri	8.618289195	South_Shahdol	Burhar	Madhya_Pradesh	2343808.72	1953631.264
588	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	1	Burhar	Madhya_Pradesh	2339136.316	1950757.274	5	Gopalpur	4.043314772	South_Shahdol	Burhar	Madhya_Pradesh	2347171.483	1948967.32
589	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	1	Burhar	Madhya_Pradesh	2339136.316	1950757.274	6	Hardi	9.464331189	South_Shahdol	Burhar	Madhya_Pradesh	2337481.674	1936195.92
590	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	1	Burhar	Madhya_Pradesh	2339136.316	1950757.274	12	Karkati	5.023836727	South_Shahdol	Burhar	Madhya_Pradesh	2343468.626	1950129.739
591	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	1	Burhar	Madhya_Pradesh	2339136.316	1950757.274	7	Khamahriya	3.228119838	South_Shahdol	Burhar	Madhya_Pradesh	2333723.995	1957766.01
592	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	1	Burhar	Madhya_Pradesh	2339136.316	1950757.274	8	Khoh	9.441220867	South_Shahdol	Burhar	Madhya_Pradesh	2331684.671	1956539.938
593	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	1	Burhar	Madhya_Pradesh	2339136.316	1950757.274	9	Kodwar	6.844801649	South_Shahdol	Burhar	Madhya_Pradesh	2336823.342	1944534.926
594	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	1	Burhar	Madhya_Pradesh	2339136.316	1950757.274	10	Patna	8.779518256	South_Shahdol	Burhar	Madhya_Pradesh	2338025.759	1955561.492
595	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	1	Burhar	Madhya_Pradesh	2339136.316	1950757.274	11	Sironja	4.045817888	South_Shahdol	Burhar	Madhya_Pradesh	2340878.315	1949442.942
596	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	1	Bareli	7.06412778	South_Shahdol	Gohparu	Madhya_Pradesh	2377193.167	1945399.228
597	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	2	Barmaniya	1.814304012	South_Shahdol	Gohparu	Madhya_Pradesh	2373981.469	1942398.63
598	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	3	Barutara	9.710651865	South_Shahdol	Gohparu	Madhya_Pradesh	2382838.164	1960283.052
599	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	4	Bela	7.443142273	South_Shahdol	Gohparu	Madhya_Pradesh	2386093.07	1957269.913
600	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	5	Beliya	9.1617496	South_Shahdol	Gohparu	Madhya_Pradesh	2386031.643	1955089.182
601	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	6	Bhaga	4.703555733	South_Shahdol	Gohparu	Madhya_Pradesh	2365445.581	1952537.302
602	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	7	Budhanwah	11.5984424	South_Shahdol	Gohparu	Madhya_Pradesh	2380849.693	1948837.011
603	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	8	Chandela	8.75190028	South_Shahdol	Gohparu	Madhya_Pradesh	2385618.095	1932621.197
604	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	9	Chuhiri	3.98640302	South_Shahdol	Gohparu	Madhya_Pradesh	2376773.999	1957777.947
605	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	10	Devri	12.03633244	South_Shahdol	Gohparu	Madhya_Pradesh	2362469.325	1953592.539
606	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	11	Dhangawan	7.565866212	South_Shahdol	Gohparu	Madhya_Pradesh	2362016.775	1950013.206
607	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	12	Dhonha	7.531192272	South_Shahdol	Gohparu	Madhya_Pradesh	2384137.698	1946715.681
608	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	15	Dhuriyadol_E	9.535595166	South_Shahdol	Gohparu	Madhya_Pradesh	2368542.199	1953076.274
609	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	14	Dhuriyadol_W	9.403980806	South_Shahdol	Gohparu	Madhya_Pradesh	2368946.926	1948245.164
610	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	13	Diyapipar	8.860675948	South_Shahdol	Gohparu	Madhya_Pradesh	2375067.472	1936286.095
611	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	16	Gohparu	6.319729769	South_Shahdol	Gohparu	Madhya_Pradesh	2382010.987	1946193.487
612	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	17	Karua	9.142645815	South_Shahdol	Gohparu	Madhya_Pradesh	2382154.477	1939173.856
613	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	18	Khairwana	9.0933566	South_Shahdol	Gohparu	Madhya_Pradesh	2372367.089	1946189.111
614	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	19	Kodar	8.629324634	South_Shahdol	Gohparu	Madhya_Pradesh	2381880.175	1953367.856
615	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	20	Kudri	8.296427632	South_Shahdol	Gohparu	Madhya_Pradesh	2381668.072	1957374.242
616	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	21	Lafda_Part	6.445449634	South_Shahdol	Gohparu	Madhya_Pradesh	2365933.354	1955494.27
617	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	22	Lamar	7.824672961	South_Shahdol	Gohparu	Madhya_Pradesh	2383709.578	1944039.11
618	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	23	Majholi	6.173268604	South_Shahdol	Gohparu	Madhya_Pradesh	2380209.678	1951714.224
619	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	27	Pailwah	8.850157466	South_Shahdol	Gohparu	Madhya_Pradesh	2378361.147	1933090.025
620	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	24	Patori	10.52600497	South_Shahdol	Gohparu	Madhya_Pradesh	2383706.133	1935410.368
621	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	25	Sakariya	12.57274613	South_Shahdol	Gohparu	Madhya_Pradesh	2384069.703	1930570.549
622	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	28	Semra	3.344206865	South_Shahdol	Gohparu	Madhya_Pradesh	2386124.473	1937856.285
623	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	2	Gohparu	Madhya_Pradesh	2377626.276	1946595.454	26	Sontola	7.649680687	South_Shahdol	Gohparu	Madhya_Pradesh	2371785.924	1943745.638
624	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	1	Badodi	15.18174646	South_Shahdol	Jaitpur	Madhya_Pradesh	2364505.676	1960307.231
625	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	2	Bahgad	6.202068613	South_Shahdol	Jaitpur	Madhya_Pradesh	2364360.922	1966907.555
626	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	3	Bairag_Nagpura	8.53660716	South_Shahdol	Jaitpur	Madhya_Pradesh	2384242.902	1978398.663
627	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	4	Bansipatera	4.072436871	South_Shahdol	Jaitpur	Madhya_Pradesh	2352311.319	1956828.828
628	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	17	Bhatiya	8.097612659	South_Shahdol	Jaitpur	Madhya_Pradesh	2373303.009	1974508.603
629	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	6	Biruhli_Devri	3.438445729	South_Shahdol	Jaitpur	Madhya_Pradesh	2358406.097	1955646.297
630	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	5	Chakodia	7.299357893	South_Shahdol	Jaitpur	Madhya_Pradesh	2369453.857	1971886.976
631	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	7	Ghorwe	5.13194943	South_Shahdol	Jaitpur	Madhya_Pradesh	2360617.03	1958761.842
632	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	8	Jaitpur	5.898643993	South_Shahdol	Jaitpur	Madhya_Pradesh	2381328.991	1970167.097
633	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	9	Kadodi	9.744034455	South_Shahdol	Jaitpur	Madhya_Pradesh	2381555.381	1980730.821
634	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	10	Kumhedin	19.81944181	South_Shahdol	Jaitpur	Madhya_Pradesh	2373038.23	1983277.018
635	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	11	Lafda	10.9545662	South_Shahdol	Jaitpur	Madhya_Pradesh	2366010.754	1958189.609
636	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	12	Malya	9.794199677	South_Shahdol	Jaitpur	Madhya_Pradesh	2369525.012	1963824.131
637	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	13	Musra	13.70517503	South_Shahdol	Jaitpur	Madhya_Pradesh	2378117.153	1982183.575
638	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	14	Nemuha	7.105257312	South_Shahdol	Jaitpur	Madhya_Pradesh	2359450.704	1961748.747
639	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	15	Padmaniya	7.362401452	South_Shahdol	Jaitpur	Madhya_Pradesh	2369742.446	1968655.079
640	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	3	Jaitpur	Madhya_Pradesh	2370968.709	1970042.401	18	Rasmohni	9.699845684	South_Shahdol	Jaitpur	Madhya_Pradesh	2375742.469	1963215.768
641	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	1	Baheradol	9.382818768	South_Shahdol	Keshwahi	Madhya_Pradesh	2362930.005	1977932.882
642	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	2	Bhumkar	16.78877386	South_Shahdol	Keshwahi	Madhya_Pradesh	2369430.947	1990186.708
643	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	3	Chatai	14.2263226	South_Shahdol	Keshwahi	Madhya_Pradesh	2381048.121	1989407.8
644	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	4	Dhummadol	6.810907454	South_Shahdol	Keshwahi	Madhya_Pradesh	2366815.957	1979938.453
645	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	21	Dummadol	4.009532935	South_Shahdol	Keshwahi	Madhya_Pradesh	2366766.537	1978511.332
646	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	5	Girwa	3.18121492	South_Shahdol	Keshwahi	Madhya_Pradesh	2354000.983	1973984.188
647	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	6	Godaru	9.88018865	South_Shahdol	Keshwahi	Madhya_Pradesh	2363873.541	1990976.08
648	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	7	Jhink	12.12577387	South_Shahdol	Keshwahi	Madhya_Pradesh	2373703.663	1990492.669
649	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	8	Karrawan	5.78157263	South_Shahdol	Keshwahi	Madhya_Pradesh	2361281.318	1973803.092
650	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	10	Khamhariya	14.45419633	South_Shahdol	Keshwahi	Madhya_Pradesh	2375606.397	1987785.492
651	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	11	Kopra	12.23812561	South_Shahdol	Keshwahi	Madhya_Pradesh	2365860.598	1989139.786
652	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	12	Kudeli	7.736382522	South_Shahdol	Keshwahi	Madhya_Pradesh	2369652.121	1976641.877
653	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	20	Majtoliya	20.67724043	South_Shahdol	Keshwahi	Madhya_Pradesh	2371969.593	1979496.218
654	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	13	Mamra	5.196312482	South_Shahdol	Keshwahi	Madhya_Pradesh	2373597.308	1993701.568
655	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	14	Mithouli	12.18218249	South_Shahdol	Keshwahi	Madhya_Pradesh	2379929.037	1985477.987
656	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	15	Premnagar	6.720587761	South_Shahdol	Keshwahi	Madhya_Pradesh	2368446.722	1982471.842
657	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	16	Rampur	8.928579252	South_Shahdol	Keshwahi	Madhya_Pradesh	2350576.486	1969836.413
658	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	17	Rupola	3.862386777	South_Shahdol	Keshwahi	Madhya_Pradesh	2363148.446	1984261.706
659	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	22	Rupoula	3.451990354	South_Shahdol	Keshwahi	Madhya_Pradesh	2366206.538	1982975.281
660	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	23	Sakra	5.291288466	South_Shahdol	Keshwahi	Madhya_Pradesh	2357677.325	1977823.296
661	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	18	Tendutola	13.0072153	South_Shahdol	Keshwahi	Madhya_Pradesh	2381000.869	1992395.855
662	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	4	Keshwahi	Madhya_Pradesh	2369844.276	1984596.019	19	Tengha	14.46982551	South_Shahdol	Keshwahi	Madhya_Pradesh	2368272.71	1985459.226
663	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	1	Ankuri	8.531796657	South_Shahdol	Khannoudhi	Madhya_Pradesh	2388712.03	1929358.425
664	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	3	Barha	8.289612601	South_Shahdol	Khannoudhi	Madhya_Pradesh	2396319.507	1938228.944
665	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	2	Barkoda	6.106199063	South_Shahdol	Khannoudhi	Madhya_Pradesh	2391212.734	1949288.015
666	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	4	Bishanpurwa	4.067405225	South_Shahdol	Khannoudhi	Madhya_Pradesh	2394369.011	1926456.661
667	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	5	Chandola	10.17241161	South_Shahdol	Khannoudhi	Madhya_Pradesh	2388142.509	1935936.625
668	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	6	Duladar	8.931983133	South_Shahdol	Khannoudhi	Madhya_Pradesh	2385818.723	1948177.163
669	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	7	Jannodi	7.056658312	South_Shahdol	Khannoudhi	Madhya_Pradesh	2397694.348	1931165.383
670	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	8	Karkat	15.23118174	South_Shahdol	Khannoudhi	Madhya_Pradesh	2392374.377	1926873.413
671	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	9	Khand	8.662520184	South_Shahdol	Khannoudhi	Madhya_Pradesh	2394358.442	1932879.851
672	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	10	Khannoudhi	8.812018226	South_Shahdol	Khannoudhi	Madhya_Pradesh	2391035.086	1941108.486
673	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	11	Khohri	12.48029721	South_Shahdol	Khannoudhi	Madhya_Pradesh	2391613.181	1932106.466
674	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	12	Lodhi	6.426321343	South_Shahdol	Khannoudhi	Madhya_Pradesh	2393942.494	1948896.132
675	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	13	Mantoliya	7.000560352	South_Shahdol	Khannoudhi	Madhya_Pradesh	2391714.379	1952865.356
676	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	14	Mitora	15.08989649	South_Shahdol	Khannoudhi	Madhya_Pradesh	2390696.852	1956210.32
677	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	15	Murga	11.45529248	South_Shahdol	Khannoudhi	Madhya_Pradesh	2387894.031	1952012.318
678	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	16	Nawagawan	8.136371362	South_Shahdol	Khannoudhi	Madhya_Pradesh	2392861.94	1946409.108
679	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	17	Pondi	10.67894767	South_Shahdol	Khannoudhi	Madhya_Pradesh	2384557.176	1951447.091
680	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	18	Rupola	13.7080412	South_Shahdol	Khannoudhi	Madhya_Pradesh	2397487.637	1925620.265
681	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	19	Sanna	10.54393912	South_Shahdol	Khannoudhi	Madhya_Pradesh	2395319.039	1929229.46
682	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	21	Tetki	5.313820835	South_Shahdol	Khannoudhi	Madhya_Pradesh	2386441.878	1939919.031
683	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	5	Khannoudhi	Madhya_Pradesh	2391450.941	1939782.565	22	Umaria	8.98416034	South_Shahdol	Khannoudhi	Madhya_Pradesh	2388598.681	1945516.97
684	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	13	Aintajhar	1.225675618	South_Shahdol	Shahdol	Madhya_Pradesh	2352021.073	1938373.467
685	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	16	Antara	2.659116253	South_Shahdol	Shahdol	Madhya_Pradesh	2347937.175	1931463.084
686	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	17	Anthjar	1.761477194	South_Shahdol	Shahdol	Madhya_Pradesh	2353019.841	1939389.803
687	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	1	Antra	2.784403512	South_Shahdol	Shahdol	Madhya_Pradesh	2349375.545	1934052.038
688	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	2	Badkhera	7.198867295	South_Shahdol	Shahdol	Madhya_Pradesh	2365799.88	1944156.54
689	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	14	Jamui	2.051305935	South_Shahdol	Shahdol	Madhya_Pradesh	2355188.733	1940288.365
690	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	15	Jodhpur	4.29727063	South_Shahdol	Shahdol	Madhya_Pradesh	2347487.346	1938325.646
691	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	3	Kanchanpur	3.091450947	South_Shahdol	Shahdol	Madhya_Pradesh	2353611.735	1941392.95
692	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	4	Kathotia	6.172835642	South_Shahdol	Shahdol	Madhya_Pradesh	2350257.807	1931813.443
693	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	5	Kelmaniya	8.318923746	South_Shahdol	Shahdol	Madhya_Pradesh	2342791.828	1932990.445
694	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	6	Khetoli	1.332771954	South_Shahdol	Shahdol	Madhya_Pradesh	2364710.141	1948100.054
695	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	18	Khetouli	3.08688985	South_Shahdol	Shahdol	Madhya_Pradesh	2364950.526	1948849.688
696	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	7	Narwar	7.808088647	South_Shahdol	Shahdol	Madhya_Pradesh	2371237.578	1934937.092
697	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	8	Nipaniya	12.93619833	South_Shahdol	Shahdol	Madhya_Pradesh	2370332.184	1937968.175
698	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	9	Patashi	6.121602308	South_Shahdol	Shahdol	Madhya_Pradesh	2368442.531	1943095.237
699	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	10	Patkhai	8.36155688	South_Shahdol	Shahdol	Madhya_Pradesh	2338319.622	1932886.645
700	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	11	Shahpur	4.150472387	South_Shahdol	Shahdol	Madhya_Pradesh	2356257.859	1932784.836
701	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	12	Shyamdih	0.306954907	South_Shahdol	Shahdol	Madhya_Pradesh	2367838.866	1944984.535
702	63	South_Shahdol	14	Madhya_Pradesh	2372705.819	1956916.722	South_Shahdol	6	Shahdol	Madhya_Pradesh	2357696.161	1937810.03	19	Syamdih	4.288033468	South_Shahdol	Shahdol	Madhya_Pradesh	2366014.879	1946432.987
703	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	1	Chandia	Madhya_Pradesh	2385951.977	1870190.801	1	Barhi	8.507448674	Umaria_Project	Chandia	Madhya_Pradesh	2387748.891	1866241.288
704	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	1	Chandia	Madhya_Pradesh	2385951.977	1870190.801	2	Chandia	6.54190753	Umaria_Project	Chandia	Madhya_Pradesh	2393758.107	1873644.818
705	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	1	Chandia	Madhya_Pradesh	2385951.977	1870190.801	3	Jogin	6.78253496	Umaria_Project	Chandia	Madhya_Pradesh	2384649.88	1864811.491
706	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	1	Chandia	Madhya_Pradesh	2385951.977	1870190.801	6	Narwar	11.85360969	Umaria_Project	Chandia	Madhya_Pradesh	2383814.368	1869906.089
707	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	1	Chandia	Madhya_Pradesh	2385951.977	1870190.801	5	Tikura_Kathai	8.433727298	Umaria_Project	Chandia	Madhya_Pradesh	2384804.278	1875225.484
708	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	1	Chandia	Madhya_Pradesh	2385951.977	1870190.801	4	Urdani	5.461757481	Umaria_Project	Chandia	Madhya_Pradesh	2381831.535	1871729.408
709	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	2	Ghunghuti	Madhya_Pradesh	2360406.641	1916565.785	5	Ghunghuti	3.145858261	Umaria_Project	Ghunghuti	Madhya_Pradesh	2362377.615	1915188.35
710	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	2	Ghunghuti	Madhya_Pradesh	2360406.641	1916565.785	1	Hathpura	5.602709616	Umaria_Project	Ghunghuti	Madhya_Pradesh	2350113.929	1923293.271
711	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	2	Ghunghuti	Madhya_Pradesh	2360406.641	1916565.785	4	Jamuhai	4.719394109	Umaria_Project	Ghunghuti	Madhya_Pradesh	2371205.857	1916784.197
712	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	2	Ghunghuti	Madhya_Pradesh	2360406.641	1916565.785	6	Patpara	2.09906631	Umaria_Project	Ghunghuti	Madhya_Pradesh	2360645.276	1900182.453
713	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	8	Umaria	Madhya_Pradesh	2384395.413	1882030.375	5	Barbaspur	5.405730163	Umaria_Project	Umaria	Madhya_Pradesh	2390275.596	1887164.116
714	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	8	Umaria	Madhya_Pradesh	2384395.413	1882030.375	2	Bilaikap	6.353890138	Umaria_Project	Umaria	Madhya_Pradesh	2386323.61	1888368.501
715	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	8	Umaria	Madhya_Pradesh	2384395.413	1882030.375	1	Chandwar	10.43904993	Umaria_Project	Umaria	Madhya_Pradesh	2380992.737	1877979.334
716	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	8	Umaria	Madhya_Pradesh	2384395.413	1882030.375	6	Chirrawah	4.637263675	Umaria_Project	Umaria	Madhya_Pradesh	2387681.31	1889733.691
717	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	8	Umaria	Madhya_Pradesh	2384395.413	1882030.375	3	Dhangi	8.423398464	Umaria_Project	Umaria	Madhya_Pradesh	2381060.397	1874722.853
718	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	8	Umaria	Madhya_Pradesh	2384395.413	1882030.375	4	Umaria	6.214929689	Umaria_Project	Umaria	Madhya_Pradesh	2385093.243	1882046.032
719	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	9	Tamannara	Madhya_Pradesh	2376073.898	1875460.533	2	Atariya	9.37806478	Umaria_Project	Tamannara	Madhya_Pradesh	2378884.47	1878247.525
720	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	9	Tamannara	Madhya_Pradesh	2376073.898	1875460.533	4	Jamuniya	11.0638956	Umaria_Project	Tamannara	Madhya_Pradesh	2376325.012	1870605.175
721	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	9	Tamannara	Madhya_Pradesh	2376073.898	1875460.533	7	Kohka	7.529501384	Umaria_Project	Tamannara	Madhya_Pradesh	2372114.016	1881123.719
722	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	9	Tamannara	Madhya_Pradesh	2376073.898	1875460.533	6	Lalpur	3.706499851	Umaria_Project	Tamannara	Madhya_Pradesh	2373153.083	1872662.004
723	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	9	Tamannara	Madhya_Pradesh	2376073.898	1875460.533	5	Majwani	9.855259045	Umaria_Project	Tamannara	Madhya_Pradesh	2375265.382	1877320.016
724	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	9	Tamannara	Madhya_Pradesh	2376073.898	1875460.533	1	Tamannara	10.90606734	Umaria_Project	Tamannara	Madhya_Pradesh	2377859.487	1873350.639
725	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	10	Bilaspur	Madhya_Pradesh	2379498.587	1862246.845	5	Akhadar	8.210487	Umaria_Project	Bilaspur	Madhya_Pradesh	2382469.774	1864231.6
726	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	10	Bilaspur	Madhya_Pradesh	2379498.587	1862246.845	6	Barouda	9.487823345	Umaria_Project	Bilaspur	Madhya_Pradesh	2380254.539	1865467.42
727	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	10	Bilaspur	Madhya_Pradesh	2379498.587	1862246.845	3	Beejapuri	3.326704673	Umaria_Project	Bilaspur	Madhya_Pradesh	2371796.661	1855253.799
728	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	10	Bilaspur	Madhya_Pradesh	2379498.587	1862246.845	4	Jaitpuri	8.694085863	Umaria_Project	Bilaspur	Madhya_Pradesh	2379385.856	1858320.577
729	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	10	Bilaspur	Madhya_Pradesh	2379498.587	1862246.845	2	Karua	12.2757055	Umaria_Project	Bilaspur	Madhya_Pradesh	2382015.548	1860399.152
730	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	10	Bilaspur	Madhya_Pradesh	2379498.587	1862246.845	7	Pathari	10.5564137	Umaria_Project	Bilaspur	Madhya_Pradesh	2377721.833	1865553.028
731	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	10	Bilaspur	Madhya_Pradesh	2379498.587	1862246.845	1	Umarpani	9.90846636	Umaria_Project	Bilaspur	Madhya_Pradesh	2377772.143	1862078.034
732	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	11	Harrwah	Madhya_Pradesh	2372299.496	1863883.382	6	Budhiya	6.242477993	Umaria_Project	Harrwah	Madhya_Pradesh	2370689.358	1864230.36
733	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	11	Harrwah	Madhya_Pradesh	2372299.496	1863883.382	7	Gilothar	7.924629252	Umaria_Project	Harrwah	Madhya_Pradesh	2374474.142	1868223.653
734	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	11	Harrwah	Madhya_Pradesh	2372299.496	1863883.382	1	Harrwah	10.3684588	Umaria_Project	Harrwah	Madhya_Pradesh	2373587.314	1864070.347
735	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	11	Harrwah	Madhya_Pradesh	2372299.496	1863883.382	3	Majhouli_Kala	8.632931452	Umaria_Project	Harrwah	Madhya_Pradesh	2368388.043	1858710.014
736	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	11	Harrwah	Madhya_Pradesh	2372299.496	1863883.382	4	Majhouli_Khurd	7.513167914	Umaria_Project	Harrwah	Madhya_Pradesh	2371046.591	1859191.31
737	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	11	Harrwah	Madhya_Pradesh	2372299.496	1863883.382	5	Seetapal	6.321995133	Umaria_Project	Harrwah	Madhya_Pradesh	2368428.298	1864496.209
738	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	11	Harrwah	Madhya_Pradesh	2372299.496	1863883.382	2	Shajnara	7.931206225	Umaria_Project	Harrwah	Madhya_Pradesh	2378240.529	1868616.554
739	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	12	Nowrozabad	Madhya_Pradesh	2355372.492	1882431.556	5	Baghwara	5.55560695	Umaria_Project	Nowrozabad	Madhya_Pradesh	2354238.688	1880315.135
740	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	12	Nowrozabad	Madhya_Pradesh	2355372.492	1882431.556	3	Barhaikhudri	3.942150056	Umaria_Project	Nowrozabad	Madhya_Pradesh	2351799.283	1884715.05
741	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	12	Nowrozabad	Madhya_Pradesh	2355372.492	1882431.556	4	Bhanpura	2.202678802	Umaria_Project	Nowrozabad	Madhya_Pradesh	2358469.149	1878787.966
742	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	12	Nowrozabad	Madhya_Pradesh	2355372.492	1882431.556	7	Karhi	2.264383359	Umaria_Project	Nowrozabad	Madhya_Pradesh	2354518.644	1874387.595
743	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	12	Nowrozabad	Madhya_Pradesh	2355372.492	1882431.556	6	Kathotiya	0.673634665	Umaria_Project	Nowrozabad	Madhya_Pradesh	2354878.863	1876455.599
744	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	12	Nowrozabad	Madhya_Pradesh	2355372.492	1882431.556	1	Maneri	3.297854105	Umaria_Project	Nowrozabad	Madhya_Pradesh	2360027.797	1885572.289
745	64	Umaria_Project	14	Madhya_Pradesh	2376504.07	1873272.832	Umaria_Project	12	Nowrozabad	Madhya_Pradesh	2355372.492	1882431.556	2	Singhpur	3.81975167	Umaria_Project	Nowrozabad	Madhya_Pradesh	2355497.528	1888365.013
746	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	1	Akhadar	2.300795762	Umaria	Chandia	Madhya_Pradesh	2380860.951	1855672.165
747	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	2	Amadra	1.169773765	Umaria	Chandia	Madhya_Pradesh	2375576.733	1856802.758
748	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	3	Atariya	4.729542849	Umaria	Chandia	Madhya_Pradesh	2367667.209	1857575.242
749	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	19	Badkhera	0.346078299	Umaria	Chandia	Madhya_Pradesh	2373266.309	1865375.746
750	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	20	Baraudha	2.310954942	Umaria	Chandia	Madhya_Pradesh	2381061.384	1868994.34
751	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	6	Chandia	10.36703612	Umaria	Chandia	Madhya_Pradesh	2394496.662	1871595.644
752	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	7	Dhatura	6.112113274	Umaria	Chandia	Madhya_Pradesh	2391054.527	1871018.621
753	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	21	Dubbar	0.423920362	Umaria	Chandia	Madhya_Pradesh	2391257.302	1877171.999
754	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	10	Ghoghari	1.036328389	Umaria	Chandia	Madhya_Pradesh	2367760.731	1868360.596
755	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	11	Harwah	4.002935025	Umaria	Chandia	Madhya_Pradesh	2375143.448	1861240.879
756	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	12	Jogin	6.283794547	Umaria	Chandia	Madhya_Pradesh	2384998.705	1868142.206
757	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	13	Kathai	7.503265394	Umaria	Chandia	Madhya_Pradesh	2389753.269	1873700.146
758	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	14	Kaudia	7.428474743	Umaria	Chandia	Madhya_Pradesh	2391528.933	1867019.232
759	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	15	Majhaganwa	9.172188072	Umaria	Chandia	Madhya_Pradesh	2393813.314	1869232.08
760	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	16	Majhauli	0.881380066	Umaria	Chandia	Madhya_Pradesh	2367698.366	1861005.6
761	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	22	Manikpur	0.54807263	Umaria	Chandia	Madhya_Pradesh	2372264.888	1857264.86
762	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	1	Chandia	Madhya_Pradesh	2386463.525	1867156.196	18	Salliya	6.610600362	Umaria	Chandia	Madhya_Pradesh	2384451.283	1862056.939
763	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	1	Amiliha	6.893190986	Umaria	Ghunghunti	Madhya_Pradesh	2360164.477	1930164.479
764	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	2	Arharia_dadar	6.401810449	Umaria	Ghunghunti	Madhya_Pradesh	2362014.308	1923811.036
765	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	3	Arjuni	5.703861827	Umaria	Ghunghunti	Madhya_Pradesh	2365786.846	1926266.784
766	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	4	Balbai	14.83372024	Umaria	Ghunghunti	Madhya_Pradesh	2373293.361	1927647.529
767	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	5	Bandhawawara	7.389872204	Umaria	Ghunghunti	Madhya_Pradesh	2358949.849	1927857.862
768	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	6	Bhautara	9.876295339	Umaria	Ghunghunti	Madhya_Pradesh	2375258.008	1926141.052
769	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	7	Bijaura	24.26806058	Umaria	Ghunghunti	Madhya_Pradesh	2367709.232	1918611.745
770	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	8	Chadniya	1.124792227	Umaria	Ghunghunti	Madhya_Pradesh	2360921.502	1932513.395
771	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	10	Chauri	26.50053741	Umaria	Ghunghunti	Madhya_Pradesh	2381560.697	1926229.109
772	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	9	Chinki	26.28634575	Umaria	Ghunghunti	Madhya_Pradesh	2377755.475	1921227.042
773	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	11	Dauri	5.20616639	Umaria	Ghunghunti	Madhya_Pradesh	2367913.14	1925474.944
774	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	13	Ghunghunti	14.50720293	Umaria	Ghunghunti	Madhya_Pradesh	2362743.908	1917633.65
775	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	12	Jamdi_East	17.97536974	Umaria	Ghunghunti	Madhya_Pradesh	2371095.947	1920209.05
776	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	28	Jamdi_West	10.68861424	Umaria	Ghunghunti	Madhya_Pradesh	2370495.36	1923396.02
777	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	14	Kachodar	21.03722319	Umaria	Ghunghunti	Madhya_Pradesh	2358340.936	1921697.947
778	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	17	Kholkhamara	6.181181356	Umaria	Ghunghunti	Madhya_Pradesh	2353642.749	1925499.537
779	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	18	Madwa	4.646759074	Umaria	Ghunghunti	Madhya_Pradesh	2363298.543	1926145.538
780	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	19	Majhaganwa	5.413201395	Umaria	Ghunghunti	Madhya_Pradesh	2360382.523	1925352.883
781	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	20	Malachuwa	4.819586303	Umaria	Ghunghunti	Madhya_Pradesh	2355070.288	1924090.106
782	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	21	Maman	17.70432903	Umaria	Ghunghunti	Madhya_Pradesh	2374664.052	1922689.091
783	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	22	Padiri	10.95629037	Umaria	Ghunghunti	Madhya_Pradesh	2352102.605	1927104.251
784	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	23	Pahadiya	3.886082459	Umaria	Ghunghunti	Madhya_Pradesh	2363253.287	1927956.986
785	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	24	Pailee	10.34871887	Umaria	Ghunghunti	Madhya_Pradesh	2386418.713	1927440.736
786	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	25	Patnar	13.01836899	Umaria	Ghunghunti	Madhya_Pradesh	2364460.474	1921801.918
787	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	26	Patnarkla	5.139301159	Umaria	Ghunghunti	Madhya_Pradesh	2364829.106	1923771.317
788	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	3	Ghunghunti	Madhya_Pradesh	2368634.905	1923594.189	27	Rogarh	3.507094828	Umaria	Ghunghunti	Madhya_Pradesh	2356448.599	1926956.381
789	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	1	Baghwar	2.341591039	Umaria	Nourozabad	Madhya_Pradesh	2354068.241	1881656.05
790	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	2	Barhaikudri	0.503432047	Umaria	Nourozabad	Madhya_Pradesh	2352683.294	1885358.347
791	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	3	Beladdadar	9.096390213	Umaria	Nourozabad	Madhya_Pradesh	2351757.054	1902286.18
792	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	4	Belsara	1.677554234	Umaria	Nourozabad	Madhya_Pradesh	2356050.444	1873188.721
793	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	5	Changera_East	14.27566064	Umaria	Nourozabad	Madhya_Pradesh	2356954.724	1901303.434
794	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	6	Changera_Wast	14.82208428	Umaria	Nourozabad	Madhya_Pradesh	2356021.588	1897459.697
795	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	7	Dulehari	5.813263045	Umaria	Nourozabad	Madhya_Pradesh	2359537.476	1891107.434
796	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	8	Ghulghuli	1.480308291	Umaria	Nourozabad	Madhya_Pradesh	2362078.317	1882731.257
797	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	9	Kalda	11.33963219	Umaria	Nourozabad	Madhya_Pradesh	2351508.878	1904983.829
798	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	10	Karri	3.17995318	Umaria	Nourozabad	Madhya_Pradesh	2358875.688	1879944.001
799	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	11	Kathautia	3.749275591	Umaria	Nourozabad	Madhya_Pradesh	2352007.746	1876708.225
800	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	13	Macheha	9.424588919	Umaria	Nourozabad	Madhya_Pradesh	2350750.185	1907768.577
801	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	14	Manari	4.130629218	Umaria	Nourozabad	Madhya_Pradesh	2359235.341	1883826.703
802	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	22	Patpara	12.11309413	Umaria	Nourozabad	Madhya_Pradesh	2361253.751	1900153.789
803	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	15	Pinaura	7.533005588	Umaria	Nourozabad	Madhya_Pradesh	2362070.28	1895968.396
804	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	16	Pondi	5.001363653	Umaria	Nourozabad	Madhya_Pradesh	2360734.577	1880884.462
805	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	17	Rahtha	0.552022821	Umaria	Nourozabad	Madhya_Pradesh	2355751.691	1878504.781
806	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	18	Ranidadar	7.33316747	Umaria	Nourozabad	Madhya_Pradesh	2354914.207	1889277.717
807	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	19	Sajania	2.698027717	Umaria	Nourozabad	Madhya_Pradesh	2353951.947	1885462.553
808	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	20	Sastra	6.79162501	Umaria	Nourozabad	Madhya_Pradesh	2370154.685	1897897.387
809	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	5	Nourozabad	Madhya_Pradesh	2357194.413	1894620.689	21	Tikaria	6.904011947	Umaria	Nourozabad	Madhya_Pradesh	2361023.926	1874463.38
810	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	6	Pali	Madhya_Pradesh	2366016.324	1910620.493	1	Amaha	17.19979638	Umaria	Pali	Madhya_Pradesh	2370487.93	1909370.068
811	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	6	Pali	Madhya_Pradesh	2366016.324	1910620.493	2	Bannauda	13.88219326	Umaria	Pali	Madhya_Pradesh	2372325.283	1906202.34
812	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	6	Pali	Madhya_Pradesh	2366016.324	1910620.493	3	Baramtola	16.69200215	Umaria	Pali	Madhya_Pradesh	2361747.199	1909787.065
813	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	6	Pali	Madhya_Pradesh	2366016.324	1910620.493	13	Barbaspur	11.25968737	Umaria	Pali	Madhya_Pradesh	2370881.365	1903800.879
814	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	6	Pali	Madhya_Pradesh	2366016.324	1910620.493	4	Barhai	12.86677298	Umaria	Pali	Madhya_Pradesh	2363787.923	1913441.666
815	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	6	Pali	Madhya_Pradesh	2366016.324	1910620.493	5	Beli	15.76831165	Umaria	Pali	Madhya_Pradesh	2373676.82	1912392.295
816	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	6	Pali	Madhya_Pradesh	2366016.324	1910620.493	8	Jamuhai_Nourth	16.00960653	Umaria	Pali	Madhya_Pradesh	2371372.892	1915093.992
817	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	6	Pali	Madhya_Pradesh	2366016.324	1910620.493	10	Jamuhai_Sourth	14.63397667	Umaria	Pali	Madhya_Pradesh	2376434.896	1915950.975
818	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	6	Pali	Madhya_Pradesh	2366016.324	1910620.493	7	Karkati	16.50042205	Umaria	Pali	Madhya_Pradesh	2367270.221	1912738.923
819	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	6	Pali	Madhya_Pradesh	2366016.324	1910620.493	14	Magthar	16.75089935	Umaria	Pali	Madhya_Pradesh	2358599.817	1907515.489
820	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	6	Pali	Madhya_Pradesh	2366016.324	1910620.493	9	Pali	11.18001394	Umaria	Pali	Madhya_Pradesh	2364037.44	1905452.214
821	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	6	Pali	Madhya_Pradesh	2366016.324	1910620.493	11	Sundardadar	13.47174662	Umaria	Pali	Madhya_Pradesh	2355918.798	1910543.424
822	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	6	Pali	Madhya_Pradesh	2366016.324	1910620.493	12	Timani	8.491889435	Umaria	Pali	Madhya_Pradesh	2353100.531	1913171.966
823	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	6	Pali	Madhya_Pradesh	2366016.324	1910620.493	6	Tummi	10.67612529	Umaria	Pali	Madhya_Pradesh	2355996.263	1911921.201
824	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	8	Umaria	Madhya_Pradesh	2376172.343	1884712.303	15	Baderi	0.509248816	Umaria	Umaria	Madhya_Pradesh	2388650.833	1888374.412
825	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	8	Umaria	Madhya_Pradesh	2376172.343	1884712.303	2	Chandwar	1.506900701	Umaria	Umaria	Madhya_Pradesh	2384072.693	1877388.557
826	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	8	Umaria	Madhya_Pradesh	2376172.343	1884712.303	3	Chirhula	14.81192143	Umaria	Umaria	Madhya_Pradesh	2371094.482	1884532.837
827	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	8	Umaria	Madhya_Pradesh	2376172.343	1884712.303	4	Dhanwahi	4.574059495	Umaria	Umaria	Madhya_Pradesh	2390725.159	1881892.114
828	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	8	Umaria	Madhya_Pradesh	2376172.343	1884712.303	5	Dhawaijhar	1.252438502	Umaria	Umaria	Madhya_Pradesh	2369837.429	1869440.55
829	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	8	Umaria	Madhya_Pradesh	2376172.343	1884712.303	6	Jarha	11.80638891	Umaria	Umaria	Madhya_Pradesh	2368805.774	1879601.248
830	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	8	Umaria	Madhya_Pradesh	2376172.343	1884712.303	7	Karkali	10.23574905	Umaria	Umaria	Madhya_Pradesh	2378154.966	1892406.503
831	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	8	Umaria	Madhya_Pradesh	2376172.343	1884712.303	8	Kohka	3.629238354	Umaria	Umaria	Madhya_Pradesh	2373820.727	1874192.125
832	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	8	Umaria	Madhya_Pradesh	2376172.343	1884712.303	9	Lodha	8.511404798	Umaria	Umaria	Madhya_Pradesh	2391040.556	1879058.624
833	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	8	Umaria	Madhya_Pradesh	2376172.343	1884712.303	10	Mahroi	10.45180197	Umaria	Umaria	Madhya_Pradesh	2377007.549	1885605.138
834	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	8	Umaria	Madhya_Pradesh	2376172.343	1884712.303	11	MajwaniKala	12.68230378	Umaria	Umaria	Madhya_Pradesh	2374843.463	1882667.68
835	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	8	Umaria	Madhya_Pradesh	2376172.343	1884712.303	12	Patari	7.664555934	Umaria	Umaria	Madhya_Pradesh	2375134.276	1897564.169
836	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	8	Umaria	Madhya_Pradesh	2376172.343	1884712.303	13	Silodi	13.10879462	Umaria	Umaria	Madhya_Pradesh	2372891.388	1887297.546
837	65	Umaria	14	Madhya_Pradesh	2368674.199	1905336.286	Umaria	8	Umaria	Madhya_Pradesh	2376172.343	1884712.303	14	Umaria	1.213223362	Umaria	Umaria	Madhya_Pradesh	2381180.044	1881373.917
838	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	1	BASTUA	Madhya_Pradesh	2432979.671	1968337.383	15	Not_found	0.061473	SANJAY_DUBRI	BASTUA	Madhya_Pradesh	2438855.401	1965106.667
839	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	1	BASTUA	Madhya_Pradesh	2432979.671	1968337.383	1	Bastua	9.216036	SANJAY_DUBRI	BASTUA	Madhya_Pradesh	2432330.865	1973705.612
840	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	1	BASTUA	Madhya_Pradesh	2432979.671	1968337.383	2	Bheradol	11.50254	SANJAY_DUBRI	BASTUA	Madhya_Pradesh	2437357.277	1967820.44
841	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	1	BASTUA	Madhya_Pradesh	2432979.671	1968337.383	3	East_Umaria	11.266298	SANJAY_DUBRI	BASTUA	Madhya_Pradesh	2436264.241	1964991.548
842	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	1	BASTUA	Madhya_Pradesh	2432979.671	1968337.383	4	Gijohar	11.888382	SANJAY_DUBRI	BASTUA	Madhya_Pradesh	2428770.869	1972022.588
843	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	1	BASTUA	Madhya_Pradesh	2432979.671	1968337.383	5	Jamdol_East	10.58663	SANJAY_DUBRI	BASTUA	Madhya_Pradesh	2427818.786	1967863.795
844	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	1	BASTUA	Madhya_Pradesh	2432979.671	1968337.383	6	Kanchanpur	11.383465	SANJAY_DUBRI	BASTUA	Madhya_Pradesh	2433003.321	1964139.007
845	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	1	BASTUA	Madhya_Pradesh	2432979.671	1968337.383	7	Karwahi	11.275748	SANJAY_DUBRI	BASTUA	Madhya_Pradesh	2440652.723	1967248.917
846	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	1	BASTUA	Madhya_Pradesh	2432979.671	1968337.383	8	Kudaria	12.656844	SANJAY_DUBRI	BASTUA	Madhya_Pradesh	2436169.703	1970507.882
847	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	1	BASTUA	Madhya_Pradesh	2432979.671	1968337.383	9	Lawahi	11.428797	SANJAY_DUBRI	BASTUA	Madhya_Pradesh	2430809.057	1965751.033
848	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	1	BASTUA	Madhya_Pradesh	2432979.671	1968337.383	10	Pankhora	10.343691	SANJAY_DUBRI	BASTUA	Madhya_Pradesh	2430357.189	1969419.342
849	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	1	BASTUA	Madhya_Pradesh	2432979.671	1968337.383	11	Pondi	13.862438	SANJAY_DUBRI	BASTUA	Madhya_Pradesh	2428512.325	1974590.473
850	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	1	BASTUA	Madhya_Pradesh	2432979.671	1968337.383	12	Ramgarh	10.82238	SANJAY_DUBRI	BASTUA	Madhya_Pradesh	2433369.852	1968561.392
851	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	1	BASTUA	Madhya_Pradesh	2432979.671	1968337.383	13	West_Jamdol	9.170306	SANJAY_DUBRI	BASTUA	Madhya_Pradesh	2427161.719	1965066.935
852	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	1	BASTUA	Madhya_Pradesh	2432979.671	1968337.383	14	West_Umaria	9.957317	SANJAY_DUBRI	BASTUA	Madhya_Pradesh	2438880.787	1963056.18
853	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	2	BEOHARI	Madhya_Pradesh	2434304.366	1957045.869	1	AKHETPUR	0.307451	SANJAY_DUBRI	BEOHARI	Madhya_Pradesh	2439514.616	1948026.038
854	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	2	BEOHARI	Madhya_Pradesh	2434304.366	1957045.869	2	BADKADOL	6.04005	SANJAY_DUBRI	BEOHARI	Madhya_Pradesh	2444353.896	1952914.224
855	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	2	BEOHARI	Madhya_Pradesh	2434304.366	1957045.869	3	BHAMRAHA	10.012926	SANJAY_DUBRI	BEOHARI	Madhya_Pradesh	2435517.948	1949418.362
856	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	2	BEOHARI	Madhya_Pradesh	2434304.366	1957045.869	4	BUCHARO	8.219934	SANJAY_DUBRI	BEOHARI	Madhya_Pradesh	2442519.622	1952138.756
857	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	2	BEOHARI	Madhya_Pradesh	2434304.366	1957045.869	5	DODHA	3.890473	SANJAY_DUBRI	BEOHARI	Madhya_Pradesh	2428467.713	1953609.926
858	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	2	BEOHARI	Madhya_Pradesh	2434304.366	1957045.869	6	GADDAHA	15.925375	SANJAY_DUBRI	BEOHARI	Madhya_Pradesh	2441952.436	1970541.706
859	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	2	BEOHARI	Madhya_Pradesh	2434304.366	1957045.869	7	JAMADI	10.667329	SANJAY_DUBRI	BEOHARI	Madhya_Pradesh	2422795.007	1955212.12
860	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	2	BEOHARI	Madhya_Pradesh	2434304.366	1957045.869	8	KHADDA	3.53978	SANJAY_DUBRI	BEOHARI	Madhya_Pradesh	2431672.927	1950287.595
861	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	2	BEOHARI	Madhya_Pradesh	2434304.366	1957045.869	9	KHARGADI	15.30344	SANJAY_DUBRI	BEOHARI	Madhya_Pradesh	2421475.378	1958747.555
862	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	2	BEOHARI	Madhya_Pradesh	2434304.366	1957045.869	10	KOILARI	7.881633	SANJAY_DUBRI	BEOHARI	Madhya_Pradesh	2431176.416	1953526.211
863	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	2	BEOHARI	Madhya_Pradesh	2434304.366	1957045.869	11	Kurchu	3.69524	SANJAY_DUBRI	BEOHARI	Madhya_Pradesh	2424284.486	1953478.573
864	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	2	BEOHARI	Madhya_Pradesh	2434304.366	1957045.869	12	MAJHAULI	16.058948	SANJAY_DUBRI	BEOHARI	Madhya_Pradesh	2444360.586	1957558.823
865	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	2	BEOHARI	Madhya_Pradesh	2434304.366	1957045.869	13	PALHA	1.511644	SANJAY_DUBRI	BEOHARI	Madhya_Pradesh	2426055.371	1952419.763
866	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	3	BHUIMAND	Madhya_Pradesh	2425302.123	2017894.912	1	BHAWANRAHA	13.7367	SANJAY_DUBRI	BHUIMAND	Madhya_Pradesh	2430843.456	2019434.14
867	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	3	BHUIMAND	Madhya_Pradesh	2425302.123	2017894.912	2	EAST_DIGHARA	6.084561	SANJAY_DUBRI	BHUIMAND	Madhya_Pradesh	2422818.977	2021720.96
868	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	3	BHUIMAND	Madhya_Pradesh	2425302.123	2017894.912	3	KURUCHU	16.035218	SANJAY_DUBRI	BHUIMAND	Madhya_Pradesh	2420094.03	2019323.487
869	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	3	BHUIMAND	Madhya_Pradesh	2425302.123	2017894.912	4	NORTH_AMROLA	9.862896	SANJAY_DUBRI	BHUIMAND	Madhya_Pradesh	2424423.127	2015634.722
870	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	3	BHUIMAND	Madhya_Pradesh	2425302.123	2017894.912	5	SEMARA	11.117818	SANJAY_DUBRI	BHUIMAND	Madhya_Pradesh	2430329.243	2015044.729
871	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	3	BHUIMAND	Madhya_Pradesh	2425302.123	2017894.912	6	SOUTH_AMROLA	7.674654	SANJAY_DUBRI	BHUIMAND	Madhya_Pradesh	2421466.365	2013653.9
872	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	3	BHUIMAND	Madhya_Pradesh	2425302.123	2017894.912	7	VENDO	17.25035	SANJAY_DUBRI	BHUIMAND	Madhya_Pradesh	2426846.623	2018745.842
873	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	3	BHUIMAND	Madhya_Pradesh	2425302.123	2017894.912	8	WEST_DIGHARA	9.998914	SANJAY_DUBRI	BHUIMAND	Madhya_Pradesh	2423109.481	2018346.763
874	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	4	DUBARI	Madhya_Pradesh	2433649.703	1957592.359	16	Not_found	0.112616	SANJAY_DUBRI	DUBARI	Madhya_Pradesh	2442845.893	1957002.113
875	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	4	DUBARI	Madhya_Pradesh	2433649.703	1957592.359	1	Badiya	14.513371	SANJAY_DUBRI	DUBARI	Madhya_Pradesh	2433331.656	1960562.814
876	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	4	DUBARI	Madhya_Pradesh	2433649.703	1957592.359	2	Badkadol	12.128943	SANJAY_DUBRI	DUBARI	Madhya_Pradesh	2441809.795	1958063.24
877	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	4	DUBARI	Madhya_Pradesh	2433649.703	1957592.359	3	Bherwar	10.669421	SANJAY_DUBRI	DUBARI	Madhya_Pradesh	2437495.825	1959217.565
878	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	4	DUBARI	Madhya_Pradesh	2433649.703	1957592.359	4	Bitkhuri	11.094658	SANJAY_DUBRI	DUBARI	Madhya_Pradesh	2435034.224	1957895.95
879	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	4	DUBARI	Madhya_Pradesh	2433649.703	1957592.359	5	Chingawah	10.383559	SANJAY_DUBRI	DUBARI	Madhya_Pradesh	2431810.642	1956669.568
880	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	4	DUBARI	Madhya_Pradesh	2433649.703	1957592.359	6	Dubari_East	10.528695	SANJAY_DUBRI	DUBARI	Madhya_Pradesh	2436299.771	1955650.883
881	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	4	DUBARI	Madhya_Pradesh	2433649.703	1957592.359	7	Dubari_West	11.003075	SANJAY_DUBRI	DUBARI	Madhya_Pradesh	2433942.792	1952524.374
882	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	4	DUBARI	Madhya_Pradesh	2433649.703	1957592.359	8	East_Dewa	11.920409	SANJAY_DUBRI	DUBARI	Madhya_Pradesh	2426070.024	1961546.862
883	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	4	DUBARI	Madhya_Pradesh	2433649.703	1957592.359	9	Goindwar	11.509418	SANJAY_DUBRI	DUBARI	Madhya_Pradesh	2437912.553	1951550.757
884	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	4	DUBARI	Madhya_Pradesh	2433649.703	1957592.359	10	Khaira	12.278222	SANJAY_DUBRI	DUBARI	Madhya_Pradesh	2439684.178	1954495.085
885	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	4	DUBARI	Madhya_Pradesh	2433649.703	1957592.359	11	Kharber	12.502071	SANJAY_DUBRI	DUBARI	Madhya_Pradesh	2429219.283	1961328.192
886	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	4	DUBARI	Madhya_Pradesh	2433649.703	1957592.359	12	North_Dewa	9.149309	SANJAY_DUBRI	DUBARI	Madhya_Pradesh	2429339.441	1957227.55
887	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	4	DUBARI	Madhya_Pradesh	2433649.703	1957592.359	13	Pendratal	11.370839	SANJAY_DUBRI	DUBARI	Madhya_Pradesh	2439075.629	1960551.813
888	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	4	DUBARI	Madhya_Pradesh	2433649.703	1957592.359	14	South_Dewa	8.640139	SANJAY_DUBRI	DUBARI	Madhya_Pradesh	2424358.012	1959279.549
889	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	4	DUBARI	Madhya_Pradesh	2433649.703	1957592.359	15	West_Dewa	11.769307	SANJAY_DUBRI	DUBARI	Madhya_Pradesh	2426579.327	1956330.625
890	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	5	MADWAS	Madhya_Pradesh	2433376.18	1977519.828	1	BHAJIGAWAN	15.034978	SANJAY_DUBRI	MADWAS	Madhya_Pradesh	2435914.21	1980622.759
891	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	5	MADWAS	Madhya_Pradesh	2433376.18	1977519.828	2	BIDAURA	10.978061	SANJAY_DUBRI	MADWAS	Madhya_Pradesh	2436214.155	1983752.516
892	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	5	MADWAS	Madhya_Pradesh	2433376.18	1977519.828	3	DADAR	8.032915	SANJAY_DUBRI	MADWAS	Madhya_Pradesh	2440452.591	1984043.151
893	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	5	MADWAS	Madhya_Pradesh	2433376.18	1977519.828	4	EAST_MADWAS	13.769862	SANJAY_DUBRI	MADWAS	Madhya_Pradesh	2440956.299	1979929.238
894	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	5	MADWAS	Madhya_Pradesh	2433376.18	1977519.828	5	KHAJURIHA	6.126085	SANJAY_DUBRI	MADWAS	Madhya_Pradesh	2439805.288	1982027.722
895	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	5	MADWAS	Madhya_Pradesh	2433376.18	1977519.828	6	KOTA	12.353865	SANJAY_DUBRI	MADWAS	Madhya_Pradesh	2425409.18	1972005.152
896	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	5	MADWAS	Madhya_Pradesh	2433376.18	1977519.828	7	KUDARIYA	19.845334	SANJAY_DUBRI	MADWAS	Madhya_Pradesh	2442296.494	1973983.653
897	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	5	MADWAS	Madhya_Pradesh	2433376.18	1977519.828	8	KUNDAUR	19.017506	SANJAY_DUBRI	MADWAS	Madhya_Pradesh	2416874.167	1978055.576
898	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	5	MADWAS	Madhya_Pradesh	2433376.18	1977519.828	9	LURGHUTI	19.184447	SANJAY_DUBRI	MADWAS	Madhya_Pradesh	2422284.666	1975750.29
899	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	5	MADWAS	Madhya_Pradesh	2433376.18	1977519.828	10	NORTH_AMROLA	0.061155	SANJAY_DUBRI	MADWAS	Madhya_Pradesh	2417213.451	1974475.323
900	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	5	MADWAS	Madhya_Pradesh	2433376.18	1977519.828	11	NORTH_MEDAKI	11.317019	SANJAY_DUBRI	MADWAS	Madhya_Pradesh	2437637.37	1977635.898
901	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	5	MADWAS	Madhya_Pradesh	2433376.18	1977519.828	12	PONDI	13.311135	SANJAY_DUBRI	MADWAS	Madhya_Pradesh	2429777.938	1977946.275
902	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	5	MADWAS	Madhya_Pradesh	2433376.18	1977519.828	13	SOUTH_MEDAKI	24.512109	SANJAY_DUBRI	MADWAS	Madhya_Pradesh	2434898.791	1975240.477
903	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	5	MADWAS	Madhya_Pradesh	2433376.18	1977519.828	14	WEST_MADWAS	18.02062	SANJAY_DUBRI	MADWAS	Madhya_Pradesh	2441224.169	1976568.768
904	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	1	Baigava	11.65263	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2428762.262	2001058.872
905	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	2	Baigava_2	10.779915	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2426564.848	2003798.165
906	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	3	Bhadura	15.866514	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2417243.241	2006123.426
907	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	4	Bhawarkoh	13.437255	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2433290.942	2006635.939
908	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	5	Bhisawahi	11.08482	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2416707.807	2009685.365
909	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	6	Chafal	10.899095	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2420229.655	2008808.986
910	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	7	Chitrauli	10.854386	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2424417.001	2009038.639
911	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	8	Garuldand	7.484698	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2419324.273	2013414.662
912	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	9	Ghatitola	10.046657	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2429022.721	2008989.717
913	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	10	Jawari_Tola	8.510503	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2423859.136	2011772.117
914	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	11	Juri	11.090641	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2422478.233	2000022.824
915	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	12	Karcha	10.929969	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2415631.141	2014215.119
916	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	13	Kharsoti	8.496225	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2434497.587	2002707.87
917	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	14	Kurchu	10.328407	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2417888.953	2015209.108
918	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	15	Kusmi	6.966284	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2434600.901	2000318.891
919	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	16	Machmauha	11.582072	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2431121.351	2002486.904
920	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	17	Maghagava	4.876564	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2425268.898	2006723.751
921	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	18	Majhauli	7.923746	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2422094.04	2005685.046
922	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	19	Manmari	10.228036	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2425376.331	2000541.685
923	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	20	Padwar	11.304777	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2420418.629	1997120.217
924	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	21	Pipardolana	9.312889	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2430066.106	2005755.498
925	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	22	Rauhal	9.066248	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2422654.749	1996250.687
926	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	23	Runda	8.697832	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2419722.965	2002867.255
927	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	24	Semra	10.418072	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2427110.089	2011689.749
928	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	25	Songarh	8.645868	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2430878.253	2009148.554
929	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	6	MOHAN	Madhya_Pradesh	2424493.996	2005876.867	26	Suhira	9.21788	SANJAY_DUBRI	MOHAN	Madhya_Pradesh	2423235.265	2003389.823
930	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	7	PONDI	Madhya_Pradesh	2423096.364	1984741.406	1	Agarjhiria_East	10.984906	SANJAY_DUBRI	PONDI	Madhya_Pradesh	2422929.636	1988801.781
931	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	7	PONDI	Madhya_Pradesh	2423096.364	1984741.406	2	Agarjhiria_West	8.535402	SANJAY_DUBRI	PONDI	Madhya_Pradesh	2425615.452	1987919.29
932	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	7	PONDI	Madhya_Pradesh	2423096.364	1984741.406	3	Amgawan	13.103639	SANJAY_DUBRI	PONDI	Madhya_Pradesh	2430086.7	1980528.575
933	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	7	PONDI	Madhya_Pradesh	2423096.364	1984741.406	4	Bandhadol_East	10.730118	SANJAY_DUBRI	PONDI	Madhya_Pradesh	2418139.697	1987034.322
934	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	7	PONDI	Madhya_Pradesh	2423096.364	1984741.406	5	Bandhadol_West	8.637833	SANJAY_DUBRI	PONDI	Madhya_Pradesh	2416128.767	1984137.825
935	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	7	PONDI	Madhya_Pradesh	2423096.364	1984741.406	6	Budandol_East	10.58568	SANJAY_DUBRI	PONDI	Madhya_Pradesh	2423936.938	1982511.24
936	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	7	PONDI	Madhya_Pradesh	2423096.364	1984741.406	7	Budandol_West	10.462135	SANJAY_DUBRI	PONDI	Madhya_Pradesh	2424255.353	1979572.02
937	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	7	PONDI	Madhya_Pradesh	2423096.364	1984741.406	8	Domarpath_North	12.428289	SANJAY_DUBRI	PONDI	Madhya_Pradesh	2421747.39	1985940.812
938	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	7	PONDI	Madhya_Pradesh	2423096.364	1984741.406	9	Domarpath_South	8.256513	SANJAY_DUBRI	PONDI	Madhya_Pradesh	2418909.217	1983465.056
939	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	7	PONDI	Madhya_Pradesh	2423096.364	1984741.406	10	Fulwa	12.979606	SANJAY_DUBRI	PONDI	Madhya_Pradesh	2420041.598	1990120.956
940	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	7	PONDI	Madhya_Pradesh	2423096.364	1984741.406	11	Goliphari	12.040966	SANJAY_DUBRI	PONDI	Madhya_Pradesh	2422829.619	1993522.357
941	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	7	PONDI	Madhya_Pradesh	2423096.364	1984741.406	12	Kodmar	12.12339	SANJAY_DUBRI	PONDI	Madhya_Pradesh	2427377.576	1979780.073
942	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	7	PONDI	Madhya_Pradesh	2423096.364	1984741.406	13	Pakwar	9.9888	SANJAY_DUBRI	PONDI	Madhya_Pradesh	2428353.872	1983928.97
943	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	7	PONDI	Madhya_Pradesh	2423096.364	1984741.406	14	Saidol_North	10.402746	SANJAY_DUBRI	PONDI	Madhya_Pradesh	2421204.019	1981820.498
944	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	7	PONDI	Madhya_Pradesh	2423096.364	1984741.406	15	Saidol_South	11.259148	SANJAY_DUBRI	PONDI	Madhya_Pradesh	2418559.438	1980122.812
945	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	7	PONDI	Madhya_Pradesh	2423096.364	1984741.406	16	Trichuli	11.609135	SANJAY_DUBRI	PONDI	Madhya_Pradesh	2426681.888	1985818.45
946	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	8	TAMSAR	Madhya_Pradesh	2433879.17	1991083.053	1	EAST_KUSMI	2.192242	SANJAY_DUBRI	TAMSAR	Madhya_Pradesh	2433359.308	1998092.74
947	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	8	TAMSAR	Madhya_Pradesh	2433879.17	1991083.053	2	EAST_RAUHAL	8.879011	SANJAY_DUBRI	TAMSAR	Madhya_Pradesh	2427486.923	1992880.781
948	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	8	TAMSAR	Madhya_Pradesh	2433879.17	1991083.053	3	EAST_TAMSAR	9.309689	SANJAY_DUBRI	TAMSAR	Madhya_Pradesh	2438096.819	1990567.084
949	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	8	TAMSAR	Madhya_Pradesh	2433879.17	1991083.053	4	KAMACCH	10.18262	SANJAY_DUBRI	TAMSAR	Madhya_Pradesh	2431837.539	1987012.396
950	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	8	TAMSAR	Madhya_Pradesh	2433879.17	1991083.053	5	KHOKHARA	10.507807	SANJAY_DUBRI	TAMSAR	Madhya_Pradesh	2439270.56	1986620.515
951	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	8	TAMSAR	Madhya_Pradesh	2433879.17	1991083.053	6	KODAR	9.096573	SANJAY_DUBRI	TAMSAR	Madhya_Pradesh	2430793.734	1995272.187
952	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	8	TAMSAR	Madhya_Pradesh	2433879.17	1991083.053	7	SAJADOL	13.358235	SANJAY_DUBRI	TAMSAR	Madhya_Pradesh	2435111.696	1991692.844
953	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	8	TAMSAR	Madhya_Pradesh	2433879.17	1991083.053	8	WEST_KUSMI	15.718038	SANJAY_DUBRI	TAMSAR	Madhya_Pradesh	2433106.83	1993963.707
954	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	8	TAMSAR	Madhya_Pradesh	2433879.17	1991083.053	9	WEST_RAUHAL	8.700518	SANJAY_DUBRI	TAMSAR	Madhya_Pradesh	2427414.69	1990646.757
955	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	8	TAMSAR	Madhya_Pradesh	2433879.17	1991083.053	10	WEST_TAMSAR	12.225336	SANJAY_DUBRI	TAMSAR	Madhya_Pradesh	2439012.399	1988962.97
956	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	9	Village	Madhya_Pradesh	2429747.291	1987109.404	1	Village	184.754767	SANJAY_DUBRI	Village	Madhya_Pradesh	2429747.291	1987109.404
957	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	10	Bagdara	Madhya_Pradesh	2500953.715	2054135.301	1	Bagdara	15.274387	SANJAY_DUBRI	Bagdara	Madhya_Pradesh	2505603.992	2049400.017
958	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	10	Bagdara	Madhya_Pradesh	2500953.715	2054135.301	2	Bargawan	16.654715	SANJAY_DUBRI	Bagdara	Madhya_Pradesh	2498558.889	2050285.183
959	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	10	Bagdara	Madhya_Pradesh	2500953.715	2054135.301	3	Bichhi	17.590547	SANJAY_DUBRI	Bagdara	Madhya_Pradesh	2496643.702	2043822.968
960	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	10	Bagdara	Madhya_Pradesh	2500953.715	2054135.301	4	Garhwa	61.619946	SANJAY_DUBRI	Bagdara	Madhya_Pradesh	2503849.556	2066263.456
961	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	10	Bagdara	Madhya_Pradesh	2500953.715	2054135.301	5	Gonhda	15.429005	SANJAY_DUBRI	Bagdara	Madhya_Pradesh	2497593.531	2061093.214
962	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	10	Bagdara	Madhya_Pradesh	2500953.715	2054135.301	6	Gopla	25.245289	SANJAY_DUBRI	Bagdara	Madhya_Pradesh	2507365.322	2064355.104
963	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	10	Bagdara	Madhya_Pradesh	2500953.715	2054135.301	7	Harma	16.101163	SANJAY_DUBRI	Bagdara	Madhya_Pradesh	2494915.892	2051545.776
964	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	10	Bagdara	Madhya_Pradesh	2500953.715	2054135.301	8	Jagmar	21.76399	SANJAY_DUBRI	Bagdara	Madhya_Pradesh	2502213.491	2056118.497
965	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	10	Bagdara	Madhya_Pradesh	2500953.715	2054135.301	9	Jhaprahawa	19.306828	SANJAY_DUBRI	Bagdara	Madhya_Pradesh	2499304.628	2033616.368
966	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	10	Bagdara	Madhya_Pradesh	2500953.715	2054135.301	10	Kasda	16.232328	SANJAY_DUBRI	Bagdara	Madhya_Pradesh	2503061.809	2059921.752
967	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	10	Bagdara	Madhya_Pradesh	2500953.715	2054135.301	11	Khairpur	17.067503	SANJAY_DUBRI	Bagdara	Madhya_Pradesh	2497696.86	2038975.267
968	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	10	Bagdara	Madhya_Pradesh	2500953.715	2054135.301	12	Khamaria	17.442486	SANJAY_DUBRI	Bagdara	Madhya_Pradesh	2503790.633	2043621.682
969	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	10	Bagdara	Madhya_Pradesh	2500953.715	2054135.301	13	Kharkhauli	11.532774	SANJAY_DUBRI	Bagdara	Madhya_Pradesh	2495531.33	2047781.594
970	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	10	Bagdara	Madhya_Pradesh	2500953.715	2054135.301	14	Machi	18.280012	SANJAY_DUBRI	Bagdara	Madhya_Pradesh	2495816.193	2056228.167
971	83	SANJAY_DUBRI	14	Madhya_Pradesh	2447438.803	2001141.068	SANJAY_DUBRI	10	Bagdara	Madhya_Pradesh	2500953.715	2054135.301	15	NF	186.750184	SANJAY_DUBRI	Bagdara	Madhya_Pradesh	2500879.716	2054044.617
972	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	1	Badokhar	5.889920219	Singrauli	Bargawan	Madhya_Pradesh	2461608.83	2046562.217
973	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	2	Baheraha	19.43933385	Singrauli	Bargawan	Madhya_Pradesh	2461306.654	2021750.318
974	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	3	Bargawan	6.536316014	Singrauli	Bargawan	Madhya_Pradesh	2457729.387	2037191.002
975	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	4	Devra	13.99243962	Singrauli	Bargawan	Madhya_Pradesh	2455398.352	2030875.282
976	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	5	Jhurahi	17.58979954	Singrauli	Bargawan	Madhya_Pradesh	2461739.972	2034878.634
977	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	6	Judwar	25.42491015	Singrauli	Bargawan	Madhya_Pradesh	2472350.048	2048956.311
978	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	7	Kolhua	9.580002669	Singrauli	Bargawan	Madhya_Pradesh	2458413.346	2033753.608
979	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	8	Langhadand	18.09003263	Singrauli	Bargawan	Madhya_Pradesh	2461832.474	2028799.816
980	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	9	Majhigawa	7.854883495	Singrauli	Bargawan	Madhya_Pradesh	2462980.815	2044549.525
981	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	10	Majhuli	9.616702004	Singrauli	Bargawan	Madhya_Pradesh	2451479.196	2040078.993
982	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	11	Makari	7.399453579	Singrauli	Bargawan	Madhya_Pradesh	2449686.925	2034999.929
983	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	12	Manihari	8.530690813	Singrauli	Bargawan	Madhya_Pradesh	2450501.571	2042136.043
984	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	13	Ovari	18.72052878	Singrauli	Bargawan	Madhya_Pradesh	2449007.57	2029311.574
985	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	14	Parihasi	6.987256717	Singrauli	Bargawan	Madhya_Pradesh	2466288.081	2047601.425
986	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	15	Pokhara	12.82648445	Singrauli	Bargawan	Madhya_Pradesh	2467466.031	2051277.5
987	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	16	Purail	13.4421415	Singrauli	Bargawan	Madhya_Pradesh	2454622.848	2024663.847
988	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	17	Purani_Deoser	17.88448497	Singrauli	Bargawan	Madhya_Pradesh	2458741.201	2029323.8
989	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	18	Ujjaini	11.73834739	Singrauli	Bargawan	Madhya_Pradesh	2455366.199	2035563.545
990	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	1	Bargawan	Madhya_Pradesh	2459589.101	2035756.053	19	Urgadi	7.346198253	Singrauli	Bargawan	Madhya_Pradesh	2462010.688	2040939.541
991	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	1	Amrapan	11.1124896	Singrauli	Chitrangi	Madhya_Pradesh	2491040.709	2064105.141
992	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	2	Amsi	8.869018634	Singrauli	Chitrangi	Madhya_Pradesh	2488522.833	2070626.33
993	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	3	Bagdara	12.70986983	Singrauli	Chitrangi	Madhya_Pradesh	2487749.789	2052931.639
994	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	4	Bagdeva	7.193862669	Singrauli	Chitrangi	Madhya_Pradesh	2490177.268	2068828.385
995	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	5	Baharidar	3.326359889	Singrauli	Chitrangi	Madhya_Pradesh	2482056.189	2071752.474
996	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	6	Budhadol	12.73113701	Singrauli	Chitrangi	Madhya_Pradesh	2479112.983	2053004.477
997	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	7	Chitrangi	8.037962172	Singrauli	Chitrangi	Madhya_Pradesh	2484502.135	2054790.476
998	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	8	Darbari	10.42689801	Singrauli	Chitrangi	Madhya_Pradesh	2478669.127	2049793.893
999	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	9	Devri	13.62100023	Singrauli	Chitrangi	Madhya_Pradesh	2476105.831	2045583.744
1000	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	10	Duara	11.84155327	Singrauli	Chitrangi	Madhya_Pradesh	2487085.408	2058092.273
1001	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	11	Garui	7.119388319	Singrauli	Chitrangi	Madhya_Pradesh	2484587.12	2064521.16
1002	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	12	Girapan	9.46374028	Singrauli	Chitrangi	Madhya_Pradesh	2484764.808	2060707.493
1003	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	13	Jharkatia	13.45236032	Singrauli	Chitrangi	Madhya_Pradesh	2485775.626	2070049.287
1004	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	14	Kaithani	4.108572146	Singrauli	Chitrangi	Madhya_Pradesh	2492198.68	2070545.099
1005	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	15	Kekraon	7.346045049	Singrauli	Chitrangi	Madhya_Pradesh	2490753.536	2060226.057
1006	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	16	Kushania	8.403018062	Singrauli	Chitrangi	Madhya_Pradesh	2487539.689	2066552.276
1007	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	17	Mauharia	5.190401526	Singrauli	Chitrangi	Madhya_Pradesh	2491506.892	2066771.619
1008	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	18	Mohgadi	9.317501222	Singrauli	Chitrangi	Madhya_Pradesh	2486802.371	2062933.984
1009	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	19	Naugai	12.46706108	Singrauli	Chitrangi	Madhya_Pradesh	2482196.538	2057813.09
1010	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	20	Suda	10.41226027	Singrauli	Chitrangi	Madhya_Pradesh	2481843.958	2068421.768
1011	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	2	Chitrangi	Madhya_Pradesh	2484810.26	2060590.435	21	Sulkhan	9.368100678	Singrauli	Chitrangi	Madhya_Pradesh	2480959.598	2062421.742
1012	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	3	East_Sarai	Madhya_Pradesh	2438362.847	2034258.9	1	Badanmada	8.144025317	Singrauli	East_Sarai	Madhya_Pradesh	2444924.983	2042498.524
1013	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	3	East_Sarai	Madhya_Pradesh	2438362.847	2034258.9	2	Bajaudi	8.755633669	Singrauli	East_Sarai	Madhya_Pradesh	2431496.306	2028342.362
1014	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	3	East_Sarai	Madhya_Pradesh	2438362.847	2034258.9	3	Bandha	10.04487473	Singrauli	East_Sarai	Madhya_Pradesh	2442308.41	2037868.437
1015	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	3	East_Sarai	Madhya_Pradesh	2438362.847	2034258.9	4	Banijhiria	9.721770737	Singrauli	East_Sarai	Madhya_Pradesh	2446811.34	2038545.874
1016	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	3	East_Sarai	Madhya_Pradesh	2438362.847	2034258.9	5	Bhaleyatola	10.26035477	Singrauli	East_Sarai	Madhya_Pradesh	2436274.495	2033714.622
1017	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	3	East_Sarai	Madhya_Pradesh	2438362.847	2034258.9	6	Devari	13.31391628	Singrauli	East_Sarai	Madhya_Pradesh	2444528.029	2034697.165
1018	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	3	East_Sarai	Madhya_Pradesh	2438362.847	2034258.9	7	Gora	13.11981861	Singrauli	East_Sarai	Madhya_Pradesh	2434049.566	2023945.781
1019	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	3	East_Sarai	Madhya_Pradesh	2438362.847	2034258.9	8	Gorwani	10.64436582	Singrauli	East_Sarai	Madhya_Pradesh	2433003.541	2029366.494
1020	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	3	East_Sarai	Madhya_Pradesh	2438362.847	2034258.9	9	Jamgadi	11.49522277	Singrauli	East_Sarai	Madhya_Pradesh	2440551.721	2034961.978
1021	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	3	East_Sarai	Madhya_Pradesh	2438362.847	2034258.9	10	Khanua	11.28791829	Singrauli	East_Sarai	Madhya_Pradesh	2437729.544	2030984.369
1022	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	3	East_Sarai	Madhya_Pradesh	2438362.847	2034258.9	11	Majhauli_Path	8.992697674	Singrauli	East_Sarai	Madhya_Pradesh	2427355.737	2034699.942
1023	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	3	East_Sarai	Madhya_Pradesh	2438362.847	2034258.9	12	Pidarwah	16.39580353	Singrauli	East_Sarai	Madhya_Pradesh	2447893.21	2044002.008
1024	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	3	East_Sarai	Madhya_Pradesh	2438362.847	2034258.9	13	Podidol	9.93990703	Singrauli	East_Sarai	Madhya_Pradesh	2434186.059	2026739.35
1025	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	3	East_Sarai	Madhya_Pradesh	2438362.847	2034258.9	14	Suliari	14.40016833	Singrauli	East_Sarai	Madhya_Pradesh	2431704.677	2036606.672
1026	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	4	Gorbi	Madhya_Pradesh	2469241.649	2064809.551	1	Ajgurh	15.24704711	Singrauli	Gorbi	Madhya_Pradesh	2466715.25	2060787.698
1027	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	4	Gorbi	Madhya_Pradesh	2469241.649	2064809.551	2	Badgad	10.18513115	Singrauli	Gorbi	Madhya_Pradesh	2472716.122	2068293.349
1028	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	4	Gorbi	Madhya_Pradesh	2469241.649	2064809.551	3	Bagaiya	18.16063657	Singrauli	Gorbi	Madhya_Pradesh	2469331.735	2065786.622
1029	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	4	Gorbi	Madhya_Pradesh	2469241.649	2064809.551	4	Churki	18.45229631	Singrauli	Gorbi	Madhya_Pradesh	2461514.1	2072600.176
1030	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	4	Gorbi	Madhya_Pradesh	2469241.649	2064809.551	5	Dudhamania	7.672427411	Singrauli	Gorbi	Madhya_Pradesh	2470775.091	2054178.061
1031	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	4	Gorbi	Madhya_Pradesh	2469241.649	2064809.551	6	Gobi	8.541847143	Singrauli	Gorbi	Madhya_Pradesh	2458814.577	2060435.681
1032	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	4	Gorbi	Madhya_Pradesh	2469241.649	2064809.551	7	Kapurdei	12.43414296	Singrauli	Gorbi	Madhya_Pradesh	2477347.524	2066206.96
1033	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	4	Gorbi	Madhya_Pradesh	2469241.649	2064809.551	8	Khokhawa	28.2270001	Singrauli	Gorbi	Madhya_Pradesh	2475247.844	2058270.994
1034	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	4	Gorbi	Madhya_Pradesh	2469241.649	2064809.551	9	Parsohar	8.32451101	Singrauli	Gorbi	Madhya_Pradesh	2465691.499	2054547.149
1035	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	4	Gorbi	Madhya_Pradesh	2469241.649	2064809.551	10	Piparkhand	15.2645441	Singrauli	Gorbi	Madhya_Pradesh	2465122.522	2064522.083
1036	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	4	Gorbi	Madhya_Pradesh	2469241.649	2064809.551	11	Ramgarh	6.754916374	Singrauli	Gorbi	Madhya_Pradesh	2458191.281	2050927.272
1037	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	4	Gorbi	Madhya_Pradesh	2469241.649	2064809.551	12	Saketi	11.13899073	Singrauli	Gorbi	Madhya_Pradesh	2478012.54	2069770.75
1038	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	4	Gorbi	Madhya_Pradesh	2469241.649	2064809.551	13	Silphi	13.72175075	Singrauli	Gorbi	Madhya_Pradesh	2472224.449	2074611.403
1039	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	4	Gorbi	Madhya_Pradesh	2469241.649	2064809.551	14	Silphori	17.15130752	Singrauli	Gorbi	Madhya_Pradesh	2468046.875	2073222.215
1040	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	5	Jiyavan	Madhya_Pradesh	2468081.286	2025673.747	1	Aamon	13.43903747	Singrauli	Jiyavan	Madhya_Pradesh	2469164.325	2039066.93
1041	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	5	Jiyavan	Madhya_Pradesh	2468081.286	2025673.747	2	Bhaisahun	9.961152561	Singrauli	Jiyavan	Madhya_Pradesh	2474006.279	2017923.301
1042	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	5	Jiyavan	Madhya_Pradesh	2468081.286	2025673.747	3	Birchhi	18.89177446	Singrauli	Jiyavan	Madhya_Pradesh	2469642.529	2043964.302
1043	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	5	Jiyavan	Madhya_Pradesh	2468081.286	2025673.747	4	Budhadand	7.058053226	Singrauli	Jiyavan	Madhya_Pradesh	2473853.393	2036187.348
1044	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	5	Jiyavan	Madhya_Pradesh	2468081.286	2025673.747	5	Chahli	19.11532933	Singrauli	Jiyavan	Madhya_Pradesh	2463849.855	2015243.702
1045	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	5	Jiyavan	Madhya_Pradesh	2468081.286	2025673.747	6	Chataniha	14.2990252	Singrauli	Jiyavan	Madhya_Pradesh	2463789.696	2021679.442
1046	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	5	Jiyavan	Madhya_Pradesh	2468081.286	2025673.747	7	Dobha	20.43899923	Singrauli	Jiyavan	Madhya_Pradesh	2467307.306	2023762.061
1047	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	5	Jiyavan	Madhya_Pradesh	2468081.286	2025673.747	8	Geer	4.653037976	Singrauli	Jiyavan	Madhya_Pradesh	2473614.691	2040488.753
1048	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	5	Jiyavan	Madhya_Pradesh	2468081.286	2025673.747	9	Jiyavan	12.1142881	Singrauli	Jiyavan	Madhya_Pradesh	2473545.677	2032465.281
1049	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	5	Jiyavan	Madhya_Pradesh	2468081.286	2025673.747	10	Jogini	15.31081275	Singrauli	Jiyavan	Madhya_Pradesh	2464603.093	2039261.192
1050	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	5	Jiyavan	Madhya_Pradesh	2468081.286	2025673.747	11	Khairabada	7.628616137	Singrauli	Jiyavan	Madhya_Pradesh	2472462.192	2039749.516
1051	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	5	Jiyavan	Madhya_Pradesh	2468081.286	2025673.747	12	Kundwar	14.77137449	Singrauli	Jiyavan	Madhya_Pradesh	2465185.408	2007146.356
1052	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	5	Jiyavan	Madhya_Pradesh	2468081.286	2025673.747	13	Kursa	12.55736266	Singrauli	Jiyavan	Madhya_Pradesh	2472525.919	2022710.979
1053	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	5	Jiyavan	Madhya_Pradesh	2468081.286	2025673.747	14	Looti	15.06979699	Singrauli	Jiyavan	Madhya_Pradesh	2462357.93	2009528.111
1054	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	5	Jiyavan	Madhya_Pradesh	2468081.286	2025673.747	15	Saraundha	14.95530761	Singrauli	Jiyavan	Madhya_Pradesh	2469108.497	2016352.173
1055	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	6	Karthua	Madhya_Pradesh	2480447.265	2035912.316	1	Belahwa	6.693209114	Singrauli	Karthua	Madhya_Pradesh	2484762.644	2049937.043
1056	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	6	Karthua	Madhya_Pradesh	2480447.265	2035912.316	2	Bharra	15.31390385	Singrauli	Karthua	Madhya_Pradesh	2474716.25	2028217.926
1057	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	6	Karthua	Madhya_Pradesh	2480447.265	2035912.316	3	Dhani	13.87502944	Singrauli	Karthua	Madhya_Pradesh	2486761.455	2033677.067
1058	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	6	Karthua	Madhya_Pradesh	2480447.265	2035912.316	4	Dhawai	16.9532138	Singrauli	Karthua	Madhya_Pradesh	2477864.343	2030677.018
1059	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	6	Karthua	Madhya_Pradesh	2480447.265	2035912.316	5	Gangi	8.348743465	Singrauli	Karthua	Madhya_Pradesh	2485909.756	2044703.792
1060	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	6	Karthua	Madhya_Pradesh	2480447.265	2035912.316	6	Harphari	24.96766089	Singrauli	Karthua	Madhya_Pradesh	2480296.079	2034594.048
1061	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	6	Karthua	Madhya_Pradesh	2480447.265	2035912.316	7	Karlo	35.95237772	Singrauli	Karthua	Madhya_Pradesh	2477457.419	2040941.592
1062	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	6	Karthua	Madhya_Pradesh	2480447.265	2035912.316	8	Karthua	12.26950386	Singrauli	Karthua	Madhya_Pradesh	2478706.573	2024795.897
1063	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	6	Karthua	Madhya_Pradesh	2480447.265	2035912.316	9	Khamharia	7.129278707	Singrauli	Karthua	Madhya_Pradesh	2475169.327	2021482.928
1064	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	6	Karthua	Madhya_Pradesh	2480447.265	2035912.316	10	Khumucha	12.26048742	Singrauli	Karthua	Madhya_Pradesh	2482967.59	2028922.344
1065	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	6	Karthua	Madhya_Pradesh	2480447.265	2035912.316	11	Sakaria	19.42966108	Singrauli	Karthua	Madhya_Pradesh	2481952.992	2040876.217
1066	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	6	Karthua	Madhya_Pradesh	2480447.265	2035912.316	12	Sherva	11.14192102	Singrauli	Karthua	Madhya_Pradesh	2481645.119	2046459.629
1067	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	6	Karthua	Madhya_Pradesh	2480447.265	2035912.316	13	Vijaypur	11.57857578	Singrauli	Karthua	Madhya_Pradesh	2486165.101	2038799.728
1068	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	1	Badijhiria	14.93680928	Singrauli	Mada	Madhya_Pradesh	2425486.291	2041212.601
1069	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	2	Bhadaili	12.30872483	Singrauli	Mada	Madhya_Pradesh	2416868.937	2023403.85
1070	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	3	Bhamarkhoh	15.88130683	Singrauli	Mada	Madhya_Pradesh	2418582.488	2060087.048
1071	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	4	Bindul	10.74789292	Singrauli	Mada	Madhya_Pradesh	2417787.874	2035186.478
1072	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	5	Chhatauli	15.95054617	Singrauli	Mada	Madhya_Pradesh	2421250.172	2049608.607
1073	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	6	Chudipath	12.29833495	Singrauli	Mada	Madhya_Pradesh	2415176.28	2035810.61
1074	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	7	Dhangarh	12.36735561	Singrauli	Mada	Madhya_Pradesh	2416583.418	2030388.678
1075	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	8	Dhari	16.83474353	Singrauli	Mada	Madhya_Pradesh	2415884.087	2049885.642
1076	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	9	Dongri	12.10918645	Singrauli	Mada	Madhya_Pradesh	2425150.161	2032709.09
1077	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	10	East_kamai	11.64551879	Singrauli	Mada	Madhya_Pradesh	2419893.86	2041251.185
1078	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	11	Jeer	16.06788348	Singrauli	Mada	Madhya_Pradesh	2416728.765	2040431.897
1079	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	12	Kachra	14.10535729	Singrauli	Mada	Madhya_Pradesh	2421083.621	2045015.388
1080	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	13	Kolhua	15.31478986	Singrauli	Mada	Madhya_Pradesh	2415010.414	2043565.258
1081	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	14	Langhadol	9.677418078	Singrauli	Mada	Madhya_Pradesh	2424264.569	2024711.492
1082	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	15	Mada	12.72328265	Singrauli	Mada	Madhya_Pradesh	2423834.324	2045621.659
1083	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	16	Makrohar	14.02238936	Singrauli	Mada	Madhya_Pradesh	2426878.941	2065755.606
1084	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	17	Malgo	13.80142558	Singrauli	Mada	Madhya_Pradesh	2417234.107	2055805.234
1085	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	18	Mathanidand	17.53455816	Singrauli	Mada	Madhya_Pradesh	2418069.685	2046950.755
1086	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	19	Mithul	17.21401979	Singrauli	Mada	Madhya_Pradesh	2413370.8	2052227.05
1087	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	20	Nado	10.48890646	Singrauli	Mada	Madhya_Pradesh	2427695.26	2042720.243
1088	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	21	Podipath	12.72481131	Singrauli	Mada	Madhya_Pradesh	2422298.77	2035550.527
1089	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	22	Raudi	9.316793546	Singrauli	Mada	Madhya_Pradesh	2425273.787	2045394.21
1090	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	23	Rauhaal	13.97428992	Singrauli	Mada	Madhya_Pradesh	2422392.826	2032657.283
1091	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	24	Sonahri	8.816896106	Singrauli	Mada	Madhya_Pradesh	2417378.397	2026955.385
1092	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	25	Suidih	13.19993009	Singrauli	Mada	Madhya_Pradesh	2427344.229	2060472.78
1093	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	26	Tal	10.11975897	Singrauli	Mada	Madhya_Pradesh	2429823.075	2023153.645
1094	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	7	Mada	Madhya_Pradesh	2420552.104	2042821.916	27	Westkamai	16.84625189	Singrauli	Mada	Madhya_Pradesh	2422346.216	2039424.114
1095	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	1	Amlori	15.41559381	Singrauli	Waidhan	Madhya_Pradesh	2449902.382	2054720.299
1096	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	2	Barahpan	8.887174039	Singrauli	Waidhan	Madhya_Pradesh	2429225.169	2075511.724
1097	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	3	Birdaha	9.613251095	Singrauli	Waidhan	Madhya_Pradesh	2427262.933	2037950.284
1098	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	4	Budher	13.42792427	Singrauli	Waidhan	Madhya_Pradesh	2436779.99	2037045.908
1099	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	5	Chaura	16.56461324	Singrauli	Waidhan	Madhya_Pradesh	2439905.684	2045901.935
1100	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	6	Dhoni	9.737159571	Singrauli	Waidhan	Madhya_Pradesh	2429694.173	2041168.639
1101	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	7	Duddhichua	15.89590253	Singrauli	Waidhan	Madhya_Pradesh	2451190.003	2068666.218
1102	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	8	Gadaria	15.32211027	Singrauli	Waidhan	Madhya_Pradesh	2450193.074	2047389.501
1103	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	9	Gobha	13.81397068	Singrauli	Waidhan	Madhya_Pradesh	2433972.467	2077865.125
1104	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	10	Karsua	8.88086928	Singrauli	Waidhan	Madhya_Pradesh	2433204.969	2038558.528
1105	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	11	Khutar	11.29301851	Singrauli	Waidhan	Madhya_Pradesh	2443702.98	2047753.559
1106	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	12	Medhauli	12.56182215	Singrauli	Waidhan	Madhya_Pradesh	2455161.257	2062577.433
1107	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	13	Morwa	18.84310873	Singrauli	Waidhan	Madhya_Pradesh	2455414.736	2069472.604
1108	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	14	Navanagar	18.1762482	Singrauli	Waidhan	Madhya_Pradesh	2450415.426	2060450.516
1109	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	15	North_Amilia	10.99879827	Singrauli	Waidhan	Madhya_Pradesh	2441577.537	2041793.962
1110	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	16	Padari	17.02223236	Singrauli	Waidhan	Madhya_Pradesh	2453348.236	2054523.765
1111	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	17	Pipara	8.203117637	Singrauli	Waidhan	Madhya_Pradesh	2446263.383	2047217.968
1112	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	18	South_Amilia	12.40245153	Singrauli	Waidhan	Madhya_Pradesh	2439131.007	2039169.224
1113	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	19	South_Gobha	10.69353464	Singrauli	Waidhan	Madhya_Pradesh	2430936.96	2078294.66
1114	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	20	Suideeh	5.99690541	Singrauli	Waidhan	Madhya_Pradesh	2432222.902	2072862.203
1115	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	21	Urti	10.78175239	Singrauli	Waidhan	Madhya_Pradesh	2427372.257	2071235.674
1116	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	8	Waidhan	Madhya_Pradesh	2442767.821	2056128.174	22	Waidhan	5.393940097	Singrauli	Waidhan	Madhya_Pradesh	2449241.669	2063079.098
1117	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	1	Amlakhpur	22.76096093	Singrauli	West_Sarai	Madhya_Pradesh	2457186.125	2007269.721
1118	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	2	Atari	18.41343743	Singrauli	West_Sarai	Madhya_Pradesh	2444027.886	2008290.903
1119	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	3	Banjari	20.3277859	Singrauli	West_Sarai	Madhya_Pradesh	2440460.305	2000245.041
1120	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	4	Barka	19.75654941	Singrauli	West_Sarai	Madhya_Pradesh	2451403.837	2018335.301
1121	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	5	Dhauhani	17.50343609	Singrauli	West_Sarai	Madhya_Pradesh	2452296.526	2007496.808
1122	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	6	East_Belwani	23.11256907	Singrauli	West_Sarai	Madhya_Pradesh	2457805.943	2003294.942
1123	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	7	East_Sarai	15.79823356	Singrauli	West_Sarai	Madhya_Pradesh	2437678.51	2021429.125
1124	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	8	Gadaigao	15.36597093	Singrauli	West_Sarai	Madhya_Pradesh	2445984.081	2002330.975
1125	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	9	Gajrabahara	11.23797667	Singrauli	West_Sarai	Madhya_Pradesh	2443604.672	2029710.188
1126	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	10	Godbahara	17.09133519	Singrauli	West_Sarai	Madhya_Pradesh	2446941.172	2025580.203
1127	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	11	Jhara	22.52496725	Singrauli	West_Sarai	Madhya_Pradesh	2440022.16	2007584.053
1128	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	12	Mahuli	20.31293209	Singrauli	West_Sarai	Madhya_Pradesh	2457388.867	2011579.523
1129	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	13	Niwas	22.0938149	Singrauli	West_Sarai	Madhya_Pradesh	2455628.257	1994398.29
1130	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	14	Pipri	20.01184299	Singrauli	West_Sarai	Madhya_Pradesh	2459967.931	2015345.409
1131	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	15	Rajania	16.42433105	Singrauli	West_Sarai	Madhya_Pradesh	2450987.534	2003628.526
1132	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	16	Sajapani	19.45416748	Singrauli	West_Sarai	Madhya_Pradesh	2446628.821	2009844.938
1133	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	17	Tall	15.15607063	Singrauli	West_Sarai	Madhya_Pradesh	2458407.207	1997291.551
1134	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	18	West_Belwani	14.19048002	Singrauli	West_Sarai	Madhya_Pradesh	2458339.028	2000462.791
1135	84	Singrauli	14	Madhya_Pradesh	2453704.908	2038959.004	Singrauli	9	West_Sarai	Madhya_Pradesh	2450007.015	2008864.71	19	West_Sarai	16.2488532	Singrauli	West_Sarai	Madhya_Pradesh	2439499.59	2014698.655
1136	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	1	Bahri	Madhya_Pradesh	2484940.377	2015223.826	1	Amiliya	8.195279962	Sidhi	Bahri	Madhya_Pradesh	2498252.586	2009663.004
1137	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	1	Bahri	Madhya_Pradesh	2484940.377	2015223.826	2	Baghor	12.40419293	Sidhi	Bahri	Madhya_Pradesh	2498826.141	2025409.635
1138	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	1	Bahri	Madhya_Pradesh	2484940.377	2015223.826	3	Bahri	13.88128426	Sidhi	Bahri	Madhya_Pradesh	2482929.953	2017114.413
1139	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	1	Bahri	Madhya_Pradesh	2484940.377	2015223.826	4	Bhitri	13.48166896	Sidhi	Bahri	Madhya_Pradesh	2479767.626	2008140.346
1140	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	1	Bahri	Madhya_Pradesh	2484940.377	2015223.826	5	Dol	11.05624709	Sidhi	Bahri	Madhya_Pradesh	2478191.715	2014327.538
1141	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	1	Bahri	Madhya_Pradesh	2484940.377	2015223.826	6	Jethula	11.76211357	Sidhi	Bahri	Madhya_Pradesh	2487438.131	2025063.997
1142	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	1	Bahri	Madhya_Pradesh	2484940.377	2015223.826	7	Khuteli	9.757907748	Sidhi	Bahri	Madhya_Pradesh	2492979.84	2033087.171
1143	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	1	Bahri	Madhya_Pradesh	2484940.377	2015223.826	8	Kubri	12.00180971	Sidhi	Bahri	Madhya_Pradesh	2485838.762	2011143.015
1144	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	1	Bahri	Madhya_Pradesh	2484940.377	2015223.826	9	Nakjhar	10.79664526	Sidhi	Bahri	Madhya_Pradesh	2489535.029	2021733.428
1145	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	1	Bahri	Madhya_Pradesh	2484940.377	2015223.826	10	Pondi	14.26471571	Sidhi	Bahri	Madhya_Pradesh	2473123.011	2010988.021
1146	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	1	Bahri	Madhya_Pradesh	2484940.377	2015223.826	11	Saaro	12.97738814	Sidhi	Bahri	Madhya_Pradesh	2476692.43	2009115.732
1147	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	1	Bahri	Madhya_Pradesh	2484940.377	2015223.826	12	Shairpur	12.98151998	Sidhi	Bahri	Madhya_Pradesh	2484810.373	2001875.886
1148	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	1	Amilai	5.424451399	Sidhi	Churhat	Madhya_Pradesh	2464403.457	1937580.613
1149	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	2	Amilha	18.55273342	Sidhi	Churhat	Madhya_Pradesh	2467266.046	1952128.654
1150	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	3	Badhaura	14.69090008	Sidhi	Churhat	Madhya_Pradesh	2477060.97	1970723.27
1151	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	4	Baghwar	11.33775302	Sidhi	Churhat	Madhya_Pradesh	2474842.289	1941324.023
1152	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	5	Bhainstal	8.187161583	Sidhi	Churhat	Madhya_Pradesh	2459682.954	1959243.566
1153	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	6	Budhgauna	5.482784998	Sidhi	Churhat	Madhya_Pradesh	2470801.398	1933234.216
1154	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	7	Charki	10.8791767	Sidhi	Churhat	Madhya_Pradesh	2466609.212	1973361.93
1155	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	8	Chauphal	15.44282987	Sidhi	Churhat	Madhya_Pradesh	2463984.333	1973807.832
1156	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	9	Churhat	17.740549	Sidhi	Churhat	Madhya_Pradesh	2483161.447	1964982.318
1157	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	10	Dadhiya	15.83816106	Sidhi	Churhat	Madhya_Pradesh	2487481.633	1971003.008
1158	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	11	Gajri_East	8.383618161	Sidhi	Churhat	Madhya_Pradesh	2460103.273	1970845.294
1159	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	12	Gajri_West	15.64844867	Sidhi	Churhat	Madhya_Pradesh	2458235.854	1964983.135
1160	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	13	Khaddi	7.644157295	Sidhi	Churhat	Madhya_Pradesh	2462060.204	1954981.277
1161	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	14	Kushmahar	17.17108485	Sidhi	Churhat	Madhya_Pradesh	2470467.246	1974173.614
1162	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	15	Maldeva	9.872694702	Sidhi	Churhat	Madhya_Pradesh	2479620.751	1950731.081
1163	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	16	Mata	13.69724208	Sidhi	Churhat	Madhya_Pradesh	2463837.115	1967944.888
1164	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	17	Rampur	11.63995518	Sidhi	Churhat	Madhya_Pradesh	2472102	1950863.616
1165	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	18	Semariya	23.32551578	Sidhi	Churhat	Madhya_Pradesh	2470083.11	1963304.366
1166	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	19	Shikarganj	10.95478208	Sidhi	Churhat	Madhya_Pradesh	2466600.23	1944342.698
1167	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	2	Churhat	Madhya_Pradesh	2469959.164	1961433.285	20	Umariha	9.390196176	Sidhi	Churhat	Madhya_Pradesh	2462724.256	1962481.573
1168	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	3	Madwas	Madhya_Pradesh	2456538.008	1982830.53	1	Khamh	14.54126421	Sidhi	Madwas	Madhya_Pradesh	2458366.46	1975674.416
1169	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	3	Madwas	Madhya_Pradesh	2456538.008	1982830.53	2	Madwas_East	0.07353049	Sidhi	Madwas	Madhya_Pradesh	2447818.557	1980011.696
1170	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	3	Madwas	Madhya_Pradesh	2456538.008	1982830.53	3	Shikara_East	15.43192174	Sidhi	Madwas	Madhya_Pradesh	2457167.249	1989297.357
1171	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	3	Madwas	Madhya_Pradesh	2456538.008	1982830.53	4	Shikara_West	15.43923198	Sidhi	Madwas	Madhya_Pradesh	2457908.405	1982178.442
1172	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	3	Madwas	Madhya_Pradesh	2456538.008	1982830.53	5	Tikri	13.91449937	Sidhi	Madwas	Madhya_Pradesh	2452454.848	1983875.368
1173	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	4	Majhauli	Madhya_Pradesh	2453876.799	1954774.294	1	Badkadol	6.579521268	Sidhi	Majhauli	Madhya_Pradesh	2447053.86	1953389.272
1174	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	4	Majhauli	Madhya_Pradesh	2453876.799	1954774.294	2	Baghaila	13.84168844	Sidhi	Majhauli	Madhya_Pradesh	2455552.744	1960194.872
1175	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	4	Majhauli	Madhya_Pradesh	2453876.799	1954774.294	3	Chamradol	14.92472125	Sidhi	Majhauli	Madhya_Pradesh	2450307.28	1955295.348
1176	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	4	Majhauli	Madhya_Pradesh	2453876.799	1954774.294	4	Gadduha	0.553818488	Sidhi	Majhauli	Madhya_Pradesh	2452276.931	1967549.194
1177	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	4	Majhauli	Madhya_Pradesh	2453876.799	1954774.294	5	Kotro	14.24326361	Sidhi	Majhauli	Madhya_Pradesh	2455848.104	1955237.437
1178	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	4	Majhauli	Madhya_Pradesh	2453876.799	1954774.294	6	Naudhiya	14.09324752	Sidhi	Majhauli	Madhya_Pradesh	2453766.62	1951349.283
1179	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	4	Majhauli	Madhya_Pradesh	2453876.799	1954774.294	7	Ratwaar	10.86356469	Sidhi	Majhauli	Madhya_Pradesh	2458417.558	1951175.484
1180	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	5	Sidhi	Madhya_Pradesh	2470709.51	1991812.127	1	Amarwah	15.00045652	Sidhi	Sidhi	Madhya_Pradesh	2482192.773	1986501.764
1181	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	5	Sidhi	Madhya_Pradesh	2470709.51	1991812.127	2	Barambaba	13.34506984	Sidhi	Sidhi	Madhya_Pradesh	2462882.761	1994223.79
1182	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	5	Sidhi	Madhya_Pradesh	2470709.51	1991812.127	3	Chitaang	18.05831907	Sidhi	Sidhi	Madhya_Pradesh	2492152.273	1992982.767
1183	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	5	Sidhi	Madhya_Pradesh	2470709.51	1991812.127	4	Hadbado	17.70043924	Sidhi	Sidhi	Madhya_Pradesh	2465747.071	1997837.208
1184	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	5	Sidhi	Madhya_Pradesh	2470709.51	1991812.127	5	Kamarji	12.80652932	Sidhi	Sidhi	Madhya_Pradesh	2487243.371	1981367.931
1185	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	5	Sidhi	Madhya_Pradesh	2470709.51	1991812.127	6	Karimati	14.78152548	Sidhi	Sidhi	Madhya_Pradesh	2464752.997	1979761.594
1186	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	5	Sidhi	Madhya_Pradesh	2470709.51	1991812.127	7	Kathauli	13.63699014	Sidhi	Sidhi	Madhya_Pradesh	2470137.712	1984154.407
1187	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	5	Sidhi	Madhya_Pradesh	2470709.51	1991812.127	8	Kochila	12.60743085	Sidhi	Sidhi	Madhya_Pradesh	2462094.986	1986902.853
1188	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	5	Sidhi	Madhya_Pradesh	2470709.51	1991812.127	9	Kochita	16.91945791	Sidhi	Sidhi	Madhya_Pradesh	2472153.777	1997467.709
1189	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	5	Sidhi	Madhya_Pradesh	2470709.51	1991812.127	10	Lohjhar	18.35558687	Sidhi	Sidhi	Madhya_Pradesh	2460678.988	1991104.169
1190	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	5	Sidhi	Madhya_Pradesh	2470709.51	1991812.127	11	Pavya	23.57394073	Sidhi	Sidhi	Madhya_Pradesh	2466810.146	1987359.207
1191	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	5	Sidhi	Madhya_Pradesh	2470709.51	1991812.127	12	Sidhi	14.11942194	Sidhi	Sidhi	Madhya_Pradesh	2475286.149	1995787.665
1192	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	5	Sidhi	Madhya_Pradesh	2470709.51	1991812.127	13	Sirsi_East	21.80338224	Sidhi	Sidhi	Madhya_Pradesh	2468669.168	2001419.708
1193	85	Sidhi	14	Madhya_Pradesh	2470378.997	1981839.607	Sidhi	5	Sidhi	Madhya_Pradesh	2470709.51	1991812.127	14	Sirsi_West	18.85462612	Sidhi	Sidhi	Madhya_Pradesh	2463124.695	2000009.414
1194	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	2	Rewa	Madhya_Pradesh	2505565.051	1982929.837	1	Baheradawar	20.8508871	Sidhi_FDCM	Rewa	Madhya_Pradesh	2495869.974	1989824.679
1195	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	2	Rewa	Madhya_Pradesh	2505565.051	1982929.837	2	Gauri	17.76916422	Sidhi_FDCM	Rewa	Madhya_Pradesh	2523698.715	1988056.506
1196	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	2	Rewa	Madhya_Pradesh	2505565.051	1982929.837	3	Khaira	18.71967908	Sidhi_FDCM	Rewa	Madhya_Pradesh	2490302.814	1974458.782
1197	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	2	Rewa	Madhya_Pradesh	2505565.051	1982929.837	4	Shivrajpur	16.43377758	Sidhi_FDCM	Rewa	Madhya_Pradesh	2528357.76	1981824.815
1198	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	2	Rewa	Madhya_Pradesh	2505565.051	1982929.837	5	Sitapur	16.45495412	Sidhi_FDCM	Rewa	Madhya_Pradesh	2492867.648	1979397.462
1199	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	4	Sidhi	Madhya_Pradesh	2466441.574	1986439.874	1	Amarwah	9.119271558	Sidhi_FDCM	Sidhi	Madhya_Pradesh	2481279.842	1981155.889
1200	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	4	Sidhi	Madhya_Pradesh	2466441.574	1986439.874	2	Barambaba	3.093102055	Sidhi_FDCM	Sidhi	Madhya_Pradesh	2464906.751	1997398.692
1201	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	4	Sidhi	Madhya_Pradesh	2466441.574	1986439.874	3	Gandhigram	2.705020269	Sidhi_FDCM	Sidhi	Madhya_Pradesh	2470402.73	1991224.069
1202	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	4	Sidhi	Madhya_Pradesh	2466441.574	1986439.874	4	Kanjwar	10.60899935	Sidhi_FDCM	Sidhi	Madhya_Pradesh	2457636.787	1980222.912
1203	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	4	Sidhi	Madhya_Pradesh	2466441.574	1986439.874	5	Kochata	4.595895733	Sidhi_FDCM	Sidhi	Madhya_Pradesh	2473796.138	1997459.436
1204	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	4	Sidhi	Madhya_Pradesh	2466441.574	1986439.874	6	Lohjhar	5.962523643	Sidhi_FDCM	Sidhi	Madhya_Pradesh	2462842.751	1990907.293
1205	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	4	Sidhi	Madhya_Pradesh	2466441.574	1986439.874	7	Tikari	4.950355445	Sidhi_FDCM	Sidhi	Madhya_Pradesh	2454277.881	1984424.239
1206	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	7	Karthua	Madhya_Pradesh	2477641.009	2029154.932	1	Bharra	5.398415292	Sidhi_FDCM	Karthua	Madhya_Pradesh	2475372.254	2027339.772
1207	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	7	Karthua	Madhya_Pradesh	2477641.009	2029154.932	2	Chauradand	5.044100611	Sidhi_FDCM	Karthua	Madhya_Pradesh	2474561.704	2028736.721
1208	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	7	Karthua	Madhya_Pradesh	2477641.009	2029154.932	3	Harphari	3.291752916	Sidhi_FDCM	Karthua	Madhya_Pradesh	2480186.211	2035426.042
1209	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	7	Karthua	Madhya_Pradesh	2477641.009	2029154.932	4	Karthua	5.319132103	Sidhi_FDCM	Karthua	Madhya_Pradesh	2481288.563	2027512.846
1210	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	8	Deosar	Madhya_Pradesh	2465849.55	2030430.254	1	Bori	5.942796786	Sidhi_FDCM	Deosar	Madhya_Pradesh	2469255.356	2043759.939
1211	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	8	Deosar	Madhya_Pradesh	2465849.55	2030430.254	2	Charki	4.701384228	Sidhi_FDCM	Deosar	Madhya_Pradesh	2466324.42	2024547.102
1212	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	8	Deosar	Madhya_Pradesh	2465849.55	2030430.254	3	Chataniha	6.34899331	Sidhi_FDCM	Deosar	Madhya_Pradesh	2467047.298	2021480.493
1213	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	8	Deosar	Madhya_Pradesh	2465849.55	2030430.254	4	Dhonga_East	3.40603578	Sidhi_FDCM	Deosar	Madhya_Pradesh	2468452.553	2025156.15
1214	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	8	Deosar	Madhya_Pradesh	2465849.55	2030430.254	5	Dhonga_West	3.175338552	Sidhi_FDCM	Deosar	Madhya_Pradesh	2468533.247	2022766.016
1215	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	8	Deosar	Madhya_Pradesh	2465849.55	2030430.254	6	Gadaria	3.228969774	Sidhi_FDCM	Deosar	Madhya_Pradesh	2450279.865	2047836.582
1216	95	Sidhi_FDCM	14	Madhya_Pradesh	2487150.718	1996440.352	Sidhi_FDCM	8	Deosar	Madhya_Pradesh	2465849.55	2030430.254	7	Lohra	2.7958697	Sidhi_FDCM	Deosar	Madhya_Pradesh	2466854.4	2027340.394
\.


--
-- Data for Name: email_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_settings (id, smtp_server, sender_email, notify_on_register, email_template, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: error_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.error_logs (id, level, message, "time", created_at) FROM stdin;
1	Error	Failed to send email	2025-05-12 19:21:52.905042	2025-05-13 19:21:52.905042
2	Warning	Slow response detected	2025-05-11 19:21:52.905042	2025-05-13 19:21:52.905042
3	Error	Database connection lost	2025-05-10 19:21:52.905042	2025-05-13 19:21:52.905042
4	Warning	High memory usage	2025-05-09 19:21:52.905042	2025-05-13 19:21:52.905042
5	Error	Backup failed	2025-05-08 19:21:52.905042	2025-05-13 19:21:52.905042
6	Warning	API rate limit reached	2025-05-07 19:21:52.905042	2025-05-13 19:21:52.905042
7	Error	File upload failed	2025-05-06 19:21:52.905042	2025-05-13 19:21:52.905042
8	Warning	Unusual login detected	2025-05-05 19:21:52.905042	2025-05-13 19:21:52.905042
9	Error	Disk space low	2025-05-04 19:21:52.905042	2025-05-13 19:21:52.905042
10	Warning	Deprecated API used	2025-05-03 19:21:52.905042	2025-05-13 19:21:52.905042
\.


--
-- Data for Name: integration_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.integration_settings (id, api_keys, webhook_url, connected_services, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: login_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_logs (id, status, "time", ip, browser, created_at, user_identifier, login_type, email, phone) FROM stdin;
11	success	2025-05-13 19:58:58.313	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-13 19:58:59.542184	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
12	success	2025-05-13 20:00:12.504	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-13 20:00:13.755707	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
13	success	2025-05-13 20:00:32.942	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-13 20:00:34.169856	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
14	success	2025-05-13 20:18:34.343	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-13 20:18:35.612929	ajinkyapatil23@gmail.com	email	ajinkyapatil23@gmail.com	\N
15	success	2025-05-13 20:18:50.081	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-13 20:18:51.36446	ajinkyapatil23@gmail.com	email	ajinkyapatil23@gmail.com	\N
16	success	2025-05-13 20:19:27.698	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-13 20:19:28.998931	ajinkya.patil60@gmail.com	email	ajinkya.patil60@gmail.com	\N
17	success	2025-05-14 06:30:19.13	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 06:30:21.708519	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
18	success	2025-05-14 08:04:40.366	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 08:04:42.980172	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
19	success	2025-05-14 08:08:52.449	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 08:08:55.042971	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
20	success	2025-05-14 08:17:35.185	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 08:17:37.783956	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
21	success	2025-05-14 08:17:57.973	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 08:18:00.631708	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
22	success	2025-05-14 12:08:05.004	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 12:08:08.184955	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
23	success	2025-05-14 12:08:10.923	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 12:08:14.077046	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
24	success	2025-05-14 12:26:00.926	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 12:26:04.146804	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
25	success	2025-05-14 12:29:52.903	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 12:29:56.118783	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
26	success	2025-05-14 12:30:40.174	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 12:30:43.397923	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
27	success	2025-05-14 12:33:07.77	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 12:33:11.023848	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
28	success	2025-05-14 12:33:16.977	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 12:33:20.224276	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
29	success	2025-05-14 12:37:38.26	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 12:37:41.506855	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
30	success	2025-05-14 12:37:52.702	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 12:37:55.934881	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
31	success	2025-05-14 12:40:56.511	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 12:40:59.768018	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
32	success	2025-05-14 12:42:20.238	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 12:42:23.534137	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
33	success	2025-05-14 12:42:53.691	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 12:42:56.951091	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
34	success	2025-05-14 12:44:56.028	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 12:44:59.299246	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
35	success	2025-05-14 12:48:48.383	49.43.0.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-14 12:48:51.684906	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
36	success	2025-05-17 17:24:29.829	49.43.0.120	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-17 17:24:38.900638	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
37	success	2025-05-17 18:00:15.026	49.43.0.120	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-17 18:00:24.129195	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
38	success	2025-05-17 18:06:16.907	49.43.0.120	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-17 18:06:26.085612	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
39	success	2025-05-18 07:20:13.561	101.0.62.175	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36	2025-05-18 07:20:15.718139	yash.tagai23@gmail.com	email	yash.tagai23@gmail.com	\N
40	success	2025-05-18 07:20:37.734	101.0.62.175	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36	2025-05-18 07:20:39.827838	yash.tagai23@gmail.com	email	yash.tagai23@gmail.com	\N
41	success	2025-05-18 07:23:33.265	101.0.62.175	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36	2025-05-18 07:23:35.369007	yashtagai23@gmail.com	email	yashtagai23@gmail.com	\N
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, role_name, role_description) FROM stdin;
2	admin	Full access to all system features including user management, system settings, and data oversight.
3	developer	Access to technical and development tools with permissions for debugging, testing, and deploying features.
1	data_collector	Standard user with access to personal features and data within permitted scope.
4	manager	Can create a data collector user. Has access to super admin but only limited to user management with the creation of data collector user. Has access to 3 capabilities - Super admin with the only ability to create a new data collector user, He/she should be able to report activity, Can see the dashboard.
\.


--
-- Data for Name: shapefiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shapefiles (id, name, description, geo_data, feature_count, uploaded_at, uploaded_by) FROM stdin;
\.


--
-- Data for Name: system_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_logs (id, job, status, "time", created_at) FROM stdin;
1	Backup	Success	2025-05-12 19:21:52.905042	2025-05-13 19:21:52.905042
2	Data Sync	Failed	2025-05-11 19:21:52.905042	2025-05-13 19:21:52.905042
3	Cleanup	Success	2025-05-10 19:21:52.905042	2025-05-13 19:21:52.905042
4	Report Generation	Success	2025-05-09 19:21:52.905042	2025-05-13 19:21:52.905042
5	Backup	Failed	2025-05-08 19:21:52.905042	2025-05-13 19:21:52.905042
6	Data Sync	Success	2025-05-07 19:21:52.905042	2025-05-13 19:21:52.905042
7	Cleanup	Failed	2025-05-06 19:21:52.905042	2025-05-13 19:21:52.905042
8	Report Generation	Success	2025-05-05 19:21:52.905042	2025-05-13 19:21:52.905042
9	Backup	Success	2025-05-04 19:21:52.905042	2025-05-13 19:21:52.905042
10	Data Sync	Failed	2025-05-03 19:21:52.905042	2025-05-13 19:21:52.905042
\.


--
-- Data for Name: user_migration_map; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_migration_map (old_id, new_auth_id, email_or_phone, email, phone) FROM stdin;
57159f62-d5d4-4ae8-bced-52424e588d87	\N	ajinkya.patil60@gmail.com	\N	\N
32e21079-f012-464a-ab0c-ed2cbbb81196	\N	yashtagai23@gmail.com	\N	\N
3dce2d28-d752-4eee-bd58-1bcb5153ec1f	\N	9756326656	\N	\N
1bad69ba-5480-4f99-bcae-652d682d5ca0	\N	9179866656	\N	\N
7f9fd183-2a1b-4edb-9d97-3fd8e10b9ec6	\N	9158103963	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email_or_phone, password_hash, created_at, role, status, updated_at, created_by) FROM stdin;
57159f62-d5d4-4ae8-bced-52424e588d87	ajinkya.patil60@gmail.com	$2b$10$vvRy0uvGNUMgLlj7PYLaM.iOpGW.6U50Qhg.EX072Fjq5p7Ngh.2i	2025-05-12 18:55:33.423314+00	admin	active	2025-05-12 18:55:33.423314+00	\N
32e21079-f012-464a-ab0c-ed2cbbb81196	yashtagai23@gmail.com	$2b$10$0/3RKQX.WMKCQsrWa4gEzuHu6FzDuRZDeJ4RRwAU.7suzpg68iSgy	2025-05-12 18:34:54.958393+00	admin	active	2025-05-12 18:34:54.958393+00	\N
3dce2d28-d752-4eee-bd58-1bcb5153ec1f	9756326656	$2b$10$fwYTfG/IRBI17emkbxW2i.C6eTGOeScetkSDdiAKT7.6QQAAF52vC	2025-05-19 05:36:56.255+00	data_collector	active	2025-05-19 05:36:56.255+00	32e21079-f012-464a-ab0c-ed2cbbb81196
1bad69ba-5480-4f99-bcae-652d682d5ca0	9179866656	$2a$10$xLYam2X4se5/SrwSjcyUM.whJGUm.POkRANCAlnmlAjaYxRAdWYRC	2025-05-19 06:37:49.32+00	data_collector	active	2025-05-19 06:37:49.32+00	\N
7f9fd183-2a1b-4edb-9d97-3fd8e10b9ec6	9158103963	$2b$10$YpHbEe9DJeJa7SHugXm4KOFfYpXLCnt.GgULKUdWRdHYwW51kYGtK	2025-05-20 13:35:50.153+00	admin	active	2025-05-20 13:35:50.153+00	32e21079-f012-464a-ab0c-ed2cbbb81196
\.


--
-- Data for Name: messages_2025_05_17; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_05_17 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_05_18; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_05_18 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_05_19; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_05_19 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_05_20; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_05_20 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_05_21; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_05_21 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_05_22; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_05_22 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_05_23; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_05_23 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-05-08 04:54:30
20211116045059	2025-05-08 04:54:31
20211116050929	2025-05-08 04:54:32
20211116051442	2025-05-08 04:54:32
20211116212300	2025-05-08 04:54:33
20211116213355	2025-05-08 04:54:33
20211116213934	2025-05-08 04:54:34
20211116214523	2025-05-08 04:54:35
20211122062447	2025-05-08 04:54:35
20211124070109	2025-05-08 04:54:36
20211202204204	2025-05-08 04:54:36
20211202204605	2025-05-08 04:54:37
20211210212804	2025-05-08 04:54:39
20211228014915	2025-05-08 04:54:39
20220107221237	2025-05-08 04:54:40
20220228202821	2025-05-08 04:54:40
20220312004840	2025-05-08 04:54:41
20220603231003	2025-05-08 04:54:42
20220603232444	2025-05-08 04:54:42
20220615214548	2025-05-08 04:54:43
20220712093339	2025-05-08 04:54:43
20220908172859	2025-05-08 04:54:44
20220916233421	2025-05-08 04:54:44
20230119133233	2025-05-08 04:54:45
20230128025114	2025-05-08 04:54:46
20230128025212	2025-05-08 04:54:46
20230227211149	2025-05-08 04:54:47
20230228184745	2025-05-08 04:54:47
20230308225145	2025-05-08 04:54:48
20230328144023	2025-05-08 04:54:48
20231018144023	2025-05-08 04:54:49
20231204144023	2025-05-08 04:54:50
20231204144024	2025-05-08 04:54:51
20231204144025	2025-05-08 04:54:51
20240108234812	2025-05-08 04:54:52
20240109165339	2025-05-08 04:54:52
20240227174441	2025-05-08 04:54:53
20240311171622	2025-05-08 04:54:54
20240321100241	2025-05-08 04:54:55
20240401105812	2025-05-08 04:54:57
20240418121054	2025-05-08 04:54:57
20240523004032	2025-05-08 04:54:59
20240618124746	2025-05-08 04:55:00
20240801235015	2025-05-08 04:55:00
20240805133720	2025-05-08 04:55:01
20240827160934	2025-05-08 04:55:01
20240919163303	2025-05-08 04:55:02
20240919163305	2025-05-08 04:55:03
20241019105805	2025-05-08 04:55:03
20241030150047	2025-05-08 04:55:05
20241108114728	2025-05-08 04:55:06
20241121104152	2025-05-08 04:55:06
20241130184212	2025-05-08 04:55:07
20241220035512	2025-05-08 04:55:08
20241220123912	2025-05-08 04:55:08
20241224161212	2025-05-08 04:55:09
20250107150512	2025-05-08 04:55:09
20250110162412	2025-05-08 04:55:10
20250123174212	2025-05-08 04:55:10
20250128220012	2025-05-08 04:55:11
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id) FROM stdin;
elephant-watch	elephant-watch	\N	2025-05-20 09:07:03.512646+00	2025-05-20 09:07:03.512646+00	t	f	\N	\N	\N
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-05-08 04:54:30.535088
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-05-08 04:54:30.541533
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-05-08 04:54:30.547277
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-05-08 04:54:30.572471
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-05-08 04:54:30.597223
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-05-08 04:54:30.603393
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-05-08 04:54:30.609863
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-05-08 04:54:30.616161
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-05-08 04:54:30.621939
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-05-08 04:54:30.630435
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-05-08 04:54:30.637749
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-05-08 04:54:30.644584
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-05-08 04:54:30.651674
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-05-08 04:54:30.658425
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-05-08 04:54:30.66647
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-05-08 04:54:30.703862
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-05-08 04:54:30.711532
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-05-08 04:54:30.718455
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-05-08 04:54:30.725694
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-05-08 04:54:30.733985
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-05-08 04:54:30.742297
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-05-08 04:54:30.755341
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-05-08 04:54:30.787977
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-05-08 04:54:30.818526
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-05-08 04:54:30.827412
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-05-08 04:54:30.833706
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
2b79d191-ecac-42be-a288-2493cd6811b0	elephant-watch	activity-photos/3dce2d28-d752-4eee-bd58-1bcb5153ec1f_1747735751521.png	\N	2025-05-20 10:09:11.849754+00	2025-05-20 10:09:11.849754+00	2025-05-20 10:09:11.849754+00	{"eTag": "\\"89f769175b4d73dd8d53e1bdfb4594ee\\"", "size": 165726, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-05-20T10:09:12.000Z", "contentLength": 165726, "httpStatusCode": 200}	deed2586-d477-49c1-b092-cb4d3397787f	\N	{}
de1ec93b-0a33-45f7-aa93-fe58e4c1a001	elephant-watch	activity-photos/3dce2d28-d752-4eee-bd58-1bcb5153ec1f_1747748300027.png	\N	2025-05-20 13:38:20.866054+00	2025-05-20 13:38:20.866054+00	2025-05-20 13:38:20.866054+00	{"eTag": "\\"89f769175b4d73dd8d53e1bdfb4594ee\\"", "size": 165726, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-05-20T13:38:21.000Z", "contentLength": 165726, "httpStatusCode": 200}	51ec64d2-e1d9-4096-843e-d95313515ecd	\N	{}
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 3, true);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 12, true);


--
-- Name: app_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.app_settings_id_seq', 1, false);


--
-- Name: auth_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_settings_id_seq', 1, false);


--
-- Name: backup_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backup_settings_id_seq', 1, false);


--
-- Name: email_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.email_settings_id_seq', 1, false);


--
-- Name: error_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.error_logs_id_seq', 10, true);


--
-- Name: integration_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.integration_settings_id_seq', 1, false);


--
-- Name: login_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_logs_id_seq', 41, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- Name: system_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_logs_id_seq', 10, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 326, true);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: activity_reports activity_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_reports
    ADD CONSTRAINT activity_reports_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: auth_settings auth_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_settings
    ADD CONSTRAINT auth_settings_pkey PRIMARY KEY (id);


--
-- Name: backup_settings backup_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup_settings
    ADD CONSTRAINT backup_settings_pkey PRIMARY KEY (id);


--
-- Name: coordinates coordinates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinates
    ADD CONSTRAINT coordinates_pkey PRIMARY KEY (uid);


--
-- Name: email_settings email_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_settings
    ADD CONSTRAINT email_settings_pkey PRIMARY KEY (id);


--
-- Name: error_logs error_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.error_logs
    ADD CONSTRAINT error_logs_pkey PRIMARY KEY (id);


--
-- Name: integration_settings integration_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_settings
    ADD CONSTRAINT integration_settings_pkey PRIMARY KEY (id);


--
-- Name: login_logs login_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_logs
    ADD CONSTRAINT login_logs_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: shapefiles shapefiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shapefiles
    ADD CONSTRAINT shapefiles_pkey PRIMARY KEY (id);


--
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- Name: user_migration_map user_migration_map_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_migration_map
    ADD CONSTRAINT user_migration_map_pkey PRIMARY KEY (old_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email_or_phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_05_17 messages_2025_05_17_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_05_17
    ADD CONSTRAINT messages_2025_05_17_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_05_18 messages_2025_05_18_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_05_18
    ADD CONSTRAINT messages_2025_05_18_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_05_19 messages_2025_05_19_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_05_19
    ADD CONSTRAINT messages_2025_05_19_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_05_20 messages_2025_05_20_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_05_20
    ADD CONSTRAINT messages_2025_05_20_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_05_21 messages_2025_05_21_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_05_21
    ADD CONSTRAINT messages_2025_05_21_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_05_22 messages_2025_05_22_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_05_22
    ADD CONSTRAINT messages_2025_05_22_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_05_23 messages_2025_05_23_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_05_23
    ADD CONSTRAINT messages_2025_05_23_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_activity_logs_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_time ON public.activity_logs USING btree ("time");


--
-- Name: idx_error_logs_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_error_logs_time ON public.error_logs USING btree ("time");


--
-- Name: idx_login_logs_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_login_logs_time ON public.login_logs USING btree ("time");


--
-- Name: idx_login_logs_user_identifier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_login_logs_user_identifier ON public.login_logs USING btree (user_identifier);


--
-- Name: idx_system_logs_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_time ON public.system_logs USING btree ("time");


--
-- Name: idx_users_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_created_by ON public.users USING btree (created_by);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: messages_2025_05_17_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_17_pkey;


--
-- Name: messages_2025_05_18_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_18_pkey;


--
-- Name: messages_2025_05_19_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_19_pkey;


--
-- Name: messages_2025_05_20_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_20_pkey;


--
-- Name: messages_2025_05_21_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_21_pkey;


--
-- Name: messages_2025_05_22_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_22_pkey;


--
-- Name: messages_2025_05_23_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_23_pkey;


--
-- Name: users enforce_user_creation_permissions; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER enforce_user_creation_permissions BEFORE INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.check_user_creation_permissions();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: activity_reports activity_reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_reports
    ADD CONSTRAINT activity_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: shapefiles shapefiles_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shapefiles
    ADD CONSTRAINT shapefiles_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id);


--
-- Name: users users_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: users Admins manage all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins manage all" ON public.users USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE (((u.id)::text = (auth.uid())::text) AND (u.role = 'admin'::text)))));


--
-- Name: login_logs Allow insert for all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow insert for all" ON public.login_logs FOR INSERT WITH CHECK (true);


--
-- Name: login_logs Allow select for all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow select for all" ON public.login_logs FOR SELECT USING (true);


--
-- Name: users Allow service role or admin to insert users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow service role or admin to insert users" ON public.users FOR INSERT WITH CHECK (((auth.role() = 'service_role'::text) OR ((auth.role() = 'authenticated'::text) AND (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'admin'::text)))))));


--
-- Name: users Allow service role to insert any user; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow service role to insert any user" ON public.users FOR INSERT WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: shapefiles Anyone can view shapefiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view shapefiles" ON public.shapefiles FOR SELECT USING (true);


--
-- Name: shapefiles Authenticated users can insert shapefiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can insert shapefiles" ON public.shapefiles FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: users Insert Policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Insert Policy" ON public.users FOR INSERT WITH CHECK (true);


--
-- Name: login_logs Managers can view login logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Managers can view login logs" ON public.login_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'manager'::text)))));


--
-- Name: users Managers manage data collectors; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Managers manage data collectors" ON public.users USING (((EXISTS ( SELECT 1
   FROM public.users u
  WHERE (((u.id)::text = (auth.uid())::text) AND (u.role = 'manager'::text)))) AND (role = 'data_collector'::text)));


--
-- Name: users Users can view own data; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (((auth.uid())::text = (id)::text));


--
-- Name: coordinates; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.coordinates ENABLE ROW LEVEL SECURITY;

--
-- Name: login_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: roles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

--
-- Name: shapefiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.shapefiles ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Allow authenticated uploads to elephant-watch; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow authenticated uploads to elephant-watch" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'elephant-watch'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Allow service role full access; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow service role full access" ON storage.objects USING (true) WITH CHECK (true);


--
-- Name: objects Allow users to delete their uploads; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow users to delete their uploads" ON storage.objects FOR DELETE USING (((bucket_id = 'elephant-watch'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Allow users to update their uploads; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow users to update their uploads" ON storage.objects FOR UPDATE USING (((bucket_id = 'elephant-watch'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Give public access to elephant-watch; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Give public access to elephant-watch" ON storage.objects FOR SELECT USING ((bucket_id = 'elephant-watch'::text));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: supabase_admin
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime_messages_publication OWNER TO supabase_admin;

--
-- Name: supabase_realtime coordinates; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.coordinates;


--
-- Name: supabase_realtime users; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.users;


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: supabase_admin
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT ALL ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT ALL ON SCHEMA storage TO postgres;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION algorithm_sign(signables text, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.algorithm_sign(signables text, secret text, algorithm text) FROM postgres;
GRANT ALL ON FUNCTION extensions.algorithm_sign(signables text, secret text, algorithm text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.algorithm_sign(signables text, secret text, algorithm text) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM postgres;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM postgres;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION sign(payload json, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.sign(payload json, secret text, algorithm text) FROM postgres;
GRANT ALL ON FUNCTION extensions.sign(payload json, secret text, algorithm text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.sign(payload json, secret text, algorithm text) TO dashboard_user;


--
-- Name: FUNCTION try_cast_double(inp text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.try_cast_double(inp text) FROM postgres;
GRANT ALL ON FUNCTION extensions.try_cast_double(inp text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.try_cast_double(inp text) TO dashboard_user;


--
-- Name: FUNCTION url_decode(data text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.url_decode(data text) FROM postgres;
GRANT ALL ON FUNCTION extensions.url_decode(data text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.url_decode(data text) TO dashboard_user;


--
-- Name: FUNCTION url_encode(data bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.url_encode(data bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.url_encode(data bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.url_encode(data bytea) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION verify(token text, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.verify(token text, secret text, algorithm text) FROM postgres;
GRANT ALL ON FUNCTION extensions.verify(token text, secret text, algorithm text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.verify(token text, secret text, algorithm text) TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION can_create_user_with_role(creator_role text, new_user_role text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.can_create_user_with_role(creator_role text, new_user_role text) TO anon;
GRANT ALL ON FUNCTION public.can_create_user_with_role(creator_role text, new_user_role text) TO authenticated;
GRANT ALL ON FUNCTION public.can_create_user_with_role(creator_role text, new_user_role text) TO service_role;


--
-- Name: FUNCTION check_user_creation_permissions(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_user_creation_permissions() TO anon;
GRANT ALL ON FUNCTION public.check_user_creation_permissions() TO authenticated;
GRANT ALL ON FUNCTION public.check_user_creation_permissions() TO service_role;


--
-- Name: FUNCTION get_browser_info(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_browser_info() TO anon;
GRANT ALL ON FUNCTION public.get_browser_info() TO authenticated;
GRANT ALL ON FUNCTION public.get_browser_info() TO service_role;


--
-- Name: FUNCTION get_ip_info(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_ip_info() TO anon;
GRANT ALL ON FUNCTION public.get_ip_info() TO authenticated;
GRANT ALL ON FUNCTION public.get_ip_info() TO service_role;


--
-- Name: FUNCTION get_service_status(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_service_status() TO anon;
GRANT ALL ON FUNCTION public.get_service_status() TO authenticated;
GRANT ALL ON FUNCTION public.get_service_status() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.schema_migrations TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.schema_migrations TO postgres;
GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE activity_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.activity_logs TO anon;
GRANT ALL ON TABLE public.activity_logs TO authenticated;
GRANT ALL ON TABLE public.activity_logs TO service_role;


--
-- Name: SEQUENCE activity_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.activity_logs_id_seq TO anon;
GRANT ALL ON SEQUENCE public.activity_logs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.activity_logs_id_seq TO service_role;


--
-- Name: TABLE activity_reports; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.activity_reports TO anon;
GRANT ALL ON TABLE public.activity_reports TO authenticated;
GRANT ALL ON TABLE public.activity_reports TO service_role;


--
-- Name: TABLE app_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.app_settings TO anon;
GRANT ALL ON TABLE public.app_settings TO authenticated;
GRANT ALL ON TABLE public.app_settings TO service_role;


--
-- Name: SEQUENCE app_settings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.app_settings_id_seq TO anon;
GRANT ALL ON SEQUENCE public.app_settings_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.app_settings_id_seq TO service_role;


--
-- Name: TABLE auth_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.auth_settings TO anon;
GRANT ALL ON TABLE public.auth_settings TO authenticated;
GRANT ALL ON TABLE public.auth_settings TO service_role;


--
-- Name: SEQUENCE auth_settings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.auth_settings_id_seq TO anon;
GRANT ALL ON SEQUENCE public.auth_settings_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.auth_settings_id_seq TO service_role;


--
-- Name: TABLE backup_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.backup_settings TO anon;
GRANT ALL ON TABLE public.backup_settings TO authenticated;
GRANT ALL ON TABLE public.backup_settings TO service_role;


--
-- Name: SEQUENCE backup_settings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.backup_settings_id_seq TO anon;
GRANT ALL ON SEQUENCE public.backup_settings_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.backup_settings_id_seq TO service_role;


--
-- Name: TABLE coordinates; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.coordinates TO anon;
GRANT ALL ON TABLE public.coordinates TO authenticated;
GRANT ALL ON TABLE public.coordinates TO service_role;


--
-- Name: TABLE email_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.email_settings TO anon;
GRANT ALL ON TABLE public.email_settings TO authenticated;
GRANT ALL ON TABLE public.email_settings TO service_role;


--
-- Name: SEQUENCE email_settings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.email_settings_id_seq TO anon;
GRANT ALL ON SEQUENCE public.email_settings_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.email_settings_id_seq TO service_role;


--
-- Name: TABLE error_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.error_logs TO anon;
GRANT ALL ON TABLE public.error_logs TO authenticated;
GRANT ALL ON TABLE public.error_logs TO service_role;


--
-- Name: SEQUENCE error_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.error_logs_id_seq TO anon;
GRANT ALL ON SEQUENCE public.error_logs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.error_logs_id_seq TO service_role;


--
-- Name: TABLE integration_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.integration_settings TO anon;
GRANT ALL ON TABLE public.integration_settings TO authenticated;
GRANT ALL ON TABLE public.integration_settings TO service_role;


--
-- Name: SEQUENCE integration_settings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.integration_settings_id_seq TO anon;
GRANT ALL ON SEQUENCE public.integration_settings_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.integration_settings_id_seq TO service_role;


--
-- Name: TABLE login_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.login_logs TO anon;
GRANT ALL ON TABLE public.login_logs TO authenticated;
GRANT ALL ON TABLE public.login_logs TO service_role;


--
-- Name: SEQUENCE login_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.login_logs_id_seq TO anon;
GRANT ALL ON SEQUENCE public.login_logs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.login_logs_id_seq TO service_role;


--
-- Name: TABLE roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.roles TO anon;
GRANT ALL ON TABLE public.roles TO authenticated;
GRANT ALL ON TABLE public.roles TO service_role;


--
-- Name: SEQUENCE roles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.roles_id_seq TO anon;
GRANT ALL ON SEQUENCE public.roles_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.roles_id_seq TO service_role;


--
-- Name: TABLE shapefiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shapefiles TO anon;
GRANT ALL ON TABLE public.shapefiles TO authenticated;
GRANT ALL ON TABLE public.shapefiles TO service_role;


--
-- Name: TABLE system_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.system_logs TO anon;
GRANT ALL ON TABLE public.system_logs TO authenticated;
GRANT ALL ON TABLE public.system_logs TO service_role;


--
-- Name: SEQUENCE system_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.system_logs_id_seq TO anon;
GRANT ALL ON SEQUENCE public.system_logs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.system_logs_id_seq TO service_role;


--
-- Name: TABLE user_migration_map; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_migration_map TO anon;
GRANT ALL ON TABLE public.user_migration_map TO authenticated;
GRANT ALL ON TABLE public.user_migration_map TO service_role;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- Name: TABLE v_activity_heatmap; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_activity_heatmap TO anon;
GRANT ALL ON TABLE public.v_activity_heatmap TO authenticated;
GRANT ALL ON TABLE public.v_activity_heatmap TO service_role;


--
-- Name: TABLE v_calve_count; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_calve_count TO anon;
GRANT ALL ON TABLE public.v_calve_count TO authenticated;
GRANT ALL ON TABLE public.v_calve_count TO service_role;


--
-- Name: TABLE v_division_statistics; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_division_statistics TO anon;
GRANT ALL ON TABLE public.v_division_statistics TO authenticated;
GRANT ALL ON TABLE public.v_division_statistics TO service_role;


--
-- Name: TABLE v_female_elephant_counts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_female_elephant_counts TO anon;
GRANT ALL ON TABLE public.v_female_elephant_counts TO authenticated;
GRANT ALL ON TABLE public.v_female_elephant_counts TO service_role;


--
-- Name: TABLE v_male_elephant_counts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_male_elephant_counts TO anon;
GRANT ALL ON TABLE public.v_male_elephant_counts TO authenticated;
GRANT ALL ON TABLE public.v_male_elephant_counts TO service_role;


--
-- Name: TABLE v_recent_observations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_recent_observations TO anon;
GRANT ALL ON TABLE public.v_recent_observations TO authenticated;
GRANT ALL ON TABLE public.v_recent_observations TO service_role;


--
-- Name: TABLE v_total_elephants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_total_elephants TO anon;
GRANT ALL ON TABLE public.v_total_elephants TO authenticated;
GRANT ALL ON TABLE public.v_total_elephants TO service_role;


--
-- Name: TABLE v_total_loss; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_total_loss TO anon;
GRANT ALL ON TABLE public.v_total_loss TO authenticated;
GRANT ALL ON TABLE public.v_total_loss TO service_role;


--
-- Name: TABLE v_total_observations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_total_observations TO anon;
GRANT ALL ON TABLE public.v_total_observations TO authenticated;
GRANT ALL ON TABLE public.v_total_observations TO service_role;


--
-- Name: TABLE v_unknown_elephants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_unknown_elephants TO anon;
GRANT ALL ON TABLE public.v_unknown_elephants TO authenticated;
GRANT ALL ON TABLE public.v_unknown_elephants TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE messages_2025_05_17; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_05_17 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_05_17 TO dashboard_user;


--
-- Name: TABLE messages_2025_05_18; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_05_18 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_05_18 TO dashboard_user;


--
-- Name: TABLE messages_2025_05_19; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_05_19 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_05_19 TO dashboard_user;


--
-- Name: TABLE messages_2025_05_20; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_05_20 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_05_20 TO dashboard_user;


--
-- Name: TABLE messages_2025_05_21; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_05_21 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_05_21 TO dashboard_user;


--
-- Name: TABLE messages_2025_05_22; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_05_22 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_05_22 TO dashboard_user;


--
-- Name: TABLE messages_2025_05_23; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_05_23 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_05_23 TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres;


--
-- Name: TABLE migrations; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.migrations TO anon;
GRANT ALL ON TABLE storage.migrations TO authenticated;
GRANT ALL ON TABLE storage.migrations TO service_role;
GRANT ALL ON TABLE storage.migrations TO postgres;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES  TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS  TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES  TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO postgres;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

