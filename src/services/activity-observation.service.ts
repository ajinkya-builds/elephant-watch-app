import { supabase } from '../lib/supabaseClient';
import { ActivityObservation, ActivityObservationCreate } from '../types/activity-observation';

export class ActivityObservationService {
    static async create(observation: ActivityObservationCreate): Promise<ActivityObservation> {
        const { data, error } = await supabase
            .from('activity_observation')
            .insert(observation)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getById(id: string): Promise<ActivityObservation> {
        const { data, error } = await supabase
            .from('activity_observation')
            .select()
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    static async getByReportId(reportId: string): Promise<ActivityObservation[]> {
        const { data, error } = await supabase
            .from('activity_observation')
            .select()
            .eq('activity_report_id', reportId);

        if (error) throw error;
        return data;
    }

    static async getByLocation(latitude: number, longitude: number, radiusKm: number = 1): Promise<ActivityObservation[]> {
        const { data, error } = await supabase
            .rpc('get_reports_within_radius', {
                p_latitude: latitude,
                p_longitude: longitude,
                p_radius_km: radiusKm
            });

        if (error) throw error;
        return data;
    }

    static async getByDivision(divisionId: string): Promise<ActivityObservation[]> {
        const { data, error } = await supabase
            .from('activity_observation')
            .select()
            .eq('associated_division_id', divisionId);

        if (error) throw error;
        return data;
    }

    static async getByRange(rangeId: string): Promise<ActivityObservation[]> {
        const { data, error } = await supabase
            .from('activity_observation')
            .select()
            .eq('associated_range_id', rangeId);

        if (error) throw error;
        return data;
    }

    static async getByBeat(beatId: string): Promise<ActivityObservation[]> {
        const { data, error } = await supabase
            .from('activity_observation')
            .select()
            .eq('associated_beat_id', beatId);

        if (error) throw error;
        return data;
    }

    static async update(id: string, observation: Partial<ActivityObservation>): Promise<ActivityObservation> {
        const { data, error } = await supabase
            .from('activity_observation')
            .update(observation)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('activity_observation')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
} 