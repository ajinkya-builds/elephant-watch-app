import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Helper function to create error response
function createErrorResponse(error: any, status = 500) {
  console.error('Error details:', {
    message: error.message,
    name: error.name,
    stack: error.stack,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });

  return new Response(
    JSON.stringify({
      error: error.message || 'An unknown error occurred',
      details: error.details,
      hint: error.hint,
      code: error.code,
      timestamp: new Date().toISOString()
    }), {
      status,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET, PUT, DELETE',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  console.log('Request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const requestBody = await req.text();
    console.log('Request body:', requestBody);
    
    let userData, assignments;
    try {
      const parsed = JSON.parse(requestBody);
      userData = parsed.userData;
      assignments = parsed.assignments;
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: e.message }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Creating auth user with data:', JSON.stringify(userData, null, 2));
    
    // 1. First create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        ...(userData.user_metadata || {}),
        // Ensure required fields are in user_metadata
        full_name: `${assignments.first_name || ''} ${assignments.last_name || ''}`.trim(),
      },
      // Set required fields for auth.users
      email_confirmed_at: new Date().toISOString(),
      is_sso_user: false,
      is_anonymous: false,
    });
    
    if (authError) {
      console.error('Error creating auth user:', authError);
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }
    
    console.log('Auth user created successfully:', authData.user.id);
    
    // 2. Now create the user profile with the auth_id
    const userProfile = {
      auth_id: authData.user.id,
      first_name: assignments.first_name || '',
      last_name: assignments.last_name || '',
      email: userData.email,
      phone: assignments.phone || null,
      position: assignments.position || null,
      role: assignments.role || 'data_collector', // Default role if not provided
      status: 'active', // Required field
      created_by: assignments.created_by || null,
    };
    
    // Ensure required fields are provided
    if (!userProfile.role) {
      throw new Error('Role is required');
    }
    if (!userProfile.status) {
      throw new Error('Status is required');
    }
    
    console.log('Creating user profile with data:', JSON.stringify(userProfile, null, 2));
    
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .insert(userProfile)
      .select()
      .single();
      
    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Try to clean up the auth user if profile creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      } catch (deleteError) {
        console.error('Error cleaning up auth user:', deleteError);
      }
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }
    
    console.log('User profile created successfully with ID:', profileData.id);

    // Insert region assignments into user_region_assignment if needed
    let regionData = null;
    if (assignments.division_id) {
      const regionAssignment = {
        user_id: profileData.id,
        division_id: assignments.division_id,
        range_id: assignments.range_id || null,
        beat_id: assignments.beat_id || null,
        start_date: new Date().toISOString().split('T')[0], // Required field, set to today
      };
      
      // Ensure required fields are provided
      if (!regionAssignment.division_id) {
        throw new Error('Division ID is required for region assignment');
      }
      
      console.log('Creating region assignment:', JSON.stringify(regionAssignment, null, 2));
      
      const { data, error: regionError } = await supabaseAdmin
        .from('user_region_assignments')
        .insert(regionAssignment)
        .select()
        .single();
        
      if (regionError) {
        console.error('Error creating region assignment:', regionError);
        // Don't fail the whole operation if region assignment fails
      } else {
        regionData = data;
      }
    }

    const response = {
      success: true,
      user: profileData,
      region_assignment: regionData,
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending successful response:', response);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(response).length.toString()
      },
    });
  } catch (error) {
    console.error('Error in create-user function:', error);
    return createErrorResponse(error, error.status || 500);
  }
}); 