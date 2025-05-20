import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY?.trim();

console.log('\n🔍 Verifying Supabase Configuration\n');

// Check URL
console.log('1. Project URL:');
if (!supabaseUrl) {
  console.log('❌ VITE_SUPABASE_URL is missing');
  process.exit(1);
}

console.log('✓ URL exists:', supabaseUrl);
console.log('✓ URL format valid:', supabaseUrl.startsWith('https://'));
console.log('✓ Domain valid:', supabaseUrl.includes('.supabase.co'));

// Check Anon Key
console.log('\n2. Anon Key:');
if (!supabaseAnonKey) {
  console.log('❌ VITE_SUPABASE_ANON_KEY is missing');
  process.exit(1);
}

const anonKeyParts = supabaseAnonKey.split('.');
console.log('✓ Key exists (length):', supabaseAnonKey.length);
console.log('✓ JWT format:', anonKeyParts.length === 3);

try {
  const decodedAnonPayload = JSON.parse(Buffer.from(anonKeyParts[1], 'base64').toString());
  console.log('✓ JWT payload:', {
    role: decodedAnonPayload.role,
    exp: new Date(decodedAnonPayload.exp * 1000).toISOString(),
    ref: decodedAnonPayload.ref
  });
} catch (error) {
  console.log('❌ Failed to decode anon key JWT:', error.message);
}

// Check Service Role Key
console.log('\n3. Service Role Key:');
if (!supabaseServiceKey) {
  console.log('❌ VITE_SUPABASE_SERVICE_ROLE_KEY is missing');
  process.exit(1);
}

const serviceKeyParts = supabaseServiceKey.split('.');
console.log('✓ Key exists (length):', supabaseServiceKey.length);
console.log('✓ JWT format:', serviceKeyParts.length === 3);

try {
  const decodedServicePayload = JSON.parse(Buffer.from(serviceKeyParts[1], 'base64').toString());
  console.log('✓ JWT payload:', {
    role: decodedServicePayload.role,
    exp: new Date(decodedServicePayload.exp * 1000).toISOString(),
    ref: decodedServicePayload.ref
  });
} catch (error) {
  console.log('❌ Failed to decode service key JWT:', error.message);
}

// Test connections
console.log('\n4. Testing Connections:');

// Test with anon key
const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('\nTesting anon client:');
try {
  // First try to get the current session
  const { data: sessionData, error: sessionError } = await anonClient.auth.getSession();
  if (sessionError) {
    console.log('❌ Auth session error:', {
      message: sessionError.message,
      code: sessionError.code,
      details: sessionError.details,
      hint: sessionError.hint
    });
  } else {
    console.log('✓ Auth session check passed');
  }

  // Then try a simple health check query
  const { data: healthData, error: healthError } = await anonClient
    .from('users')
    .select('count')
    .limit(1)
    .single();

  if (healthError) {
    console.log('❌ Database health check error:', {
      message: healthError.message,
      code: healthError.code,
      details: healthError.details,
      hint: healthError.hint
    });
  } else {
    console.log('✓ Database health check passed');
  }
} catch (error) {
  console.log('❌ Anon client error:', error.message);
}

// Test with service role key
const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('\nTesting service role client:');
try {
  const { error: serviceError } = await serviceClient
    .from('users')
    .select('count')
    .limit(1)
    .single();

  if (serviceError) {
    console.log('❌ Service role client error:', {
      message: serviceError.message,
      code: serviceError.code,
      details: serviceError.details,
      hint: serviceError.hint
    });
  } else {
    console.log('✓ Service role client connection successful');
  }
} catch (error) {
  console.log('❌ Service role client error:', error.message);
}

// Test auth endpoints
console.log('\n5. Testing Auth Endpoints:');

try {
  const { error: authError } = await anonClient.auth.getSession();
  if (authError) {
    console.log('❌ Auth endpoint error:', authError.message);
  } else {
    console.log('✓ Auth endpoint accessible');
  }
} catch (error) {
  console.log('❌ Auth endpoint error:', error.message);
}

console.log('\nVerification complete! Check the logs above for any issues.'); 