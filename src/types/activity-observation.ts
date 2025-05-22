export interface ActivityObservation {
    id?: string;
    activity_report_id: string;
    latitude: number;
    longitude: number;
    associated_division?: string;
    associated_range?: string;
    associated_beat?: string;
    associated_division_id?: string;
    associated_range_id?: string;
    associated_beat_id?: string;
    activity_date: Date;
    activity_time: string;
    observation_type: 'direct' | 'indirect' | 'loss';
    total_elephants?: number;
    male_elephants?: number;
    female_elephants?: number;
    unknown_elephants?: number;
    calves?: number;
    indirect_sighting_type?: 'Pugmark' | 'Dung' | 'Broken Branches' | 'Sound' | 'Eyewitness';
    loss_type?: 'No loss' | 'crop' | 'livestock' | 'property' | 'fencing' | 'solar panels' | 'FD establishment' | 'Other';
    compass_bearing?: number;
    photo_url?: string;
    user_id: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface ActivityObservationCreate extends Omit<ActivityObservation, 'id' | 'created_at' | 'updated_at'> {} 