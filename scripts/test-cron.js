import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createTestReport() {
  try {
    // Create a test activity report
    const { data: report, error: reportError } = await supabase
      .from('activity_reports')
      .insert([{
        latitude: "23.9158502",
        longitude: "81.8011727",
        activity_date: "2024-03-20",
        activity_time: "14:30:00",
        observation_type: "direct",
        total_elephants: 5,
        male_elephants: 2,
        female_elephants: 2,
        unknown_elephants: 1,
        calves: 0,
        user_id: "cef8bb31-9d6f-4ea8-a36c-dec2feddb900"
      }])
      .select()
      .single();

    if (reportError) {
      console.error('Error creating report:', reportError);
      return;
    }

    console.log('Created test report:', report);

    // Wait for 2 minutes to allow the cron job to process
    console.log('Waiting for 2 minutes to allow cron job to process...');
    await new Promise(resolve => setTimeout(resolve, 120000));

    // Check if an observation was created
    const { data: observation, error: observationError } = await supabase
      .from('activity_observation')
      .select('*')
      .eq('activity_report_id', report.id)
      .single();

    if (observationError) {
      console.error('Error checking observation:', observationError);
      return;
    }

    console.log('Created observation:', observation);
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestReport(); 