import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { ActivityReport } from '@/types/activity-report';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminObservations() {
  const [observations, setObservations] = useState<ActivityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchObservations = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setObservations((data || []) as unknown as ActivityReport[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch observations');
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
      await fetchObservations(); // Refresh the list
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (!text) throw new Error('Failed to read file');

        const observations = JSON.parse(text as string);
        const { error } = await supabase
          .from('activity_reports')
          .insert(observations);

        if (error) throw error;
        await fetchObservations();
      };
      reader.readAsText(selectedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import observations');
    }
  };

  useEffect(() => {
    debugDatabaseState();
    fetchObservations();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Observations</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Import Observations</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="observations">JSON File</Label>
            <Input
              id="observations"
              type="file"
              accept=".json"
              onChange={handleFileChange}
            />
          </div>
          <Button
            onClick={handleImport}
            disabled={!selectedFile}
            className="mt-6"
          >
            Import
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Observations</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {observations.map((observation) => (
              <TableRow key={observation.id}>
                <TableCell>{observation.activity_date.toLocaleDateString()}</TableCell>
                <TableCell>{observation.activity_time}</TableCell>
                <TableCell>{observation.observation_type}</TableCell>
                <TableCell>{`${observation.latitude}, ${observation.longitude}`}</TableCell>
                <TableCell>{observation.total_elephants || 0}</TableCell>
                <TableCell>{observation.status}</TableCell>
                <TableCell>{observation.created_at?.toLocaleString()}</TableCell>
                <TableCell>{observation.updated_at?.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 