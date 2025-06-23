import { supabase } from '@/lib/supabase';
import { ActivityReport, ActivityReportInput } from '@/types/activity-report';

export async function getActivityReport(id: string): Promise<ActivityReport | null> {
  try {
    const { data, error } = await supabase
      .from('activity_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as unknown as ActivityReport;
  } catch (error) {
    console.error('Error fetching activity report:', error);
    return null;
  }
}

// Type for the result returned by the Postgres function
interface InsertActivityReportWithSpatialResult {
  id: string;
  associated_division: string;
  associated_division_id: string;
  associated_range: string;
  associated_range_id: string;
  associated_beat: string;
  associated_beat_id: string;
  user_ids: string[];
}

export async function createActivityReport(report: ActivityReportInput): Promise<ActivityReport | null> {
  try {
    // Map ActivityReportInput to Postgres function parameters
    const {
      user_id,
      latitude,
      longitude,
      activity_date,
      activity_time,
      observation_type,
      total_elephants,
      male_elephants,
      female_elephants,
      unknown_elephants,
      calves,
      indirect_sighting_type,
      loss_type,
      compass_bearing,
      photo_url
    } = report;

    const { data, error } = await supabase.rpc('insert_activity_report_with_spatial', {
      p_user_id: user_id,
      p_latitude: latitude ? Number(latitude) : null,
      p_longitude: longitude ? Number(longitude) : null,
      p_activity_date: activity_date,
      p_activity_time: activity_time,
      p_observation_type: observation_type,
      p_total_elephants: total_elephants ?? null,
      p_male_elephants: male_elephants ?? null,
      p_female_elephants: female_elephants ?? null,
      p_unknown_elephants: unknown_elephants ?? null,
      p_calves: calves ?? null,
      p_indirect_sighting_type: indirect_sighting_type ?? null,
      p_loss_type: loss_type ?? null,
      p_compass_bearing: compass_bearing ?? null,
      p_photo_url: photo_url ?? null
    });

    if (error) throw error;
    // The function returns an array, take the first result
    if (data && Array.isArray(data) && data.length > 0) {
      const result = data[0];
      return {
        ...report,
        id: result.id,
        associated_division: result.associated_division,
        associated_division_id: result.associated_division_id,
        associated_range: result.associated_range,
        associated_range_id: result.associated_range_id,
        associated_beat: result.associated_beat,
        associated_beat_id: result.associated_beat_id,
        user_ids: result.user_ids
      } as ActivityReport;
    }
    return null;
  } catch (error) {
    console.error('Error creating activity report:', error);
    return null;
  }
}



export async function updateActivityReport(id: string, report: Partial<ActivityReportInput>): Promise<ActivityReport | null> {
  try {
    const { data, error } = await supabase
      .from('activity_reports')
      .update(report)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as ActivityReport;
  } catch (error) {
    console.error('Error updating activity report:', error);
    return null;
  }
}

export async function deleteActivityReport(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('activity_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting activity report:', error);
    return false;
  }
}

export async function listActivityReports(): Promise<ActivityReport[]> {
  try {
    const { data, error } = await supabase
      .from('activity_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as unknown as ActivityReport[];
  } catch (error) {
    console.error('Error listing activity reports:', error);
    return [];
  }
}

export class ActivityReportService {
  private static instance: ActivityReportService;

  private constructor() {}

  public static getInstance(): ActivityReportService {
    if (!ActivityReportService.instance) {
      ActivityReportService.instance = new ActivityReportService();
    }
    return ActivityReportService.instance;
  }

  async getById(id: string): Promise<ActivityReport> {
    const { data, error } = await supabase
      .from('activity_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as unknown as ActivityReport;
  }
}

function isActivityReport(data: unknown): data is ActivityReport {
  if (!data || typeof data !== 'object') return false;
  const report = data as Partial<ActivityReport>;
  return (
    typeof report.id === 'string' &&
    typeof report.status === 'string' &&
    typeof report.is_offline === 'boolean' &&
    typeof report.user_id === 'string' &&
    report.activity_date instanceof Date &&
    typeof report.latitude === 'string' &&
    typeof report.longitude === 'string'
  );
}

export const activityReportService = {
  async create(report: ActivityReportInput): Promise<ActivityReport> {
    const { data, error } = await supabase
      .from('activity_reports')
      .insert(report)
      .select()
      .single();

    if (error) throw error;
    if (!isActivityReport(data)) throw new Error('Invalid activity report data');
    return data;
  },

  async update(id: string, report: Partial<ActivityReportInput>): Promise<ActivityReport> {
    const { data, error } = await supabase
      .from('activity_reports')
      .update(report)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!isActivityReport(data)) throw new Error('Invalid activity report data');
    return data;
  },

  async getById(id: string): Promise<ActivityReport> {
    const { data, error } = await supabase
      .from('activity_reports')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!isActivityReport(data)) throw new Error('Invalid activity report data');
    return data;
  },

  async getAll(): Promise<ActivityReport[]> {
    const { data, error } = await supabase
      .from('activity_reports')
      .select()
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!Array.isArray(data)) throw new Error('Invalid response format');
    if (!data.every(isActivityReport)) throw new Error('Invalid activity report data in response');
    return data as unknown as ActivityReport[];
  },

  async delete(id: string): Promise<ActivityReport> {
    const { data, error } = await supabase
      .from('activity_reports')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!isActivityReport(data)) throw new Error('Invalid activity report data');
    return data;
  }
}; 