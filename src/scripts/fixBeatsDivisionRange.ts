import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pauafmgoewfdhwnsexzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhdWFmbWdvZXdmZGh3bnNleHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY4MDAxOCwiZXhwIjoyMDYyMjU2MDE4fQ.AmhwlpdZxs__o8VPv4N2Zf-3zb8JgiDqyJfNnEHQX1k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBeatsDivisionId() {
  // 1. Fetch all beats with did
  const { data: beats, error: beatsError } = await supabase
    .from('beats')
    .select('id, did');

  if (beatsError) {
    console.error('Error fetching beats:', beatsError);
    return;
  }

  let updated = 0;
  for (const beat of beats) {
    if (!beat.did) {
      console.warn(`Skipping beat ${beat.id} (missing did)`);
      continue;
    }

    // Find division by did
    const { data: division, error: divisionError } = await supabase
      .from('divisions')
      .select('id')
      .eq('did', beat.did)
      .single();
    if (divisionError || !division) {
      console.warn(`Division not found for did ${beat.did} (beat ${beat.id})`);
      continue;
    }

    // Update beat's associated_division_id
    const { error: updateError } = await supabase
      .from('beats')
      .update({ associated_division_id: division.id })
      .eq('id', beat.id);
    if (updateError) {
      console.error(`Failed to update beat ${beat.id}:`, updateError);
    } else {
      updated++;
      console.log(`Updated beat ${beat.id}: associated_division_id=${division.id}`);
    }
  }
  console.log(`\nDone. Updated ${updated} beats.`);
}

fixBeatsDivisionId(); 