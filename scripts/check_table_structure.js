import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  try {
    // Get table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('divisions')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('Error fetching table structure:', tableError);
      return;
    }

    if (tableInfo && tableInfo.length > 0) {
      console.log('Table Structure:');
      console.log(JSON.stringify(tableInfo[0], null, 2));
    } else {
      console.log('No data found in the table');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTableStructure(); 