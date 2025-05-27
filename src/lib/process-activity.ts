import { supabase } from './supabaseClient';

export async function processActivityReport(reportId: string) {
    try {
        // 1. Get the activity report
        const { data: report, error: reportError } = await supabase
            .from('activity_reports')
            .select('*')
            .eq('id', reportId)
            .single();

        if (reportError) {
            throw new Error(`Error fetching activity report: ${reportError.message}`);
        }

        if (!report) {
            throw new Error('Report not found');
        }

        console.log('Processing report:', report);

        // 2. Get geographical boundaries
        const { data: boundary, error: boundaryError } = await supabase
            .rpc('identify_geographical_boundaries', {
                p_latitude: parseFloat(report.latitude),
                p_longitude: parseFloat(report.longitude)
            });

        if (boundaryError) {
            throw new Error(`Error identifying boundaries: ${boundaryError.message}`);
        }

        const boundaryData = boundary?.[0];
        console.log('Identified boundaries:', boundaryData);

        // 3. Get the public user ID from auth.uid()
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', report.user_id)
            .single();

        if (userError) {
            throw new Error(`Error fetching user: ${userError.message}`);
        }
        if (!userData) {
            throw new Error('User not found');
        }

        // 4. Create activity observation
        const observationData = {
            activity_report_id: report.id,
            latitude: parseFloat(report.latitude),
            longitude: parseFloat(report.longitude),
            activity_date: report.activity_date,
            activity_time: report.activity_time,
            observation_type: report.observation_type,
            total_elephants: report.total_elephants,
            male_elephants: report.male_elephants,
            female_elephants: report.female_elephants,
            unknown_elephants: report.unknown_elephants,
            calves: report.calves,
            indirect_sighting_type: report.indirect_sighting_type,
            loss_type: report.loss_type,
            compass_bearing: report.compass_bearing,
            photo_url: report.photo_url,
            user_id: userData.id, // Use the public user ID
            // Add geographical boundaries
            associated_division: boundaryData?.division_name,
            associated_division_id: boundaryData?.division_id,
            associated_range: boundaryData?.range_name,
            associated_range_id: boundaryData?.range_id,
            associated_beat: boundaryData?.beat_name,
            associated_beat_id: boundaryData?.beat_id
        };

        console.log('Creating observation with data:', observationData);

        const { data: observation, error: insertError } = await supabase
            .from('activity_observation')
            .insert([observationData])
            .select()
            .single();

        if (insertError) {
            throw new Error(`Error creating observation: ${insertError.message}`);
        }

        console.log('Successfully created observation:', observation);
        return observation;
    } catch (error) {
        console.error('Error processing activity report:', error);
        throw error;
    }
} 