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

async function resetPassword() {
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(
      'cef8bb31-9d6f-4ea8-a36c-dec2feddb900', // auth_id from our previous query
      { password: 'ChangeMe123!' }
    );

    if (error) throw error;
    console.log('Password reset successful');
    console.log('New password is: ChangeMe123!');
  } catch (error) {
    console.error('Error resetting password:', error);
  }
}

resetPassword(); 