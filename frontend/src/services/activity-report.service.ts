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

export async function createActivityReport(report: ActivityReportInput): Promise<ActivityReport | null> {
  try {
    const { data, error } = await supabase
      .from('activity_reports')
      .insert([report])
      .select()
      .single();

    if (error) throw error;
    return data as unknown as ActivityReport;
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