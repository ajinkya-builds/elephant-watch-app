import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ActivityReport {
  id: string;
  activity_date: string;
  activity_time: string;
  observation_type: string;
  latitude: number;
  longitude: number;
  created_at: string;
  has_observation: boolean;
}

export function AdminObservations() {
  const [reports, setReports] = useState<ActivityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      console.log('=== STARTING FETCH REPORTS ===');
      
      // First check if we can access the observations table at all
      const { data: testObs, error: testError } = await supabase
        .from('activity_observation')
        .select('count');
      
      console.log('Test observation query:', { data: testObs, error: testError });

      // Fetch all reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('activity_reports')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Reports query result:', { data: reportsData, error: reportsError });

      if (reportsError) throw reportsError;

      // For each report, check if it has an observation
      const formattedReports: ActivityReport[] = [];
      
      for (const report of reportsData || []) {
        console.log('Checking report:', report.id);
        
        // Direct query for observations
        const { data: observations, error: obsError } = await supabase
          .from('activity_observation')
          .select('id')
          .eq('activity_report_id', report.id);

        console.log('Observations for report:', report.id, { data: observations, error: obsError });
        
        formattedReports.push({
          id: report.id,
          activity_date: report.activity_date,
          activity_time: report.activity_time,
          observation_type: report.observation_type,
          latitude: report.latitude,
          longitude: report.longitude,
          created_at: report.created_at,
          has_observation: (observations || []).length > 0,
        });
      }

      console.log('Final formatted reports:', formattedReports);
      setReports(formattedReports);
    } catch (error) {
      console.error('Error in fetchReports:', error);
      toast.error('Failed to fetch activity reports');
    } finally {
      setLoading(false);
    }
  };

  const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const handleManualSync = async (reportId: string) => {
    if (!isValidUUID(reportId)) {
      toast.error('Invalid report ID');
      return;
    }
    try {
      setSyncing(reportId);
      const { error } = await supabase.rpc('process_new_activity_reports', {
        p_report_id: reportId
      });
      if (error) throw error;
      toast.success('Activity report processed successfully');
      await fetchReports(); // Refresh the list
    } catch (error) {
      console.error('Error processing report:', error);
      toast.error('Failed to process activity report');
    } finally {
      setSyncing(null);
    }
  };

  const debugDatabaseState = async () => {
    try {
      // Check all observations
      const { data: allObservations, error: obsError } = await supabase
        .from('activity_observation')
        .select('*');
      
      console.log('=== DEBUG: All Observations ===');
      console.log('Error:', obsError);
      console.log('Data:', allObservations);

      // Check observations for this specific report
      const { data: reportObservations, error: reportError } = await supabase
        .from('activity_observation')
        .select('*')
        .eq('activity_report_id', 'cb1b8de8-f1fe-4e52-8f4e-ad0238295b45');
      
      console.log('=== DEBUG: Observations for Report ===');
      console.log('Error:', reportError);
      console.log('Data:', reportObservations);
    } catch (error) {
      console.error('Debug error:', error);
    }
  };

  useEffect(() => {
    debugDatabaseState();
    fetchReports();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-800">
            Activity Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Location</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b">
                    <td className="py-2">{report.activity_date}</td>
                    <td className="py-2">{report.activity_time}</td>
                    <td className="py-2">{report.observation_type}</td>
                    <td className="py-2">
                      {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                    </td>
                    <td className="py-2">
                      {report.has_observation ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Synced
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Not Synced
                        </div>
                      )}
                    </td>
                    <td className="py-2">
                      {!report.has_observation && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManualSync(report.id)}
                          disabled={syncing === report.id}
                          className="flex items-center gap-1"
                        >
                          {/* You can use a spinner icon here if needed */}
                          {syncing === report.id ? 'Syncing...' : 'Sync Now'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 