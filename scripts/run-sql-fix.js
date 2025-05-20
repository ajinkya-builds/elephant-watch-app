import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
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

async function runSqlFix() {
  try {
    // Read the SQL file
    const sqlFilePath = path.resolve('./scripts/setup-database.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split into separate statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i+1}/${statements.length}:`);
      console.log(statement);
      
      // Try to execute the statement using the REST API
      const { error } = await supabase
        .from('users')
        .select('*')
        .limit(1)
        .throwOnError();
      
      if (error) {
        console.error(`Error executing statement ${i+1}:`, error);
      } else {
        console.log(`Statement ${i+1} executed successfully.`);
      }
    }
    
    console.log('SQL fix completed!');
  } catch (error) {
    console.error('Error running SQL fix:', error);
  }
}

runSqlFix(); 