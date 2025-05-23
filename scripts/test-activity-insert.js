import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const payload = {
    activity_date: '2025-05-23',
    activity_time: '11:13:00',
    observation_type: 'loss',
    latitude: 21.834349,
    longitude: 75.626198,
    total_elephants: null,
    male_elephants: null,
    female_elephants: null,
    unknown_elephants: null,
    calves: null,
    indirect_sighting_type: null,
    loss_type: null,
    compass_bearing: 4,
    photo_url: null,
    user_id: '57159f62-d5d4-4ae8-bced-52424e588d87'
  };

  const { data, error } = await supabase
    .from('activity_reports')
    .insert([payload])
    .select();

  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert success:', data);
  }
}

main(); 