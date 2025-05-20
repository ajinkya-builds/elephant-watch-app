import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const anonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!anonKey) {
  console.error('Missing anon key');
  process.exit(1);
}

// Verify JWT format
const parts = anonKey.split('.');
if (parts.length !== 3) {
  console.error('Invalid JWT format - should have 3 parts');
  process.exit(1);
}

try {
  // Decode the payload (middle part)
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  
  console.log('Anon Key Analysis:');
  console.log('==================');
  console.log('Format:', parts.length === 3 ? '✓ Valid JWT format' : '❌ Invalid format');
  console.log('\nPayload:');
  console.log('- Role:', payload.role);
  console.log('- Expiration:', new Date(payload.exp * 1000).toISOString());
  console.log('- Reference:', payload.ref);
  
  // Verify role
  if (payload.role !== 'anon') {
    console.error('\n❌ Warning: Key role is not "anon"');
  } else {
    console.log('\n✓ Role correctly set to "anon"');
  }
  
  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    console.error('\n❌ Warning: Key has expired');
  } else {
    const daysUntilExpiry = Math.floor((payload.exp - now) / (24 * 60 * 60));
    console.log(`\n✓ Key valid for ${daysUntilExpiry} more days`);
  }
  
} catch (error) {
  console.error('Error decoding JWT:', error);
  process.exit(1);
} 