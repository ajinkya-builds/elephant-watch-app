import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
  try {
    // Find user by phone
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', '9179866656')
      .single();

    if (error) {
      console.error('Error finding user:', error);
      return;
    }

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User found:', {
      id: user.id,
      auth_id: user.auth_id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at
    });

    // Verify password
    const testPassword = 'test123';
    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    console.log('Password verification:', isValid ? 'Valid' : 'Invalid');
    console.log('Stored password hash:', user.password_hash);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser(); 