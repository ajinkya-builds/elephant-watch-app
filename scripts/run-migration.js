import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://pauafmgoewfdhwnsexzy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhdWFmbWdvZXdmZGh3bnNleHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY4MDAxOCwiZXhwIjoyMDYyMjU2MDE4fQ.AmhwlpdZxs__o8VPv4N2Zf-3zb8JgiDqyJfNnEHQX1k';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'migrations', 'update_login_logs.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Execute each statement
    for (const statement of statements) {
      console.log('Executing:', statement);
      const { error } = await supabase
        .from('login_logs')
        .select('*')
        .limit(1)
        .then(() => {
          // This is just a dummy query to get the client to execute our SQL
          return supabase.rpc('exec_sql', { sql: statement });
        });

      if (error) {
        console.error('Error executing statement:', error);
        console.error('Statement:', statement);
        process.exit(1);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration(); 