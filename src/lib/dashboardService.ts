import { supabase } from './supabaseClient';

export interface DashboardKPIs {
  total_observations: number;
  direct_sightings: number;
  indirect_sightings: number;
  total_loss: number;
  today_observations: number;
  today_direct_sightings: number;
  today_indirect_sightings: number;
  today_loss: number;
  total_elephants: number;
  male_elephants: number;
  female_elephants: number;
  calves: number;
  unknown_elephants: number;
  last_updated: string;
}

export interface MonthlyTrend {
  month: string;
  total_observations: number;
  total_elephants: number;
  direct_sightings: number;
  indirect_sightings: number;
  loss_reports: number;
}

export interface DivisionStat {
  associated_division: string;
  total_observations: number;
  direct_sightings: number;
  indirect_sightings: number;
  loss_reports: number;
  total_elephants: number;
}

export async function fetchDashboardKPIs(): Promise<DashboardKPIs> {
  try {
    const { data: kpiData, error: kpiError } = await supabase
      .from('v_dashboard_kpi_summary')
      .select('*')
      .single();

    if (kpiError) {
      console.error('Error fetching dashboard KPIs:', kpiError);
      throw kpiError;
    }

    return {
      total_observations: kpiData.total_observations,
      direct_sightings: kpiData.direct_sightings,
      indirect_sightings: kpiData.indirect_sightings,
      total_loss: kpiData.total_loss,
      today_observations: kpiData.today_observations,
      today_direct_sightings: kpiData.today_direct_sightings || 0,
      today_indirect_sightings: kpiData.today_indirect_sightings || 0,
      today_loss: kpiData.today_loss || 0,
      total_elephants: kpiData.total_elephants,
      male_elephants: kpiData.male_elephants,
      female_elephants: kpiData.female_elephants,
      calves: kpiData.calves,
      unknown_elephants: kpiData.unknown_elephants,
      last_updated: kpiData.last_updated
    };
  } catch (error) {
    console.error('Failed to fetch dashboard KPIs:', error);
    throw error;
  }
}

export async function fetchMonthlyTrends(): Promise<MonthlyTrend[]> {
  try {
    const { data: trendsData, error: trendsError } = await supabase
      .from('v_dashboard_monthly_trends')
      .select('*')
      .order('month', { ascending: false });

    if (trendsError) {
      console.error('Error fetching monthly trends:', trendsError);
      throw trendsError;
    }

    return trendsData;
  } catch (error) {
    console.error('Failed to fetch monthly trends:', error);
    throw error;
  }
}

export async function fetchDivisionStats(): Promise<DivisionStat[]> {
  try {
    const { data: divisionData, error: divisionError } = await supabase
      .from('v_dashboard_division_stats')
      .select('*')
      .order('total_observations', { ascending: false });

    if (divisionError) {
      console.error('Error fetching division stats:', divisionError);
      throw divisionError;
    }

    return divisionData;
  } catch (error) {
    console.error('Failed to fetch division stats:', error);
    throw error;
  }
}

export interface RecentActivity {
  id: string;
  activity_date: string;
  activity_time: string;
  observation_type: string;
  total_elephants?: number;
  indirect_sighting_type?: string;
  loss_type?: string;
  location: string;
}

export async function fetchRecentActivities(): Promise<RecentActivity[]> {
  try {
    const { data, error } = await supabase
      .from('activity_reports')
      .select(`
        id,
        activity_date,
        activity_time,
        observation_type,
        total_elephants,
        indirect_sighting_type,
        loss_type,
        associated_division,
        associated_range,
        associated_beat
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }

    return (data || []).map(activity => ({
      id: activity.id,
      activity_date: activity.activity_date,
      activity_time: activity.activity_time,
      observation_type: activity.observation_type,
      total_elephants: activity.total_elephants,
      indirect_sighting_type: activity.indirect_sighting_type,
      loss_type: activity.loss_type,
      location: [
        activity.associated_division,
        activity.associated_range,
        activity.associated_beat
      ].filter(Boolean).join(' > ')
    }));
  } catch (error) {
    console.error('Failed to fetch recent activities:', error);
    throw error;
  }
}

export interface HeatmapDataPoint {
  latitude: number;
  longitude: number;
  weight: number;
}

export async function fetchHeatmapData(): Promise<HeatmapDataPoint[]> {
  try {
    const { data, error } = await supabase
      .from('v_activity_heatmap')
      .select('latitude, longitude, activity_count');

    if (error) {
      console.error('Error fetching heatmap data:', error);
      throw error;
    }

    return (data || []).map(point => ({
      latitude: parseFloat(point.latitude),
      longitude: parseFloat(point.longitude),
      weight: point.activity_count
    }));
  } catch (error) {
    console.error('Failed to fetch heatmap data:', error);
    throw error;
  }
}

export interface RecentObservation {
  associated_division: string;
  associated_range: string;
  associated_beat: string;
  activity_date: string;
  observation_type: string;
  total_elephants: number;
}

export async function fetchRecentObservations(): Promise<RecentObservation[]> {
  try {
    const { data, error } = await supabase
      .from('activity_observation')
      .select(`
        associated_division,
        associated_range,
        associated_beat,
        activity_date,
        observation_type,
        total_elephants
      `)
      .order('activity_date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching recent observations:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch recent observations:', error);
    throw error;
  }
} 