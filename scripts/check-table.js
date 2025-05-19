import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable() {
  try {
    // Check if we can access the users table
    console.log('Checking users table access...');
    
    // Try to list all users
    const { data: users, error: listError } = await supabase
      .from('users')
      .select('*');

    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    console.log('Successfully accessed users table');
    console.log('Number of users:', users.length);
    console.log('Sample user:', users[0]);

    // Check RLS policies
    console.log('\nChecking RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'users');

    if (policyError) {
      console.error('Error checking policies:', policyError);
      return;
    }

    console.log('Current RLS policies for users table:');
    policies.forEach(policy => {
      console.log(`- ${policy.policyname}: ${policy.cmd} (${policy.qual})`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkTable(); 