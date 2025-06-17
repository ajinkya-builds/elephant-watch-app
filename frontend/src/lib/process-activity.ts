import { supabase } from './supabase';

interface ProcessedReport {
  p_division_id: string;
  p_range_id: string;
  p_beat_id: string;
  p_division_name: string;
  p_range_name: string;
  p_beat_name: string;
}

export async function processActivityReport(userData: Record<string, unknown>) {
  try {
    // Fetch division data
    const { data: divisionData, error: divisionError } = await supabase
      .from('divisions')
      .select('name')
      .eq('id', String(userData.division_id))
      .single();

    if (divisionError) throw divisionError;

    // Fetch range data
    const { data: rangeData, error: rangeError } = await supabase
      .from('ranges')
      .select('name')
      .eq('id', String(userData.range_id))
      .single();

    if (rangeError) throw rangeError;

    // Fetch beat data
    const { data: beatData, error: beatError } = await supabase
      .from('beats')
      .select('name')
      .eq('id', String(userData.beat_id))
      .single();

    if (beatError) throw beatError;

    const processedReport: ProcessedReport = {
      p_division_id: String(userData.division_id),
      p_range_id: String(userData.range_id),
      p_beat_id: String(userData.beat_id),
      p_division_name: String(divisionData.name),
      p_range_name: String(rangeData.name),
      p_beat_name: String(beatData.name)
    };

    // Insert processed report
    const { error: insertError } = await supabase
      .from('processed_activity_reports')
      .insert(processedReport as unknown as Record<string, unknown>);

    if (insertError) throw insertError;

    return processedReport;
  } catch (error) {
    console.error('Error processing activity report:', error);
    throw error;
  }
} 