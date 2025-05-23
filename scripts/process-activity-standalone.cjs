// Standalone Node.js script to process an activity report and create an observation
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function processActivityReport(reportId) {
  try {
    // 1. Get the activity report
    const { data: report, error: reportError } = await supabase
      .from('activity_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError) throw new Error(`Error fetching report: ${reportError.message}`);
    if (!report) throw new Error('Report not found');
    console.log('Processing report:', report);

    // 2. Get geographical boundaries
    const { data: boundaries, error: boundariesError } = await supabase
      .rpc('identify_geographical_boundaries', {
        p_latitude: parseFloat(report.latitude),
        p_longitude: parseFloat(report.longitude)
      });
    if (boundariesError) throw new Error(`Error getting boundaries: ${boundariesError.message}`);
    const boundary = boundaries?.[0];
    console.log('Identified boundaries:', boundary);

    // 3. Create activity observation
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
      user_id: '57159f62-d5d4-4ae8-bced-52424e588d87',
      // Add geographical boundaries
      associated_division: boundary?.division_name,
      associated_range: boundary?.range_name,
      associated_beat: boundary?.beat_name
    };
    console.log('Creating observation with data:', observationData);
    const { data: observation, error: insertError } = await supabase
      .from('activity_observation')
      .insert([observationData])
      .select()
      .single();
    if (insertError) throw new Error(`Error creating observation: ${insertError.message}`);
    console.log('Successfully created observation:', observation);
    return observation;
  } catch (error) {
    console.error('Error processing activity report:', error);
    process.exit(1);
  }
}

// Usage: node scripts/process-activity-standalone.js <reportId>
const reportId = process.argv[2] || '00ae9590-e3b1-42d0-9716-ceb84bab2089';
processActivityReport(reportId); 