// Supabase Edge Function: process-activity-observations
// This function processes all activity_reports without a corresponding activity_observation
// and inserts the observation with geographical boundaries. Intended to be scheduled to run every minute.

// @ts-ignore: Supabase Edge Functions use Deno runtime
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  try {
  // 1. Find activity_reports without a corresponding activity_observation
    const { data: reports, error: reportsError } = await supabase
    .from('activity_reports')
    .select('*')
    .not('id', 'in', supabase.from('activity_observation').select('activity_report_id'))

    if (reportsError) {
      throw new Error(`Error fetching reports: ${reportsError.message}`)
    }

    if (!reports || reports.length === 0) {
      return new Response('No new reports to process', { status: 200 })
  }

    console.log(`Processing ${reports.length} new reports`)

    // 2. For each report, get geographical boundaries and create observation
  for (const report of reports) {
      // Get geographical boundaries using PostGIS
      const { data: boundaries, error: boundariesError } = await supabase
        .rpc('identify_geographical_boundaries', {
          p_latitude: parseFloat(report.latitude),
          p_longitude: parseFloat(report.longitude)
        })

      if (boundariesError) {
        console.error(`Error getting boundaries for report ${report.id}:`, boundariesError)
        continue
      }

      const boundary = boundaries?.[0]

      // Create observation with boundaries
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
        // Add geographical boundaries
        associated_division: boundary?.division_name,
        associated_division_id: boundary?.division_id,
        associated_range: boundary?.range_name,
        associated_range_id: boundary?.range_id,
        associated_beat: boundary?.beat_name,
        associated_beat_id: boundary?.beat_id
    }

      const { error: insertError } = await supabase
        .from('activity_observation')
        .insert([observationData])

      if (insertError) {
        console.error(`Error creating observation for report ${report.id}:`, insertError)
        continue
      }

      console.log(`Successfully created observation for report ${report.id}`)
    }

    return new Response('Successfully processed activity observations', { status: 200 })
  } catch (error) {
    console.error('Error processing activity observations:', error)
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
}) 