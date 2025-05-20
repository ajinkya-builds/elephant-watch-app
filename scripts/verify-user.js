import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function verifyUser(identifier) {
  try {
    // Check in auth.users table
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error checking auth users:', authError);
      return;
    }

    const matchingAuthUser = authUser.users.find(u => 
      u.email === identifier || u.phone === identifier
    );

    console.log('\nAuth User Check:');
    if (matchingAuthUser) {
      console.log('Found in auth.users:', {
        id: matchingAuthUser.id,
        email: matchingAuthUser.email,
        phone: matchingAuthUser.phone,
        confirmed_at: matchingAuthUser.email_confirmed_at || matchingAuthUser.phone_confirmed_at
      });
    } else {
      console.log('Not found in auth.users');
    }

    // Check in public.users table
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${identifier},phone.eq.${identifier}`)
      .single();

    console.log('\nPublic User Check:');
    if (publicError) {
      console.log('Error or not found in public.users:', publicError.message);
    } else if (publicUser) {
      console.log('Found in public.users:', {
        id: publicUser.id,
        auth_id: publicUser.auth_id,
        email: publicUser.email,
        phone: publicUser.phone,
        role: publicUser.role
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Get identifier from command line argument
const identifier = process.argv[2];
if (!identifier) {
  console.error('Please provide an email or phone number as argument');
  process.exit(1);
}

verifyUser(identifier); 