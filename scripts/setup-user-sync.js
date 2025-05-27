import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

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

async function setupUserSync() {
  try {
    console.log('Setting up user synchronization...');

    // 1. Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }

    console.log(`Found ${authUsers.users.length} users in auth.users`);

    // 2. Get all public users
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('*');

    if (publicError) {
      console.error('Error fetching public users:', publicError);
      return;
    }

    console.log(`Found ${publicUsers.length} users in public.users`);

    // 3. Create a map of public users by email/phone for easy lookup
    const publicUserMap = new Map();
    publicUsers.forEach(user => {
      if (user.email) publicUserMap.set(user.email, user);
      if (user.phone) publicUserMap.set(user.phone, user);
    });

    // 4. Create a mapping table for user IDs
    const { error: createTableError } = await supabase.rpc('create_user_id_mapping');
    if (createTableError) {
      console.error('Error creating mapping table:', createTableError);
      return;
    }

    // 5. Process each auth user
    for (const authUser of authUsers.users) {
      console.log(`\nProcessing auth user: ${authUser.email || authUser.phone}`);
      
      // Find matching public user
      const matchingPublicUser = authUser.email ? 
        publicUserMap.get(authUser.email) : 
        publicUserMap.get(authUser.phone);

      if (matchingPublicUser) {
        console.log('Found matching public user:', matchingPublicUser.id);
        
        // Insert mapping
        const { error: mappingError } = await supabase
          .from('user_id_mapping')
          .insert({
            auth_id: authUser.id,
            public_id: matchingPublicUser.id,
            email: authUser.email,
            phone: authUser.phone
          });

        if (mappingError) {
          console.error(`Error creating mapping for user ${matchingPublicUser.id}:`, mappingError);
          continue;
        }

        console.log('Successfully created mapping:', {
          auth_id: authUser.id,
          public_id: matchingPublicUser.id,
          email: authUser.email,
          phone: authUser.phone
        });
      } else {
        console.log('No matching public user found, creating new user');
        
        // Create new public user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            phone: authUser.phone,
            role: 'data_collector',
            status: 'active',
            created_at: authUser.created_at,
            updated_at: authUser.updated_at
          })
          .select()
          .single();

        if (createError) {
          console.error(`Error creating user ${authUser.id}:`, createError);
          continue;
        }

        // Insert mapping for new user
        const { error: mappingError } = await supabase
          .from('user_id_mapping')
          .insert({
            auth_id: authUser.id,
            public_id: authUser.id,
            email: authUser.email,
            phone: authUser.phone
          });

        if (mappingError) {
          console.error(`Error creating mapping for new user ${authUser.id}:`, mappingError);
          continue;
        }

        console.log('Successfully created new user and mapping:', {
          id: newUser.id,
          email: newUser.email,
          phone: newUser.phone
        });
      }
    }

    // 6. Final verification
    const { data: mappings, error: mappingError } = await supabase
      .from('user_id_mapping')
      .select('*');

    if (mappingError) {
      console.error('Error fetching mappings:', mappingError);
      return;
    }

    console.log('\nFinal Sync Summary:');
    console.log(`Total users in auth.users: ${authUsers.users.length}`);
    console.log(`Total users in public.users: ${publicUsers.length}`);
    console.log(`Total mappings created: ${mappings.length}`);

    // Check for any remaining mismatches
    const authUserIds = new Set(authUsers.users.map(u => u.id));
    const mappedAuthIds = new Set(mappings.map(m => m.auth_id));

    const missingMappings = [...authUserIds].filter(id => !mappedAuthIds.has(id));

    if (missingMappings.length > 0) {
      console.log('\nUsers missing mappings:', missingMappings);
    } else {
      console.log('\n✅ All users have been mapped successfully!');
    }

  } catch (error) {
    console.error('Error in setupUserSync:', error);
  }
}

// Run the setup
setupUserSync(); 