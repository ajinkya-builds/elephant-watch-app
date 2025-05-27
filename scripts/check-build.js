import fs from 'fs';
import path from 'path';

// Path to the built JavaScript file
const buildFilePath = path.resolve('./dist/assets/index-DHlvDuTR.js');

// Read the file
fs.readFile(buildFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading build file:', err);
    process.exit(1);
  }

  // Check for direct API calls with email_or_phone
  const emailOrPhoneRegex = /email_or_phone=eq\.[^&"']*/g;
  const matches = data.match(emailOrPhoneRegex) || [];

  console.log(`Found ${matches.length} references to email_or_phone=eq. in the build file:`);
  matches.forEach((match, index) => {
    console.log(`${index + 1}. ${match}`);
  });
  
  // Check for any instances of the string "email_or_phone"
  const emailOrPhoneString = "email_or_phone";
  let count = 0;
  let position = data.indexOf(emailOrPhoneString);
  
  console.log('\nOccurrences of "email_or_phone" string:');
  while (position !== -1) {
    count++;
    // Get some context around the match
    const start = Math.max(0, position - 50);
    const end = Math.min(data.length, position + emailOrPhoneString.length + 50);
    const context = data.substring(start, end).replace(/\n/g, ' ');
    
    console.log(`${count}. Position ${position}: ...${context}...`);
    
    // Find next occurrence
    position = data.indexOf(emailOrPhoneString, position + 1);
  }
  
  console.log(`\nTotal occurrences of "email_or_phone": ${count}`);
}); 