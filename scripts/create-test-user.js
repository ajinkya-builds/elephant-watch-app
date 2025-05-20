import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
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

async function createTestUser() {
  try {
    // First create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      phone: '9179866656',
      password: 'test123',
      phone_confirm: true
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    const now = new Date().toISOString();
    // Create the user profile
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          auth_id: authData.user.id,
          phone: '9179866656',
          role: 'data_collector',
          status: 'active',
          first_name: 'Test',
          last_name: 'User',
          position: 'Ranger',
          created_at: now,
          updated_at: now
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return;
    }

    console.log('Test user created successfully:', data);
    console.log('\nLogin credentials:');
    console.log('Phone: 9179866656');
    console.log('Password: test123');
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser(); 