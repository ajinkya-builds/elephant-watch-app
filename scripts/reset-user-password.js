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

async function resetUserPassword(userId, newPassword) {
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      console.error('Error resetting password:', error);
      return;
    }

    console.log('Password reset successful!');
    console.log('New password:', newPassword);
    console.log('User can now login with these credentials');
  } catch (error) {
    console.error('Error:', error);
  }
}

// User ID from our verification script
const userId = 'cef8bb31-9d6f-4ea8-a36c-dec2feddb900';
const newPassword = 'Test123!@#';

resetUserPassword(userId, newPassword); 