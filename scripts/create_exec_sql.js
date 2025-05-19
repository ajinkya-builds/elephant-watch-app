import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pauafmgoewfdhwnsexzy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhdWFmbWdvZXdmZGh3bnNleHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY4MDAxOCwiZXhwIjoyMDYyMjU2MDE4fQ.AmhwlpdZxs__o8VPv4N2Zf-3zb8JgiDqyJfNnEHQX1k';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createExecSqlFunction() {
  try {
    const { error } = await supabase.rpc('create_exec_sql_function');
    
    if (error) {
      console.error('Error creating exec_sql function:', error);
      process.exit(1);
    }

    console.log('exec_sql function created successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createExecSqlFunction(); 