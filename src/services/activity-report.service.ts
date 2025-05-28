import { supabase } from '../lib/supabase';
import { ActivityReport, ActivityReportCreate, ActivityReportUpdate } from '../types/activity-report';

export class ActivityReportService {
    private static instance: ActivityReportService;
    private readonly table = 'activity_reports';

    private constructor() {}

    public static getInstance(): ActivityReportService {
        if (!ActivityReportService.instance) {
            ActivityReportService.instance = new ActivityReportService();
        }
        return ActivityReportService.instance;
    }

    async create(report: ActivityReportCreate): Promise<ActivityReport> {
        // user_id must be public.users.id, not the auth UID
        const { data, error } = await supabase
            .from(this.table)
            .insert(report)
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating activity report: ${error.message}`);
        }

        return data as ActivityReport;
    }

    async getById(id: string): Promise<ActivityReport | null> {
        const { data, error } = await supabase
            .from(this.table)
            .select()
            .eq('id', id)
            .maybeSingle();

        if (error) {
            throw new Error(`Error fetching activity report: ${error.message}`);
        }

        if (!data) return null;
        return data as ActivityReport;
    }

    async update(id: string, report: ActivityReportUpdate): Promise<ActivityReport> {
        const { data, error } = await supabase
            .from(this.table)
            .update(report)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error updating activity report: ${error.message}`);
        }

        return data as ActivityReport;
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from(this.table)
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Error deleting activity report: ${error.message}`);
        }
    }

    async list(filters?: {
        startDate?: Date;
        endDate?: Date;
        division?: string;
        range?: string;
        beat?: string;
    }): Promise<ActivityReport[]> {
        let query = supabase
            .from(this.table)
            .select();

        if (filters?.startDate) {
            query = query.gte('activity_date', filters.startDate.toISOString());
        }

        if (filters?.endDate) {
            query = query.lte('activity_date', filters.endDate.toISOString());
        }

        if (filters?.division) {
            query = query.eq('associated_division', filters.division);
        }

        if (filters?.range) {
            query = query.eq('associated_range', filters.range);
        }

        if (filters?.beat) {
            query = query.eq('associated_beat', filters.beat);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Error listing activity reports: ${error.message}`);
        }

        return data as ActivityReport[];
    }

    async getReportsByLocation(latitude: number, longitude: number, radiusKm: number): Promise<ActivityReport[]> {
        const { data, error } = await supabase
            .rpc('get_reports_within_radius', {
                p_latitude: latitude,
                p_longitude: longitude,
                p_radius_km: radiusKm
            });

        if (error) {
            throw new Error(`Error fetching reports by location: ${error.message}`);
        }

        return data as ActivityReport[];
    }
} 