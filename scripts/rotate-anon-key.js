import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Create admin client
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function rotateAnonKey() {
  try {
    console.log('Attempting to rotate anon key...');

    // First, verify service role access
    const { data: testData, error: testError } = await adminClient
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Service role access failed:', testError);
      return;
    }
    console.log('✓ Service role access verified');

    // Create a new role with anon permissions
    const { error: roleError } = await adminClient.rpc('create_db_role', {
      role_name: 'anon_temp',
      is_superuser: false,
      can_login: true,
      connection_limit: -1,
      valid_until: 'infinity',
      member_of: ['anon']
    });

    if (roleError) {
      console.error('❌ Failed to create role:', roleError);
      return;
    }
    console.log('✓ Created temporary anon role');

    // Generate a new key for the role
    const { data: keyData, error: keyError } = await adminClient.rpc('generate_jwt', {
      role: 'anon_temp',
      exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year
    });

    if (keyError) {
      console.error('❌ Failed to generate key:', keyError);
      return;
    }

    console.log('\nNew anon key generated successfully!');
    console.log('Please update your .env file with this new key:');
    console.log('VITE_SUPABASE_ANON_KEY=' + keyData.token);

    // Test the new key
    const newClient = createClient(supabaseUrl, keyData.token, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { error: testNewError } = await newClient
      .from('users')
      .select('count')
      .limit(1);

    if (testNewError) {
      console.error('\n❌ New key test failed:', testNewError);
    } else {
      console.log('\n✓ New key working correctly');
    }

  } catch (error) {
    console.error('Error rotating key:', error);
  }
}

rotateAnonKey(); 