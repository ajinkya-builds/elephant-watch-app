// @deno-types="https://deno.land/x/types/deno.d.ts"
/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

// @deno-types="https://deno.land/x/types/deno.d.ts"
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Add type for AuthUser
interface AuthUser {
  id: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string;
  // Add other properties as needed
}

// Declare Deno namespace for TypeScript
declare const Deno: any;

// Enhanced error handling
class AppError extends Error {
  constructor(message: string, public status: number = 500, public details?: any) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

// Utility function to log errors with context
function logError(error: any, context: string = '') {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      details: error?.details || error
    },
    env: {
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    }
  };
  console.error(JSON.stringify(errorInfo, null, 2));
  return errorInfo;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET, PUT, DELETE',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

interface UserProfile {
  auth_id: string;
  email: string;
  first_name: string;
  last_name: string;
  position: string;
  role: string;
  division_id?: string;
  range_id?: string;
  beat_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface UserData {
  email: string;
  password?: string;
  phone?: string;
  email_confirm?: boolean;
  user_metadata?: Record<string, unknown>;
}

interface RequestBody {
  userData: UserData;
  assignments: {
    first_name: string;
    last_name: string;
    role: string;
    position: string;
    division_id?: string;
    range_id?: string;
    beat_id?: string;
  };
}

interface RegionAssignment {
  user_id: string;
  division_id: string;
  range_id?: string | null;
  beat_id?: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    role?: string;
    position?: string;
  };
}

