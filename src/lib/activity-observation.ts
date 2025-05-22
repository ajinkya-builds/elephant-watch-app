import { supabase } from './supabaseClient';
import { ActivityObservationCreate } from '../types/activity-observation';

export async function createActivityObservation(
    activityReportId: string,
    formData: {
        latitude: number;
        longitude: number;
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
    }
): Promise<void> {
    try {
        console.log('Creating activity observation with report ID:', activityReportId);
        console.log('Form data:', formData);

        const { error } = await supabase
            .from('activity_observation')
            .insert({
                activity_report_id: activityReportId,
                latitude: formData.latitude,
                longitude: formData.longitude,
                activity_date: formData.activity_date,
                activity_time: formData.activity_time,
                observation_type: formData.observation_type,
                total_elephants: formData.total_elephants,
                male_elephants: formData.male_elephants,
                female_elephants: formData.female_elephants,
                unknown_elephants: formData.unknown_elephants,
                calves: formData.calves,
                indirect_sighting_type: formData.indirect_sighting_type,
                loss_type: formData.loss_type,
                compass_bearing: formData.compass_bearing,
                photo_url: formData.photo_url,
                user_id: formData.user_id
            });

        if (error) {
            console.error('Error creating activity observation:', error);
            throw error;
        }

        console.log('Activity observation created successfully');
    } catch (error) {
        console.error('Failed to create activity observation:', error);
        throw error;
    }
}

export async function getObservationsByReportId(reportId: string) {
    try {
        const { data, error } = await supabase
            .from('activity_observation')
            .select('*')
            .eq('activity_report_id', reportId);

        if (error) {
            console.error('Error fetching observations:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Failed to fetch observations:', error);
        throw error;
    }
}

export async function getObservationsByLocation(latitude: number, longitude: number, radiusKm: number = 1) {
    try {
        const { data, error } = await supabase
            .rpc('get_reports_within_radius', {
                p_latitude: latitude,
                p_longitude: longitude,
                p_radius_km: radiusKm
            });

        if (error) {
            console.error('Error fetching observations by location:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Failed to fetch observations by location:', error);
        throw error;
    }
} 