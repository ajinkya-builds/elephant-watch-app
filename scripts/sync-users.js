const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

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

async function syncUser(userId) {
  try {
    // Get user from auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError) {
      console.error('Error fetching auth user:', authError);
      return;
    }

    if (!authUser) {
      console.log('No auth user found with ID:', userId);
      return;
    }

    // Sync to public.users
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .upsert({
        id: authUser.user.id,
        email: authUser.user.email,
        phone: authUser.user.phone,
        role: 'data_collector', // default role
        status: 'active',
        created_at: authUser.user.created_at,
        updated_at: authUser.user.updated_at
      })
      .select()
      .single();

    if (publicError) {
      console.error('Error syncing to public.users:', publicError);
      return;
    }

    console.log('Successfully synced user:', {
      id: publicUser.id,
      email: publicUser.email,
      phone: publicUser.phone
    });

  } catch (error) {
    console.error('Error in syncUser:', error);
  }
}

async function syncAllUsers() {
  try {
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }

    console.log(`Found ${authUsers.users.length} users to sync`);

    // Sync each user
    for (const authUser of authUsers.users) {
      await syncUser(authUser.id);
    }

    console.log('Finished syncing all users');

  } catch (error) {
    console.error('Error in syncAllUsers:', error);
  }
}

async function verifyUserSync(userId) {
  try {
    // Get user from auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError) {
      console.error('Error fetching auth user:', authError);
      return;
    }

    // Get user from public.users
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (publicError) {
      console.error('Error fetching public user:', publicError);
      return;
    }

    // Compare the data
    console.log('\nAuth User:', {
      id: authUser.user.id,
      email: authUser.user.email,
      phone: authUser.user.phone,
      created_at: authUser.user.created_at,
      updated_at: authUser.user.updated_at
    });

    console.log('\nPublic User:', {
      id: publicUser.id,
      email: publicUser.email,
      phone: publicUser.phone,
      created_at: publicUser.created_at,
      updated_at: publicUser.updated_at
    });

    // Check if they're in sync
    const isInSync = 
      authUser.user.email === publicUser.email &&
      authUser.user.phone === publicUser.phone;

    console.log('\nSync Status:', isInSync ? '✅ In Sync' : '❌ Out of Sync');

  } catch (error) {
    console.error('Error in verifyUserSync:', error);
  }
}

// Command line interface
const command = process.argv[2];
const userId = process.argv[3];

switch (command) {
  case 'sync':
    if (userId) {
      syncUser(userId);
    } else {
      syncAllUsers();
    }
    break;
  case 'verify':
    if (!userId) {
      console.error('Please provide a user ID to verify');
      process.exit(1);
    }
    verifyUserSync(userId);
    break;
  default:
    console.log(`
Usage:
  node sync-users.js sync [userId]    Sync one or all users
  node sync-users.js verify <userId>  Verify sync status for a user
    `);
} 