import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY?.trim();

console.log('\n🔍 Verifying RLS Policies\n');

// Create clients with different keys
const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

async function testPolicy(client, operation, description) {
  console.log(`Testing ${description}...`);
  try {
    let result;
    switch (operation) {
      case 'select':
        result = await client
          .from('users')
          .select('count')
          .limit(1)
          .single();
        break;
      case 'insert':
        result = await client
          .from('users')
          .insert([
            {
              email: 'test@example.com',
              role: 'data_collector',
              status: 'active'
            }
          ])
          .select()
          .single();
        break;
      case 'update':
        result = await client
          .from('users')
          .update({ status: 'active' })
          .eq('email', 'test@example.com')
          .select()
          .single();
        break;
      case 'delete':
        result = await client
          .from('users')
          .delete()
          .eq('email', 'test@example.com')
          .select()
          .single();
        break;
    }

    if (result.error) {
      if (result.error.code === 'PGRST301') {
        console.log('✓ Access denied as expected');
      } else {
        console.log('❌ Unexpected error:', {
          code: result.error.code,
          message: result.error.message,
          hint: result.error.hint
        });
      }
    } else {
      console.log('✓ Access granted');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Test anon client
console.log('\nTesting anon client:');
await testPolicy(anonClient, 'select', 'public read access');
await testPolicy(anonClient, 'insert', 'public insert access');
await testPolicy(anonClient, 'update', 'public update access');
await testPolicy(anonClient, 'delete', 'public delete access');

// Test service role client
console.log('\nTesting service role client:');
await testPolicy(serviceClient, 'select', 'service role read access');
await testPolicy(serviceClient, 'insert', 'service role insert access');
await testPolicy(serviceClient, 'update', 'service role update access');
await testPolicy(serviceClient, 'delete', 'service role delete access');

console.log('\nVerification complete! Check the logs above for any issues.'); 