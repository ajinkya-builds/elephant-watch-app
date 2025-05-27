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

async function executeSQL(statement) {
  const { data, error } = await supabase
    .from('_sqlexec')
    .select('*')
    .eq('query', statement)
    .single();

  return { data, error };
}

async function applyFinalPolicies() {
  try {
    // First, read and execute the setup SQL function
    console.log('Setting up SQL execution function...');
    const setupSqlPath = path.resolve('./scripts/setup-sql-function.sql');
    const setupSqlContent = fs.readFileSync(setupSqlPath, 'utf8');
    
    const setupResult = await executeSQL(setupSqlContent);
    if (setupResult.error) {
      console.error('Error setting up SQL function:', setupResult.error);
      return;
    }
    console.log('SQL function setup completed successfully.');

    // Now read and execute the policy SQL file
    const sqlFilePath = path.resolve('./scripts/fix-rls-policies-final.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split into separate statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`\nExecuting ${statements.length} policy statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nExecuting statement ${i+1}/${statements.length}:`);
      console.log(statement);
      
      try {
        const result = await executeSQL(statement);
        if (result.error) {
          console.error(`Error executing statement ${i+1}:`, result.error);
        } else {
          console.log(`Statement ${i+1} executed successfully.`);
        }
      } catch (err) {
        console.error(`Failed to execute statement ${i+1}:`, err);
      }
    }
    
    console.log('\nRLS policies update completed!');
  } catch (error) {
    console.error('Error applying final policies:', error);
  }
}

applyFinalPolicies(); 