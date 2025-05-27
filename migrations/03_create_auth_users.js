import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

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

async function migrateUsers() {
  try {
    // Get all users from the migration map
    const { data: users, error: fetchError } = await supabase
      .from('user_migration_map')
      .select('*')
      .is('new_auth_id', null);

    if (fetchError) throw fetchError;
    console.log(`Found ${users.length} users to migrate`);

    // Process each user
    for (const user of users) {
      try {
        console.log(`Processing user: ${user.email || user.phone}`);

        // Create auth user
        const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          phone: user.phone,
          email_confirm: true,
          phone_confirm: true,
          password: 'ChangeMe123!', // Temporary password
        });

        if (createError) throw createError;

        // Update migration map with new auth_id
        const { error: updateError } = await supabase
          .from('user_migration_map')
          .update({ new_auth_id: authUser.user.id })
          .eq('old_id', user.old_id);

        if (updateError) throw updateError;

        // Update users table
        const { error: userUpdateError } = await supabase
          .from('users')
          .update({
            auth_id: authUser.user.id,
            email: user.email,
            phone: user.phone,
            // Set default names until users update their profiles
            first_name: user.email ? user.email.split('@')[0] : user.phone,
            last_name: '(Please Update)',
            position: 'Ranger' // Default position
          })
          .eq('id', user.old_id);

        if (userUpdateError) throw userUpdateError;

        console.log(`Successfully migrated user: ${user.email || user.phone}`);
      } catch (error) {
        console.error(`Error processing user ${user.email || user.phone}:`, error);
      }
    }

    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateUsers(); 