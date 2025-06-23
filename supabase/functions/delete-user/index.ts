import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
};

// Helper function to handle CORS preflight
function handleOptions(request: Request) {
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null
  ) {
    return new Response(null, {
      headers: corsHeaders,
    });
  } else {
    return new Response(null, {
      headers: {
        Allow: 'DELETE, OPTIONS',
      },
    });
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleOptions(req);
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Parse request body
    const { userId, authId } = await req.json();
    
    if (!userId || !authId) {
      throw new Error('Missing required parameters: userId and authId are required');
    }

    // Start a transaction to ensure atomicity
    const { data, error } = await supabaseAdmin.rpc('delete_user_transaction', {
      user_id: userId,
      auth_id: authId
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User deleted successfully',
        data 
      }), 
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in delete-user function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to delete user',
        details: error.details || null
      }), 
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: error.status || 500,
      }
    );
  }
});
