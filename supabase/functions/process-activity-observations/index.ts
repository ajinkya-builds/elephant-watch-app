// Supabase Edge Function: process-activity-observations
// This function processes all activity_reports without a corresponding activity_observation
// and inserts the observation. Intended to be scheduled to run every minute.

// @ts-ignore: Supabase Edge Functions use Deno runtime
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  // 1. Find activity_reports without a corresponding activity_observation
  const { data: reports, error } = await supabase
    .from('activity_reports')
    .select('*')
    .not('id', 'in', supabase.from('activity_observation').select('activity_report_id'))

  if (error) {
    return new Response(`Error fetching reports: ${error.message}`, { status: 500 })
  }

  // 2. For each report, insert into activity_observation
  for (const report of reports) {
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
      user_id: report.user_id
    }
    await supabase.from('activity_observation').insert([observationData])
  }

  return new Response('Processed activity observations', { status: 200 })
}) 