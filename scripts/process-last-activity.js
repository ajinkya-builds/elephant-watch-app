import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function processLastActivity() {
  try {
    // 1. Fetch all processed activity_report_id values from activity_observation
    const { data: processedIds, error: processedIdsError } = await supabase
      .from('activity_observation')
      .select('activity_report_id');

    if (processedIdsError) {
      throw new Error(`Error fetching processed IDs: ${processedIdsError.message}`);
    }

    const processedIdsList = processedIds.map(item => item.activity_report_id);

    // 2. Fetch the latest activity_report that is not in the processed list
    const { data: reports, error: reportsError } = await supabase
      .from('activity_reports')
      .select('*')
      .not('id', 'in', `(${processedIdsList.join(',')})`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (reportsError) {
      throw new Error(`Error fetching reports: ${reportsError.message}`);
    }

    if (!reports || reports.length === 0) {
      console.log('No unprocessed activity reports found');
      return;
    }

    const report = reports[0];
    console.log('Processing report:', report);

    // 3. Get geographical boundaries
    let boundaryData = null;
    try {
      const { data: boundary, error: boundaryError } = await supabase
        .rpc('identify_geographical_boundaries', {
          p_latitude: parseFloat(report.latitude),
          p_longitude: parseFloat(report.longitude)
        });

      if (boundaryError) {
        console.warn('Warning: Could not identify geographical boundaries:', boundaryError.message);
      } else {
        boundaryData = boundary?.[0];
        console.log('Identified boundaries:', boundaryData);
      }
    } catch (error) {
      console.warn('Warning: Error identifying geographical boundaries:', error.message);
    }

    // 4. Create activity observation
    const observationData = {
      activity_report_id: report.id,
      latitude: parseFloat(report.latitude),
      longitude: parseFloat(report.longitude),
      activity_date: report.activity_date,
      activity_time: report.activity_time,
      observation_type: report.observation_type,
      total_elephants: report.total_elephants,
      male_elephants: report.male_elephants,
      female_elephants: report.female_elephants,
      unknown_elephants: report.unknown_elephants,
      calves: report.calves,
      indirect_sighting_type: report.indirect_sighting_type,
      loss_type: report.loss_type,
      compass_bearing: report.compass_bearing,
      photo_url: report.photo_url,
      user_id: report.user_id,
      associated_division: boundaryData?.division_name || null,
      associated_division_id: boundaryData?.division_id || null,
      associated_range: boundaryData?.range_name || null,
      associated_range_id: boundaryData?.range_id || null,
      associated_beat: boundaryData?.beat_name || null,
      associated_beat_id: boundaryData?.beat_id || null
    };

    console.log('Creating observation with data:', observationData);

    const { data: observation, error: insertError } = await supabase
      .from('activity_observation')
      .insert([observationData])
      .select()
      .single();

    if (insertError) {
      throw new Error(`Error creating observation: ${insertError.message}`);
    }

    console.log('Successfully created observation:', observation);
  } catch (error) {
    console.error('Error processing activity report:', error);
    process.exit(1);
  }
}

processLastActivity(); 