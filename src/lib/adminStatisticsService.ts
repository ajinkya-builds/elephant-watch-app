import { supabase } from "./supabaseClient";

export interface UserStats {
  total_users: number;
  active_users: number;
  daily_active_users: number;
  total_admins: number;
  total_moderators: number;
  total_regular_users: number;
  new_users_7d: number;
  new_users_30d: number;
}

export interface ActivityStats {
  total_records: number;
  records_24h: number;
  records_7d: number;
  records_30d: number;
  active_users_24h: number;
  active_users_7d: number;
  active_users_30d: number;
}

export interface SystemHealth {
  errors_24h: number;
  errors_7d: number;
  failed_logins_24h: number;
  failed_logins_7d: number;
  system_failures_24h: number;
  system_failures_7d: number;
}

export interface UserActivityTimeline {
  hour: string;
  activity_count: number;
  unique_users: number;
}

export interface RecordCreationTimeline {
  day: string;
  record_count: number;
  unique_users: number;
}

export interface ResourceUtilization {
  hour: string;
  request_count: number;
  avg_response_time: number;
  error_count: number;
}

export interface RecentActivity {
  event_type: 'login' | 'error' | 'system';
  user: string;
  event_time: string;
  details: string;
}

export interface AdminStatisticsData {
  userStats: UserStats;
  activityStats: ActivityStats;
  systemHealth: SystemHealth;
  userActivityTimeline: UserActivityTimeline[];
  recordCreationTimeline: RecordCreationTimeline[];
  resourceUtilization: ResourceUtilization[];
  recentActivity: RecentActivity[];
}

export async function fetchAdminStatistics(): Promise<AdminStatisticsData> {
  try {
    const [
      { data: userStats },
      { data: activityStats },
      { data: systemHealth },
      { data: userActivityTimeline },
      { data: recordCreationTimeline },
      { data: resourceUtilization },
      { data: recentActivity }
    ] = await Promise.all([
      supabase.from('v_admin_user_stats').select('*').single(),
      supabase.from('v_admin_activity_stats').select('*').single(),
      supabase.from('v_admin_system_health').select('*').single(),
      supabase.from('v_admin_user_activity_timeline').select('*'),
      supabase.from('v_admin_record_creation_timeline').select('*'),
      supabase.from('v_admin_resource_utilization').select('*'),
      supabase.from('v_admin_recent_activity').select('*')
    ]);

    return {
      userStats: userStats || {
        total_users: 0,
        active_users: 0,
        daily_active_users: 0,
        total_admins: 0,
        total_moderators: 0,
        total_regular_users: 0,
        new_users_7d: 0,
        new_users_30d: 0
      },
      activityStats: activityStats || {
        total_records: 0,
        records_24h: 0,
        records_7d: 0,
        records_30d: 0,
        active_users_24h: 0,
        active_users_7d: 0,
        active_users_30d: 0
      },
      systemHealth: systemHealth || {
        errors_24h: 0,
        errors_7d: 0,
        failed_logins_24h: 0,
        failed_logins_7d: 0,
        system_failures_24h: 0,
        system_failures_7d: 0
      },
      userActivityTimeline: userActivityTimeline || [],
      recordCreationTimeline: recordCreationTimeline || [],
      resourceUtilization: resourceUtilization || [],
      recentActivity: recentActivity || []
    };
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    throw error;
  }
} 