import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhdWFmbWdvZXdmZGh3bnNleHp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2ODAwMTgsImV4cCI6MjA2MjI1NjAxOH0.iSTx9Upe8wekbKvk5ZiUMeWGi-WB67gqdZG8Bf-DO-0';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhdWFmbWdvZXdmZGh3bnNleHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY4MDAxOCwiZXhwIjoyMDYyMjU2MDE4fQ.AmhwlpdZxs__o8VPv4N2Zf-3zb8JgiDqyJfNnEHQX1k';

function decodeJWT(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { error: 'Invalid JWT format - should have 3 parts' };
  }

  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return { header, payload };
  } catch (error) {
    return { error: `Failed to decode JWT: ${error.message}` };
  }
}

console.log('\n🔍 Analyzing JWT Tokens\n');

console.log('Anon Key Analysis:');
console.log('-----------------');
const anonJWT = decodeJWT(anonKey);
if (anonJWT.error) {
  console.log('Error:', anonJWT.error);
} else {
  console.log('Header:', JSON.stringify(anonJWT.header, null, 2));
  console.log('Payload:', JSON.stringify(anonJWT.payload, null, 2));
  console.log('\nValidation:');
  console.log('- Algorithm:', anonJWT.header.alg === 'HS256' ? '✓ Valid (HS256)' : '❌ Invalid');
  console.log('- Type:', anonJWT.header.typ === 'JWT' ? '✓ Valid (JWT)' : '❌ Invalid');
  console.log('- Role:', anonJWT.payload.role === 'anon' ? '✓ Valid (anon)' : '❌ Invalid');
  console.log('- Project Ref:', anonJWT.payload.ref ? '✓ Present' : '❌ Missing');
  
  const now = Math.floor(Date.now() / 1000);
  const isExpired = anonJWT.payload.exp && now > anonJWT.payload.exp;
  console.log('- Expiration:', isExpired ? '❌ Expired' : '✓ Valid');
}

console.log('\nService Role Key Analysis:');
console.log('------------------------');
const serviceJWT = decodeJWT(serviceKey);
if (serviceJWT.error) {
  console.log('Error:', serviceJWT.error);
} else {
  console.log('Header:', JSON.stringify(serviceJWT.header, null, 2));
  console.log('Payload:', JSON.stringify(serviceJWT.payload, null, 2));
  console.log('\nValidation:');
  console.log('- Algorithm:', serviceJWT.header.alg === 'HS256' ? '✓ Valid (HS256)' : '❌ Invalid');
  console.log('- Type:', serviceJWT.header.typ === 'JWT' ? '✓ Valid (JWT)' : '❌ Invalid');
  console.log('- Role:', serviceJWT.payload.role === 'service_role' ? '✓ Valid (service_role)' : '❌ Invalid');
  console.log('- Project Ref:', serviceJWT.payload.ref ? '✓ Present' : '❌ Missing');
  
  const now = Math.floor(Date.now() / 1000);
  const isExpired = serviceJWT.payload.exp && now > serviceJWT.payload.exp;
  console.log('- Expiration:', isExpired ? '❌ Expired' : '✓ Valid');
}

// Compare project refs
if (anonJWT.payload?.ref && serviceJWT.payload?.ref) {
  console.log('\nProject Reference Check:');
  console.log('----------------------');
  console.log('Match:', anonJWT.payload.ref === serviceJWT.payload.ref ? 
    '✓ Project refs match' : 
    '❌ Project refs do not match');
} 