import { supabase } from './supabase';
import { ActivityReport } from '@/types/activity-report';

interface ProcessedReport {
  p_latitude: number;
  p_longitude: number;
  p_division_id: string;
  p_range_id: string;
  p_beat_id: string;
  p_division_name: string;
  p_range_name: string;
  p_beat_name: string;
}

export async function processActivityReport(report: ActivityReport): Promise<void> {
  try {
    // Get user's division, range, and beat
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('division_id, range_id, beat_id')
      .eq('auth_id', report.user_id)
      .single();

    if (userError) throw userError;

    // Get division, range, and beat names
    const { data: divisionData, error: divisionError } = await supabase
      .from('divisions')
      .select('name')
      .eq('id', userData.division_id)
      .single();

    if (divisionError) throw divisionError;

    const { data: rangeData, error: rangeError } = await supabase
      .from('ranges')
      .select('name')
      .eq('id', userData.range_id)
      .single();

    if (rangeError) throw rangeError;

    const { data: beatData, error: beatError } = await supabase
      .from('beats')
      .select('name')
      .eq('id', userData.beat_id)
      .single();

    if (beatError) throw beatError;

    // Process the report
    const processedReport: ProcessedReport = {
      p_latitude: parseFloat(report.latitude.toString()),
      p_longitude: parseFloat(report.longitude.toString()),
      p_division_id: userData.division_id,
      p_range_id: userData.range_id,
      p_beat_id: userData.beat_id,
      p_division_name: divisionData.name,
      p_range_name: rangeData.name,
      p_beat_name: beatData.name
    };

    // Insert the processed report
    const { error: insertError } = await supabase
      .from('processed_activity_reports')
      .insert(processedReport);

    if (insertError) throw insertError;

  } catch (error) {
    console.error('Error processing activity report:', error);
    throw error;
  }
} 