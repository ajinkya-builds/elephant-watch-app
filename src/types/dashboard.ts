export interface KPISummary {
  total_activities: number;
  total_users: number;
  total_days: number;
  total_elephants_sighted: number;
  today_activities: number;
  today_active_users: number;
  weekly_activities: number;
  weekly_active_users: number;
  total_divisions: number;
  total_ranges: number;
  total_beats: number;
  total_loss_reports?: number;
  loss_types?: { loss_type: string; count: number }[];
}

export interface DivisionStat {
  division_id: string;
  division_name: string;
  total_observations: number;
  direct_sightings: number;
  indirect_signs: number;
  loss_reports: number;
  total_elephants: number;
  unique_observers: number;
  days_with_activity: number;
}

export interface RangeStat {
  range_id: string;
  range_name: string;
  division_id: string;
  division_name: string;
  total_observations: number;
  direct_sightings: number;
  indirect_signs: number;
  loss_reports: number;
  total_elephants: number;
  unique_observers: number;
  days_with_activity: number;
}

export interface BeatStat {
  beat_id: string;
  beat_name: string;
  range_id: string;
  range_name: string;
  division_id: string;
  division_name: string;
  total_observations: number;
  direct_sightings: number;
  indirect_signs: number;
  loss_reports: number;
  total_elephants: number;
  unique_observers: number;
  days_with_activity: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  observation_count: number;
  total_elephants_seen: number;
  last_observation_date: string;
  division_id: string;
  division_name: string;
  range_id: string;
  range_name: string;
  beat_id: string;
  beat_name: string;
}

export interface DashboardData {
  kpiSummary?: KPISummary;
  divisionStats: DivisionStat[];
  rangeStats: RangeStat[];
  beatStats: BeatStat[];
  heatmap: HeatmapPoint[];
  observationTypes: {
    observation_type: string;
    count: number;
  }[];
} 