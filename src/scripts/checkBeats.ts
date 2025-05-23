import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pauafmgoewfdhwnsexzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhdWFmbWdvZXdmZGh3bnNleHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY4MDAxOCwiZXhwIjoyMDYyMjU2MDE4fQ.AmhwlpdZxs__o8VPv4N2Zf-3zb8JgiDqyJfNnEHQX1k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBeats() {
  try {
    // First, get the Rewa division ID
    const { data: divisionData, error: divisionError } = await supabase
      .from('divisions')
      .select('id, name')
      .eq('name', 'Rewa')
      .single();

    if (divisionError) {
      console.error('Error fetching Rewa division:', divisionError);
      return;
    }

    console.log('Rewa Division:', divisionData);

    // Then, get the Mauganj range ID
    const { data: rangeData, error: rangeError } = await supabase
      .from('ranges')
      .select('id, name')
      .eq('name', 'Mauganj')
      .eq('associated_division_id', divisionData.id)
      .single();

    if (rangeError) {
      console.error('Error fetching Mauganj range:', rangeError);
      return;
    }

    console.log('Mauganj Range:', rangeData);

    // Check all beats in the database
    const { data: allBeats, error: allBeatsError } = await supabase
      .from('beats')
      .select('id, name, associated_range_id, associated_division_id')
      .order('name');

    if (allBeatsError) {
      console.error('Error fetching all beats:', allBeatsError);
      return;
    }

    console.log('\nAll Beats in Database:');
    console.log('Total beats:', allBeats.length);
    console.log('Beat List:');
    allBeats.forEach((beat, index) => {
      console.log(`${index + 1}. ${beat.name} (Range ID: ${beat.associated_range_id}, Division ID: ${beat.associated_division_id})`);
    });

    // Check beats specifically under Mauganj range
    const { data: mauganjBeats, error: mauganjBeatsError } = await supabase
      .from('beats')
      .select('id, name, associated_range_id, associated_division_id')
      .eq('associated_range_id', rangeData.id)
      .eq('associated_division_id', divisionData.id)
      .order('name');

    if (mauganjBeatsError) {
      console.error('Error fetching Mauganj beats:', mauganjBeatsError);
      return;
    }

    console.log('\nBeats under Mauganj Range:');
    console.log('Total beats:', mauganjBeats.length);
    console.log('Beat List:');
    mauganjBeats.forEach((beat, index) => {
      console.log(`${index + 1}. ${beat.name}`);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkBeats(); 