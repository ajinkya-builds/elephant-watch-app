import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment variables loaded:');
console.log('URL:', supabaseUrl?.substring(0, 20) + '...');
console.log('Key:', supabaseServiceKey?.substring(0, 10) + '...');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\nMissing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function checkSchema() {
  try {
    console.log('\nTesting connection by querying users table...');
    
    // Try a simple query to the users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116') {
        console.error('Error: Users table does not exist');
        console.log('\nCreate it with this SQL:');
        console.log(`
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id),
  email TEXT,
  phone TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'data_collector')),
  position TEXT CHECK (position IN ('Ranger', 'DFO', 'Officer', 'Guard')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT users_auth_id_key UNIQUE (auth_id),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_phone_key UNIQUE (phone)
);

-- Create indexes
CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);
        `);
      } else {
        console.error('Error querying users table:', error);
        console.log('\nFull error details:', JSON.stringify(error, null, 2));
      }
      return;
    }

    console.log('Successfully connected to Supabase!');
    if (data && data.length > 0) {
      console.log('\nUsers table exists with data');
      console.log('Sample user structure:', Object.keys(data[0]).join(', '));
    } else {
      console.log('\nUsers table exists but is empty');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchema(); 