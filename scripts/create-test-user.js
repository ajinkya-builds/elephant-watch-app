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
    // Generate a hashed password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('test123', salt);

    const now = new Date().toISOString();
    // Create the user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email_or_phone: '9179866656',
          role: 'data_collector',
          password_hash: passwordHash,
          status: 'active',
          created_at: now,
          updated_at: now
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
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