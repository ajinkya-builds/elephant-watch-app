import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('Verifying Supabase configuration...\n');

// Check URL
console.log('1. Checking Supabase URL:');
if (!supabaseUrl) {
  console.log('❌ VITE_SUPABASE_URL is missing');
} else if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.log('❌ VITE_SUPABASE_URL format is invalid');
  console.log('Expected format: https://your-project-id.supabase.co');
  console.log('Current value:', supabaseUrl);
} else {
  console.log('✅ VITE_SUPABASE_URL format is valid');
}

// Check Anon Key
console.log('\n2. Checking Anon Key:');
if (!supabaseAnonKey) {
  console.log('❌ VITE_SUPABASE_ANON_KEY is missing');
} else if (!supabaseAnonKey.startsWith('eyJ')) {
  console.log('❌ VITE_SUPABASE_ANON_KEY format is invalid');
  console.log('Expected format: Should start with "eyJ"');
  console.log('Current value:', supabaseAnonKey.substring(0, 10) + '...');
} else {
  console.log('✅ VITE_SUPABASE_ANON_KEY format appears valid');
  console.log('Length:', supabaseAnonKey.length);
}

// Check Service Role Key
console.log('\n3. Checking Service Role Key:');
if (!supabaseServiceKey) {
  console.log('❌ VITE_SUPABASE_SERVICE_ROLE_KEY is missing');
} else if (!supabaseServiceKey.startsWith('eyJ')) {
  console.log('❌ VITE_SUPABASE_SERVICE_ROLE_KEY format is invalid');
  console.log('Expected format: Should start with "eyJ"');
  console.log('Current value:', supabaseServiceKey.substring(0, 10) + '...');
} else {
  console.log('✅ VITE_SUPABASE_SERVICE_ROLE_KEY format appears valid');
  console.log('Length:', supabaseServiceKey.length);
}

// Additional checks
console.log('\n4. Additional Checks:');
if (supabaseAnonKey && supabaseServiceKey) {
  if (supabaseAnonKey === supabaseServiceKey) {
    console.log('❌ Warning: Anon key and Service Role key are identical');
  } else {
    console.log('✅ Anon key and Service Role key are different');
  }
}

// Check for common issues
console.log('\n5. Common Issues Check:');
[supabaseUrl, supabaseAnonKey, supabaseServiceKey].forEach(value => {
  if (value?.includes(' ')) console.log('❌ Warning: Found spaces in one of the values');
  if (value?.includes('\n')) console.log('❌ Warning: Found line breaks in one of the values');
  if (value?.includes('"')) console.log('❌ Warning: Found quote marks in one of the values');
  if (value?.includes("'")) console.log('❌ Warning: Found single quotes in one of the values');
}); 