// Main handler for the Edge Function
serve(async (req: Request) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  console.log('=== New Request ===', {
    method: req.method,
    url: req.url,
    requestId,
    timestamp: new Date().toISOString()
  });
  
  // Declare variables at function scope
  let requestBody: RequestBody | null = null;
  let userData: UserData | null = null;
  let assignments: RequestBody['assignments'] | null = null;
  let supabaseAdmin: SupabaseClient | null = null;
  let authUser: AuthUser | null = null;
  let isNewUser = false;
  
  try {
    // Log request details
    const requestInfo = {
      requestId,
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      timestamp: new Date().toISOString()
    };
    console.log('Request received:', JSON.stringify(requestInfo, null, 2));

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      console.log('Handling CORS preflight request');
      return new Response('ok', { headers: corsHeaders });
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new AppError('Missing required environment variables', 500, {
        missing: !supabaseUrl ? 'SUPABASE_URL' : 'SUPABASE_SERVICE_ROLE_KEY',
        requestId
      });
    }
    
    // Initialize Supabase client with service role key
    console.log('Initializing Supabase client', { 
      url: supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      requestId,
      timestamp: new Date().toISOString()
    });
    
    // Initialize Supabase client
    try {
      supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: { 
            'x-request-id': requestId,
            'Authorization': `Bearer ${serviceRoleKey}`
          },
        },
      });
      
      // Test the connection
      const { data: testData, error: testError } = await supabaseAdmin.from('users').select('*').limit(1);
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        throw new AppError(`Failed to connect to Supabase: ${testError.message}`, 500, {
          requestId,
          error: testError
        });
      }
      
      console.log('Supabase client initialized and connection test successful');
    } catch (error) {
      console.error('Failed to initialize Supabase client:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        requestId,
        timestamp: new Date().toISOString()
      });
      throw new AppError('Failed to initialize database connection', 500, {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      });
    }

    // Parse request body
    try {
      const bodyText = await req.text();
      console.log('Raw request body received:', bodyText);
      
      if (!bodyText) {
        throw new AppError('Request body is empty', 400, { requestId });
      }
      
      try {
        requestBody = JSON.parse(bodyText) as RequestBody;
      } catch (parseError) {
        console.error('Failed to parse request body:', parseError);
        throw new AppError('Invalid JSON in request body', 400, {
          requestId,
          error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        });
      }
      
      console.log('Parsed request body:', JSON.stringify(requestBody, null, 2));
      
      // Validate request body structure
      if (!requestBody || typeof requestBody !== 'object') {
        throw new AppError('Request body is missing or invalid', 400, { 
          requestId,
          received: requestBody
        });
      }
      
      // Extract and validate user data
      userData = requestBody.userData;
      assignments = requestBody.assignments;
      
      if (!userData || typeof userData !== 'object' || !assignments || typeof assignments !== 'object') {
        throw new AppError('Invalid request format', 400, {
          requestId,
          required: ['userData', 'assignments'],
          received: Object.keys(requestBody).filter(k => 
            requestBody?.[k as keyof RequestBody] !== undefined
          )
        });
      }
      
      // Validate required fields in userData
      if (!userData.email) {
        throw new AppError('Missing required field: email', 400, { requestId });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new AppError('Invalid email format', 400, { requestId, email: userData.email });
      }
      
      // Validate required fields in assignments
      const missingFields = [];
      if (!assignments.first_name) missingFields.push('first_name');
      if (!assignments.last_name) missingFields.push('last_name');
      if (!assignments.role) missingFields.push('role');
      
      if (missingFields.length > 0) {
        throw new AppError(
          `Missing required fields in assignments: ${missingFields.join(', ')}`,
          400,
          { requestId, missingFields }
        );
      }
    } catch (e) {
      const error = e as Error | AppError;
      const status = error instanceof AppError ? error.status : 400;
      const errorDetails = {
        error: error.message,
        stack: error.stack,
        status,
        requestId,
        timestamp: new Date().toISOString(),
        ...(error instanceof AppError ? error.details : {})
      };
      
      console.error('Request validation error:', JSON.stringify(errorDetails, null, 2));
      
      const responseBody = {
        error: 'Invalid request',
        message: error.message,
        ...(error instanceof AppError && error.details ? { details: error.details } : {}),
        requestId,
        timestamp: new Date().toISOString()
      };
      
      return new Response(
        JSON.stringify(responseBody),
        { 
          status,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'x-request-id': requestId
          } 
        }
      );
    }

    // Validate required fields
    if (!requestBody.userData.email || !requestBody.assignments.first_name || !requestBody.assignments.last_name || 
        !requestBody.assignments.role || !requestBody.assignments.position) {
      throw new AppError('Missing required fields', 400, {
        required: ['userData.email', 'assignments.first_name', 'assignments.last_name', 
                   'assignments.role', 'assignments.position'],
        received: Object.keys(requestBody)
      });
    }
    
    // Ensure password is provided for new users
    if (!requestBody.userData.password && !requestBody.userData.phone) {
      throw new AppError('Either password or phone number is required', 400);
    }
    
    // Check if user already exists in auth
    try {
      if (!userData?.email) {
        throw new AppError('User email is required', 400, { requestId });
      }
      
      console.log('Checking for existing user with email:', userData.email);
      
      if (!supabaseAdmin) {
        throw new AppError('Supabase client not initialized', 500, { requestId });
      }
      
      // Try to get user by email
      console.log('Fetching user by email...');
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000 // Adjust based on your expected user count
      });
      
      if (listError) {
        console.error('Error listing users:', listError);
        throw new AppError('Failed to check existing users', 500, {
          requestId,
          error: listError.message,
          details: listError
        });
      }
      
      console.log(`Found ${users?.length || 0} users in the system`);
      
      const emailToFind = userData.email.toLowerCase();
      const existingUser = users?.find(u => u.email?.toLowerCase() === emailToFind);
      
      if (existingUser) {
        console.log('Found existing auth user:', { 
          id: existingUser.id,
          email: existingUser.email,
          created_at: existingUser.created_at,
          last_sign_in_at: existingUser.last_sign_in_at
        });
        authUser = existingUser;
        isNewUser = false;
      } else {
        console.log('No existing auth user found with email:', userData.email);
        isNewUser = true;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error checking for existing auth user:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        requestId,
        timestamp: new Date().toISOString()
      });
      
      // Continue with user creation even if check fails
      console.log('Continuing with user creation despite error in checking existing user');
    }

    // Main user creation logic with transaction-like behavior
    const createUserWithTransaction = async () => {
      console.log('Starting user creation process');
      
      if (authUser) {
        // User exists in auth, check if profile exists
        try {
          // Check if user profile exists in public.users
          const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
            .from('users')
            .select('id, email, first_name, last_name')
            .eq('auth_id', authUser.id)
            .single();

          if (existingProfile) {
            console.log('User profile already exists:', { 
              userId: authUser.id, 
              profileId: existingProfile.id,
              email: existingProfile.email,
              name: `${existingProfile.first_name} ${existingProfile.last_name}`.trim()
            });
            
            throw new AppError(
              `A user with the email ${requestBody.userData.email} already exists.`,
              409, // Conflict
              {
                userId: authUser.id,
                profileId: existingProfile.id,
                email: requestBody.userData.email
              }
            );
          }
          
          console.log('No profile found for existing auth user, will create profile', { 
            userId: authUser.id, 
            email: requestBody.userData.email 
          });
          
        } catch (error) {
          if (error instanceof AppError) throw error;
          
          console.error('Error checking for user profile:', error);
          throw new AppError(
            'Unable to verify user profile status. Please try again or contact support.',
            user_id: profileData.id,
            division_id: requestBody.assignments.division_id,
            range_id: requestBody.assignments.range_id || null,
            beat_id: requestBody.assignments.beat_id || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: authUser.id
          };

          const { data: regionAssignmentData, error: regionError } = await supabaseAdmin
            .from('user_region_assignments')
            .insert(regionAssignment)
            .select()
            .single();

          if (regionError) {
            console.error('Error creating region assignment:', regionError);
            throw new Error(`Failed to create region assignment: ${regionError.message}`);
          }
          regionData = regionAssignmentData;
        }

        // If we get here, all operations were successful
        return { 
          authUser, 
          profileData, 
          regionData,
          isNewUser 
        };
      } catch (error: any) {
        // If we created a new auth user but something failed, clean up
        if (isNewUser && authUser?.id) {
          console.log('Rolling back user creation due to error:', error.message);
          try {
            // Delete the profile if it was created
            if (profileData?.id) {
              await supabaseAdmin
                .from('users')
                .delete()
                .eq('id', profileData.id);
            }
            // Delete the auth user
            await supabaseAdmin.auth.admin.deleteUser(authUser.id);
            console.log('Successfully rolled back user creation');
          } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
            // Continue to throw the original error
          }
        }
        throw error; // Re-throw the original error
      }
    };

    // Execute the transaction
    try {
      console.log('Executing user creation transaction');
      console.log('Environment variables:', {
        hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
        hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      });
      
      const result = await createUserWithTransaction();
      console.log('User creation transaction completed:', { 
        hasAuthUser: !!result?.authUser,
        hasProfileData: !!result?.profileData,
        isNewUser: result?.isNewUser,
        requestId
      });
      
      const { authUser, profileData, isNewUser } = result;
      
      if (!authUser || !profileData) {
        throw new AppError('Failed to create user or profile', 500, {
          hasAuthUser: !!authUser,
          hasProfileData: !!profileData,
          requestId
        });
      }
      
      const responseData = {
        success: true,
        userId: authUser.id,
        profileId: profileData.id,
        isNewUser,
        requestId,
        timestamp: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`
      };
      
      console.log('User creation successful:', JSON.stringify(responseData, null, 2));
      
      return new Response(
        JSON.stringify(responseData),
        { 
          status: 201, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'x-request-id': requestId
          } 
        }
      );
      
    } catch (error: any) {
      // Log the complete error with stack trace
      const errorDetails = {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        code: error?.code,
        details: error?.details || error,
        requestId,
        errorString: String(error),
        errorKeys: Object.keys(error || {}),
        timestamp: new Date().toISOString()
      };
      
      console.error('Detailed error in create-user function:', JSON.stringify(errorDetails, null, 2));
      
      // Log additional error information if available
      if (error?.response) {
        console.error('Error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      // Log environment variables (excluding sensitive ones)
      console.log('Environment variables:', {
        hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
        hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
        environment: Deno.env.get('ENVIRONMENT') || 'development',
        denoVersion: Deno.version.deno,
        typescriptVersion: Deno.version.typescript,
        v8Version: Deno.version.v8
      });
      
      // Log the error using our utility function
      logError(error, 'Error in create-user function');
      
      // Determine the status code
      const status = error?.status || error?.code || 500;
      
      // Prepare error response
      const errorResponse: any = {
        error: error?.message || 'An unknown error occurred',
        requestId,
        timestamp: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`
      };
      
      // Add additional error details if available
      if (error?.details) {
        errorResponse.details = error.details;
      }
      
      // For debugging, include more details in non-production
      const env = Deno.env.get('ENVIRONMENT');
      if (env && env !== 'production') {
        errorResponse.debug = {
          name: error?.name,
          code: error?.code,
          stack: error?.stack
        };
      }
      
      return new Response(
        JSON.stringify(errorResponse),
        { 
          status,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'x-request-id': requestId
          } 
        }
      );
    }
  } catch (error: any) {
    // Log any unhandled errors
    console.error('Unhandled error in create-user function:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      requestId
    });
    
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred',
        requestId,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'x-request-id': requestId
        }
      }
    );
  }
});