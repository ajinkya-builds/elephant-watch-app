import { createClient } from '@supabase/supabase-js';

// These environment variables will be read from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY?.trim();

// Debug environment variables
console.log('=== Supabase Admin Configuration Debug ===');
console.log('URL:', {
  value: supabaseUrl,
  length: supabaseUrl?.length,
  type: typeof supabaseUrl,
  firstChar: supabaseUrl?.[0],
  lastChar: supabaseUrl?.[supabaseUrl.length - 1]
});

console.log('Service Role Key:', {
  exists: !!supabaseServiceKey,
  length: supabaseServiceKey?.length,
  type: typeof supabaseServiceKey,
  parts: supabaseServiceKey?.split('.').length,
  firstChar: supabaseServiceKey?.[0],
  lastChar: supabaseServiceKey?.[supabaseServiceKey.length - 1]
});

// Validate URL format
if (!supabaseUrl || typeof supabaseUrl !== 'string') {
  console.error('Invalid VITE_SUPABASE_URL:', {
    value: supabaseUrl,
    type: typeof supabaseUrl
  });
  throw new Error(`Invalid VITE_SUPABASE_URL: ${supabaseUrl}`);
}

// Validate Service Role Key format
if (!supabaseServiceKey || typeof supabaseServiceKey !== 'string') {
  console.error('Invalid VITE_SUPABASE_SERVICE_ROLE_KEY:', {
    keyPresent: !!supabaseServiceKey,
    type: typeof supabaseServiceKey
  });
  throw new Error('VITE_SUPABASE_SERVICE_ROLE_KEY is missing or invalid');
}

// Validate JWT format
const keyParts = supabaseServiceKey.split('.');
if (keyParts.length !== 3) {
  console.error('Invalid JWT format for service role key:', {
    parts: keyParts.length,
    expectedParts: 3
  });
  throw new Error('Service role key must be a valid JWT token');
}

try {
  // Use browser-compatible base64 decoding
  const base64Url = keyParts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window.atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  
  const payload = JSON.parse(jsonPayload);
  if (payload.role !== 'service_role') {
    throw new Error(`Invalid role in service key: ${payload.role}`);
  }
  console.log('Service key JWT payload validated:', {
    role: payload.role,
    exp: new Date(payload.exp * 1000).toISOString(),
    ref: payload.ref
  });
} catch (error) {
  console.error('Failed to validate service key JWT:', error);
  throw error;
}

// Create the Supabase admin client
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Helper function to check admin connection
export const checkAdminConnection = async () => {
  try {
    console.log('Testing admin client connection...');
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)
      .single();

    if (error) {
      console.error('Admin connection test failed:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return false;
    }

    console.log('Admin connection test successful:', { data });
    return true;
  } catch (error) {
    console.error('Unexpected error during admin connection test:', error);
    return false;
  }
};
