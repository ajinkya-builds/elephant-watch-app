export type ObservationType = 'direct' | 'indirect' | 'loss';
export type LossType = 'No loss' | 'property' | 'crop' | 'livestock' | 'fencing' | 'solar panels' | 'FD establishment' | 'Other';
export type IndirectSightingType = 'Pugmark' | 'Dung' | 'Broken Branches' | 'Sound' | 'Eyewitness';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile?: string;
}

export interface ActivityObservation {
  id: string;
  activity_report_id: string;
  total_elephants: number;
  adult_male_count: number;
  adult_female_count: number;
  sub_adult_male_count: number;
  sub_adult_female_count: number;
  calf_count: number;
  unknown_count: number;
  indirect_sighting_type?: IndirectSightingType;
  damage_done: string;
  damage_description: string;
  loss_type?: LossType;
  compass_bearing?: number;
  created_at: Date;
  updated_at?: Date;
}

export interface ActivityReport {
  id: string;


  user_id: string;
  activity_date: Date;
  activity_time: string;
  latitude: string;
  longitude: string;
  observation_type: ObservationType;
  compass_bearing?: number;
  total_elephants?: number;
  male_elephants?: number;
  female_elephants?: number;
  unknown_elephants?: number;
  calves?: number;
  indirect_sighting_type?: IndirectSightingType;
  loss_type?: LossType;
  photo_url?: string;
  created_at?: Date;
  updated_at?: Date;
  synced_at?: Date;
  sync_error?: string;
  users?: User;
  division_name?: string;
  range_name?: string;
  beat_name?: string;
  damage_done?: string;
  damage_description?: string;
  reporter_mobile?: string;
  activity_observation?: ActivityObservation[];
  email?: string;
  associated_division?: string;
  associated_range?: string;
  associated_beat?: string;
}

export type ActivityReportInput = Omit<ActivityReport, 'id' | 'created_at' | 'updated_at'>;

export interface ActivityReportCreate extends Omit<ActivityReport, 'id' | 'created_at' | 'updated_at'> {}
export interface ActivityReportUpdate extends Partial<ActivityReportCreate> {}