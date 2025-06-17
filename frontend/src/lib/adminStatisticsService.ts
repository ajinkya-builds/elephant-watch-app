import { supabase } from './supabase';

export interface UserStats {
  total_users: number;
  active_users: number;
  daily_active_users: number;
  total_admins: number;
  new_users_24h: number;
  new_users_7d: number;
  new_users_30d: number;
  user_growth_rate: number;
}

export interface ActivityStats {
  total_records: number;
  records_24h: number;
  records_7d: number;
  records_30d: number;
  avg_records_per_user: number;
  most_common_activity: string;
  activity_distribution: Record<string, number>;
}

export interface SystemHealth {
  errors_24h: number;
  errors_7d: number;
  failed_logins_24h: number;
  failed_logins_7d: number;
  system_uptime: number;
  avg_response_time: number;
}

export interface UserActivityTimeline {
  hour: number;
  activity_count: number;
  unique_users: number;
}

export interface RecordCreationTimeline {
  day: string;
  record_count: number;
  unique_users: number;
}

export interface ResourceUtilization {
  hour: number;
  request_count: number;
  avg_response_time: number;
  error_count: number;
}

export interface RecentActivity {
  event_type: string;
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

const defaultUserStats: UserStats = {
  total_users: 0,
  active_users: 0,
  daily_active_users: 0,
  total_admins: 0,
  new_users_24h: 0,
  new_users_7d: 0,
  new_users_30d: 0,
  user_growth_rate: 0
};

const defaultActivityStats: ActivityStats = {
  total_records: 0,
  records_24h: 0,
  records_7d: 0,
  records_30d: 0,
  avg_records_per_user: 0,
  most_common_activity: '',
  activity_distribution: {}
};

const defaultSystemHealth: SystemHealth = {
  errors_24h: 0,
  errors_7d: 0,
  failed_logins_24h: 0,
  failed_logins_7d: 0,
  system_uptime: 100,
  avg_response_time: 0
};

export async function getAdminStatistics(): Promise<AdminStatisticsData> {
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
      supabase.from('user_statistics').select('*').single(),
      supabase.from('activity_statistics').select('*').single(),
      supabase.from('system_health').select('*').single(),
      supabase.from('user_activity_timeline').select('*'),
      supabase.from('record_creation_timeline').select('*'),
      supabase.from('resource_utilization').select('*'),
      supabase.from('recent_activity').select('*')
    ]);

    return {
      userStats: userStats || defaultUserStats,
      activityStats: activityStats || defaultActivityStats,
      systemHealth: systemHealth || defaultSystemHealth,
      userActivityTimeline: userActivityTimeline || [],
      recordCreationTimeline: recordCreationTimeline || [],
      resourceUtilization: resourceUtilization || [],
      recentActivity: recentActivity || []
    };
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return {
      userStats: defaultUserStats,
      activityStats: defaultActivityStats,
      systemHealth: defaultSystemHealth,
      userActivityTimeline: [],
      recordCreationTimeline: [],
      resourceUtilization: [],
      recentActivity: []
    };
  }
} 