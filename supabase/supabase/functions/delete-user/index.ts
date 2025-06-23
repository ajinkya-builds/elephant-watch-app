// @deno-types="https://deno.land/x/types/deno.d.ts"
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours
};

// Helper function to handle CORS preflight
function handleOptions() {
  return new Response(null, {
    status: 204, // No content
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/plain',
    },
  });
}

// Helper function to create a JSON response with CORS headers
function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, (key, value) => 
    value instanceof Error ? {
      name: value.name,
      message: value.message,
      stack: value.stack,
      ...(value as any).details && { details: (value as any).details },
      ...(value as any).code && { code: (value as any).code },
      ...(value as any).hint && { hint: (value as any).hint },
    } : value
  ), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

class AppError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Main function to handle the request
async function handleRequest(req: Request) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  console.log(`[${requestId}] ${req.method} ${req.url}`);
  
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return handleOptions();
    }

    // Only allow POST method
    if (req.method !== 'POST') {
      throw new AppError('Method not allowed', 405);
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error(`[${requestId}] Missing required environment variables`);
      throw new AppError('Server configuration error', 500);
    }

    // Create admin client with service role key
    console.log(`[${requestId}] Initializing Supabase client`);
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: { 'x-request-id': requestId }
      }
    });

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log(`[${requestId}] Received request with body:`, requestBody);
    } catch (error) {
      console.error(`[${requestId}] Error parsing request body:`, error);
      throw new AppError('Invalid request body. Expected JSON with userId and authId.', 400);
    }
    
    const { userId, authId } = requestBody;
    console.log(`[${requestId}] Received request to delete user:`, { userId, authId });
    
    if (!userId || !authId) {
      throw new AppError('Missing required parameters: userId and authId are required', 400);
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId) || !uuidRegex.test(authId)) {
      throw new AppError('Invalid user ID format', 400);
    }

    try {
      // First delete from public.users
      console.log(`[${requestId}] Deleting from public.users`);
      const { error: publicError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);

      if (publicError) {
        console.error(`[${requestId}] Error deleting from public.users:`, publicError);
        throw new AppError(
          `Failed to delete user from public.users: ${publicError.message}`,
          500,
          { code: publicError.code, hint: publicError.hint, details: publicError.details }
        );
      }

      // Then delete from auth.users using Admin API
      console.log(`[${requestId}] Deleting from auth.users`);
      const authAdminUrl = supabaseUrl.replace('/rest/v1', ''); // Remove the /rest/v1 part
      const authResponse = await fetch(
        `${authAdminUrl}/auth/v1/admin/users/${authId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey, // Add API key as required by Supabase
          },
        }
      );

      if (!authResponse.ok) {
        const errorText = await authResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        console.error(`[${requestId}] Error deleting from auth.users:`, {
          status: authResponse.status,
          statusText: authResponse.statusText,
          error: errorData,
          url: `${authAdminUrl}/auth/v1/admin/users/${authId}`
        });
        
        throw new AppError(
          `Failed to delete auth user: ${errorData.message || authResponse.statusText || 'Unknown error'}`,
          authResponse.status,
          errorData
        );
      }

      console.log(`[${requestId}] User deleted successfully`);
      return jsonResponse({
        success: true,
        message: 'User deleted successfully',
        requestId,
      });
      
    } catch (error) {
      console.error(`[${requestId}] Error in delete operation:`, error);
      throw new AppError(
        error.message || 'Database operation failed',
        error.status || 500,
        error.details
      );
    }
    
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorDetails = error instanceof Error ? {
      name: error.name,
      stack: error.stack,
      ...(error as any).details && { details: (error as any).details },
    } : { error };
    
    console.error(`[${requestId}] Error processing request:`, {
      status,
      message,
      ...errorDetails,
      processingTime: `${Date.now() - startTime}ms`,
    });
    
    return jsonResponse({
      success: false,
      error: message,
      requestId,
      ...errorDetails,
    }, status);
  } finally {
    console.log(`[${requestId}] Request completed in ${Date.now() - startTime}ms`);
  }
}

// Start the server
serve(handleRequest);
