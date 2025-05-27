import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import * as readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEnv() {
  console.log('\n🔧 Supabase Environment Setup\n');
  
  console.log('Please follow these steps to get your Supabase credentials:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Click on your project (pauafmgoewfdhwnsexzy)');
  console.log('3. Go to Project Settings > API');
  console.log('4. Under "Project API keys" you\'ll find two keys\n');

  const url = 'https://pauafmgoewfdhwnsexzy.supabase.co';
  console.log('✅ Project URL:', url);

  console.log('\nNow find the `anon` `public` key (first one in the list):');
  const anonKey = await question('Enter your anon public key (starts with eyJ): ');
  if (!anonKey.startsWith('eyJ')) {
    console.error('❌ Invalid anon key format. Should start with eyJ');
    process.exit(1);
  }

  console.log('\nNow find the `service_role` `secret` key (second one in the list):');
  console.log('Click "View" to reveal it, then copy the entire key');
  const serviceKey = await question('Enter your service role key (starts with eyJ): ');
  if (!serviceKey.startsWith('eyJ')) {
    console.error('❌ Invalid service role key format. Should start with eyJ');
    process.exit(1);
  }

  const envContent = `VITE_SUPABASE_URL=${url}
VITE_SUPABASE_ANON_KEY=${anonKey}
VITE_SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`;

  const envPath = resolve(__dirname, '../.env');
  
  // Backup existing .env if it exists
  if (fs.existsSync(envPath)) {
    const backupPath = envPath + '.backup-' + Date.now();
    fs.copyFileSync(envPath, backupPath);
    console.log(`\n✅ Backed up existing .env to ${backupPath}`);
  }

  // Write new .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Successfully created .env file!');
  console.log('🔑 Your Supabase credentials have been saved.');
  
  rl.close();
}

setupEnv().catch(console.error); 