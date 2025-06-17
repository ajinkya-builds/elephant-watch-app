import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { userData, assignments } = await req.json();

    // Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser(userData);
    if (authError) throw authError;

    // Create the user profile in public.users
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({ ...assignments, auth_id: authData.user.id })
      .select()
      .single();
    if (profileError) throw profileError;

    return new Response(JSON.stringify({ user: profileData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}); 