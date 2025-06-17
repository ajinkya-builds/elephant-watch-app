import { supabase } from '../lib/supabaseClient';
import { ActivityObservation, ActivityObservationCreate } from '../types/activity-observation';

// Helper function to map database response to ActivityObservation
const mapToActivityObservation = (data: any): ActivityObservation => {
  if (!data) throw new Error('No data provided to mapToActivityObservation');
  
  return {
    id: data.id,
    activity_report_id: data.activity_report_id,
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    associated_division: data.associated_division || undefined,
    associated_range: data.associated_range || undefined,
    associated_beat: data.associated_beat || undefined,
    associated_division_id: data.associated_division_id || undefined,
    associated_range_id: data.associated_range_id || undefined,
    associated_beat_id: data.associated_beat_id || undefined,
    activity_date: new Date(data.activity_date),
    activity_time: data.activity_time,
    observation_type: data.observation_type,
    total_elephants: data.total_elephants ? Number(data.total_elephants) : undefined,
    male_elephants: data.male_elephants ? Number(data.male_elephants) : undefined,
    female_elephants: data.female_elephants ? Number(data.female_elephants) : undefined,
    unknown_elephants: data.unknown_elephants ? Number(data.unknown_elephants) : undefined,
    calves: data.calves ? Number(data.calves) : undefined,
    indirect_sighting_type: data.indirect_sighting_type as any,
    loss_type: data.loss_type as any,
    compass_bearing: data.compass_bearing ? Number(data.compass_bearing) : undefined,
    photo_url: data.photo_url || undefined,
    user_id: data.user_id,
    created_at: data.created_at ? new Date(data.created_at) : undefined,
    updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
    observer_name: data.observer_name || undefined,
    observer_email: data.observer_email || undefined,
  };
};

export class ActivityObservationService {
    static async create(observation: ActivityObservationCreate): Promise<ActivityObservation> {
        try {
            // Get the public user ID from auth.uid()
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('auth_id', observation.user_id)
                .single();

            if (userError) throw userError;
            if (!userData) throw new Error('User not found');

            // Update the user_id to use the public user ID
            const observationWithPublicUserId = {
                ...observation,
                user_id: userData.id as string
            };

            const { data, error } = await supabase
                .from('activity_observation')
                .insert(observationWithPublicUserId)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error('No data returned from create');
            
            return mapToActivityObservation(data);
        } catch (error) {
            console.error('Error in ActivityObservationService.create:', error);
            throw error;
        }
    }

    static async getById(id: string): Promise<ActivityObservation> {
        try {
            const { data, error } = await supabase
                .from('activity_observation')
                .select()
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) throw new Error(`No observation found with id ${id}`);
            
            return mapToActivityObservation(data);
        } catch (error) {
            console.error(`Error in ActivityObservationService.getById(${id}):`, error);
            throw error;
        }
    }

    static async getByReportId(reportId: string): Promise<ActivityObservation[]> {
        try {
            const { data, error } = await supabase
                .from('activity_observation')
                .select()
                .eq('activity_report_id', reportId);

            if (error) throw error;
            
            return (data || []).map(mapToActivityObservation);
        } catch (error) {
            console.error(`Error in ActivityObservationService.getByReportId(${reportId}):`, error);
            throw error;
        }
    }

    static async getByLocation(latitude: number, longitude: number, radiusKm: number = 1): Promise<ActivityObservation[]> {
        try {
            const { data, error } = await supabase
                .rpc('get_reports_within_radius', {
                    p_latitude: latitude,
                    p_longitude: longitude,
                    p_radius_km: radiusKm
                });

            if (error) throw error;
            
            // Ensure we have an array and map each item
            const results = Array.isArray(data) ? data : [];
            return results.map(mapToActivityObservation);
        } catch (error) {
            console.error('Error in ActivityObservationService.getByLocation:', error);
            throw error;
        }
    }

    static async getByDivision(divisionId: string): Promise<ActivityObservation[]> {
        try {
            const { data, error } = await supabase
                .from('activity_observation')
                .select()
                .eq('associated_division_id', divisionId);

            if (error) throw error;
            
            return (data || []).map(mapToActivityObservation);
        } catch (error) {
            console.error(`Error in ActivityObservationService.getByDivision(${divisionId}):`, error);
            throw error;
        }
    }

    static async getByRange(rangeId: string): Promise<ActivityObservation[]> {
        try {
            const { data, error } = await supabase
                .from('activity_observation')
                .select()
                .eq('range_id', rangeId);


            if (error) throw error;
            
            return (data || []).map(mapToActivityObservation);
        } catch (error) {
            console.error(`Error in ActivityObservationService.getByRange(${rangeId}):`, error);
            throw error;
        }
    }

    static async getByBeat(beatId: string): Promise<ActivityObservation[]> {
        try {
            const { data, error } = await supabase
                .from('activity_observation')
                .select()
                .eq('associated_beat_id', beatId);

            if (error) throw error;
            
            return (data || []).map(mapToActivityObservation);
        } catch (error) {
            console.error(`Error in ActivityObservationService.getByBeat(${beatId}):`, error);
            throw error;
        }
    }

    static async update(id: string, observation: Partial<ActivityObservation>): Promise<ActivityObservation> {
        try {
            // If user_id is being updated, ensure it's the public user ID
            if (observation.user_id) {
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('auth_id', observation.user_id)
                    .single();

                if (userError) throw userError;
                if (!userData) throw new Error('User not found');

                observation.user_id = userData.id as string;
            }

            const { data, error } = await supabase
                .from('activity_observation')
                .update(observation)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error(`No observation found with id ${id}`);
            
            return mapToActivityObservation(data);
        } catch (error) {
            console.error(`Error in ActivityObservationService.update(${id}):`, error);
            throw error;
        }
    }

    static async delete(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('activity_observation')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error(`Error in ActivityObservationService.delete(${id}):`, error);
            throw error;
        }
    }
} 