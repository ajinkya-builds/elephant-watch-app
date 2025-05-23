import { supabase } from '../lib/supabaseClient';

async function listTablesAndViews() {
  try {
    // Query tables using RPC
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_public_tables');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      return;
    }

    console.log('Tables in public schema:');
    console.log(tables);

    // Query views using RPC
    const { data: views, error: viewsError } = await supabase
      .rpc('get_public_views');

    if (viewsError) {
      console.error('Error fetching views:', viewsError);
      return;
    }

    console.log('\nViews in public schema:');
    console.log(views);

  } catch (error) {
    console.error('Error:', error);
  }
}

listTablesAndViews(); 