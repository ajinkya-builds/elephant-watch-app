export interface ActivityReport {
    id?: string;
    latitude: number;
    longitude: number;
    associated_division?: string;
    associated_range?: string;
    associated_beat?: string;
    associated_division_id?: string;
    associated_range_id?: string;
    associated_beat_id?: string;
    activity_date: Date;
    observation_type: 'direct' | 'indirect' | 'other';
    elephant_count?: number;
    unknown_elephants?: number;
    notes?: string;
    created_by?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface ActivityReportCreate extends Omit<ActivityReport, 'id' | 'created_at' | 'updated_at'> {}
export interface ActivityReportUpdate extends Partial<ActivityReportCreate> {} 