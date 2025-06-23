import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabaseClient";
import { ActivityReport, ActivityObservation, User, ObservationType, IndirectSightingType, LossType, ActivityReportUpdate, ReportStatus } from "@/types/activity-report";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight, Download, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// All user_id references in this file must be public.users.id, not the auth UID. If setting user_id, look up by auth_id.

interface SupabaseResponse {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  activity_date: string;
  activity_time: string;
  latitude: number;
  longitude: number;
  observation_type: 'direct' | 'indirect' | 'loss';
  status: 'draft' | 'submitted' | 'synced' | 'error';
  is_offline: boolean;
  users?: any;
  activity_observation?: any[];
  [key: string]: any;
}

function isSupabaseResponse(data: any): data is SupabaseResponse {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.created_at === 'string' &&
    typeof data.updated_at === 'string' &&
    typeof data.user_id === 'string' &&
    typeof data.activity_date === 'string' &&
    typeof data.activity_time === 'string' &&
    typeof data.latitude === 'number' &&
    typeof data.longitude === 'number' &&
    ['direct', 'indirect', 'loss'].includes(data.observation_type) &&
    ['draft', 'submitted', 'synced', 'error'].includes(data.status) &&
    typeof data.is_offline === 'boolean'
  );
}

interface SupabaseUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile?: string;
}

interface SupabaseActivityObservation {
  id: string;
  activity_report_id: string;
  total_elephants: number;
  adult_male_count: number;
  adult_female_count: number;
  sub_adult_male_count: number;
  sub_adult_female_count: number;
  calf_count: number;
  unknown_count: number;
  indirect_sighting_type?: string;
  damage_done: string;
  damage_description?: string;
  loss_type?: string;
  compass_bearing?: number;
  created_at: string;
  updated_at: string;
}

interface SupabaseActivityReport {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  activity_date: string;
  activity_time: string;
  latitude: number;
  longitude: number;
  observation_type: 'direct' | 'indirect' | 'loss';
  status: 'draft' | 'submitted' | 'synced' | 'error';
  is_offline: boolean;
  division_id?: string;
  range_id?: string;
  beat_id?: string;
  division_name?: string;
  range_name?: string;
  beat_name?: string;
  compass_bearing?: number;
  indirect_sighting_type?: string;
  damage_done?: string;
  damage_description?: string;
  loss_type?: string;
  photo_url?: string;
  users?: SupabaseUser;
  activity_observation?: SupabaseActivityObservation[];
  reporter_mobile?: string;
  total_elephants?: number;
  adult_male_count?: number;
  adult_female_count?: number;
  unknown_count?: number;
  associated_division?: string;
  associated_range?: string;
  associated_beat?: string;
  email?: string;
}

function isSupabaseActivityReport(data: any): data is SupabaseActivityReport {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.created_at === 'string' &&
    typeof data.updated_at === 'string' &&
    typeof data.user_id === 'string' &&
    typeof data.activity_date === 'string' &&
    typeof data.activity_time === 'string' &&
    typeof data.latitude === 'number' &&
    typeof data.longitude === 'number' &&
    ['direct', 'indirect', 'loss'].includes(data.observation_type) &&
    ['draft', 'submitted', 'synced', 'error'].includes(data.status) &&
    typeof data.is_offline === 'boolean'
  );
}

const indirectSightingTypes: IndirectSightingType[] = [
  'Pugmark', 'Dung', 'Broken Branches', 'Sound', 'Eyewitness'
];
const lossTypes: LossType[] = [
  'No loss', 'property', 'crop', 'livestock', 'fencing', 'solar panels', 'FD establishment', 'Other'
];

function toIndirectSightingType(val: string | undefined): IndirectSightingType | undefined {
  return indirectSightingTypes.includes(val as IndirectSightingType) ? (val as IndirectSightingType) : undefined;
}
function toLossType(val: string | undefined): LossType | undefined {
  return lossTypes.includes(val as LossType) ? (val as LossType) : undefined;
}

function convertToActivityReport(data: SupabaseResponse): ActivityReport {
  const activityObservation = data.activity_observation?.[0];
  return {
    ...data,
    latitude: String(data.latitude),
    longitude: String(data.longitude),
    activity_date: new Date(data.activity_date),
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    activity_observation: activityObservation ? [{
      ...activityObservation,
      created_at: new Date(activityObservation.created_at),
      updated_at: activityObservation.updated_at ? new Date(activityObservation.updated_at) : undefined,
      indirect_sighting_type: toIndirectSightingType(activityObservation.indirect_sighting_type),
      loss_type: toLossType(activityObservation.loss_type),
      damage_done: activityObservation.damage_done || '',
      damage_description: activityObservation.damage_description || '',
      unknown_count: activityObservation.unknown_count ?? 0,
      calf_count: activityObservation.calf_count ?? 0,
      adult_male_count: activityObservation.adult_male_count ?? 0,
      adult_female_count: activityObservation.adult_female_count ?? 0,
      sub_adult_male_count: activityObservation.sub_adult_male_count ?? 0,
      sub_adult_female_count: activityObservation.sub_adult_female_count ?? 0,
      total_elephants: activityObservation.total_elephants ?? 0
    }] : undefined
  };
}

interface Observation extends ActivityReport {
  activity_observation?: ActivityObservation[];
  users?: User;
}

interface SupabaseResponseWithUsers extends SupabaseResponse {
  users: SupabaseUser;
}

export default function AdminObservations() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [viewObs, setViewObs] = useState<Observation | null>(null);
  const [editObs, setEditObs] = useState<Observation | null>(null);
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    reporterName: "",
    dateRange: null as Date | null,
    showUnsyncedOnly: false
  });
  const [sortConfig, setSortConfig] = useState<{ key: keyof ActivityReport; direction: 'asc' | 'desc' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activityDate, setActivityDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  const fetchObservations = async () => {
    try {
      const { data: reports, error: reportsError } = await supabase
        .from('activity_reports')
        .select('*, users(*)');

      if (reportsError) throw reportsError;

      const observations: Observation[] = Array.isArray(reports)
        ? reports
            .filter((report): report is SupabaseResponseWithUsers => 
              isSupabaseResponse(report) && 'users' in report)
            .map(convertToActivityReport)
        : [];

      setObservations(observations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch observations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, []);

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert data to CSV
      const headers = [
        'Date/Time',
        'Division',
        'Range',
        'Beat',
        'Total Elephants',
        'Damage Done',
        'Reporter Name',
        'Email',
        'Contact'
      ];

      const validReports = (data || [])
        .filter(isSupabaseActivityReport)
        .map(convertToActivityReport);

      const csvContent = [
        headers.join(','),
        ...validReports.map(obs => [
          new Date(obs.created_at).toLocaleString(),
          obs.division_name || '',
          obs.range_name || '',
          obs.beat_name || '',
          obs.total_elephants || 0,
          obs.damage_done || '',
          `${obs.users?.first_name || ''} ${obs.users?.last_name || ''}`.trim() || 'Unknown',
          obs.users?.email || '',
          obs.reporter_mobile || ''
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `activity_reports_${new Date().toISOString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('activity_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setObservations(observations.filter(obs => obs.id !== id));
      toast.success('Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReports.size === 0) {
      toast.warning('Please select reports to delete');
      return;
    }

    try {
      const { error } = await supabase
        .from('activity_reports')
        .delete()
        .in('id', Array.from(selectedReports));

      if (error) throw error;
      setObservations(observations.filter(obs => !selectedReports.has(obs.id)));
      setSelectedReports(new Set());
      toast.success('Selected reports deleted successfully');
    } catch (error) {
      console.error('Error deleting reports:', error);
      toast.error('Failed to delete reports');
    }
  };

  const handleSort = (key: keyof ActivityReport) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleEdit = async (formData: FormData) => {
    if (!editObs?.id) return;
    
    try {
      const result = await supabase
        .from('activity_reports')
        .update({
          activity_date: formData.get('activity_date'),
          activity_time: formData.get('activity_time'),
          latitude: formData.get('latitude'),
          longitude: formData.get('longitude'),
          observation_type: formData.get('observation_type'),
          status: formData.get('status'),
          is_offline: formData.get('is_offline') === 'true',
          division_id: formData.get('division_id'),
          range_id: formData.get('range_id'),
          beat_id: formData.get('beat_id'),
          compass_bearing: formData.get('compass_bearing'),
          indirect_sighting_type: formData.get('indirect_sighting_type'),
          damage_done: formData.get('damage_done'),
          damage_description: formData.get('damage_description'),
          loss_type: formData.get('loss_type'),
          photo_url: formData.get('photo_url'),
          reporter_mobile: formData.get('reporter_mobile'),
          total_elephants: formData.get('total_elephants'),
          adult_male_count: formData.get('adult_male_count'),
          adult_female_count: formData.get('adult_female_count'),
          unknown_count: formData.get('unknown_count'),
          associated_division: formData.get('associated_division'),
          associated_range: formData.get('associated_range'),
          associated_beat: formData.get('associated_beat'),
          email: formData.get('email')
        })
        .eq('id', editObs.id);

      if (result.error) {
        throw result.error;
      }

      toast.success('Observation updated successfully');
      setEditObs(null);
      fetchObservations();
    } catch (error) {
      toast.error('Failed to update observation');
      console.error('Error updating observation:', error);
    }
  };

  const handleManualSync = async (reportId: string) => {
    setSyncing(reportId);
    try {
      const result = await supabase
        .from('activity_reports')
        .update({ status: 'synced' })
        .eq('id', reportId);

      if (result.error) {
        throw result.error;
      }

      toast.success('Report synced successfully');
      fetchObservations();
    } catch (error) {
      toast.error('Failed to sync report');
      console.error('Error syncing report:', error);
    } finally {
      setSyncing(null);
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

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'synced':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-10">
      <div className="container mx-auto p-2 sm:p-4">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li>
              <button
                className="hover:underline text-green-800 font-medium"
                onClick={() => navigate('/admin')}
              >
                Admin Panel
              </button>
            </li>
            <li>
              <span className="mx-1">/</span>
            </li>
            <li className="text-gray-600">Observations</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Observation & Report Management
        </h1>

        <Card className="border-blue-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">User-Submitted Reports</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setFilters(prev => ({ ...prev, showUnsyncedOnly: !prev.showUnsyncedOnly }))}
                  className={`border-blue-200 hover:bg-blue-50 hover:text-blue-600 ${filters.showUnsyncedOnly ? "bg-red-100" : ""}`}
                >
                  {filters.showUnsyncedOnly ? "Show All" : "Show Unsynced Only"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleExport}
                  className="flex items-center gap-2 border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleBulkDelete}
                  disabled={selectedReports.size === 0}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search by reporter name..."
                value={filters.reporterName}
                onChange={(e) => setFilters(prev => ({ ...prev, reporterName: e.target.value }))}
                className="border-blue-100 focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="flex items-center gap-4 mb-4">
                <DatePicker
                  date={filters.dateRange}
                  setDate={(date: Date | null) => setFilters(prev => ({ ...prev, dateRange: date }))}
                />
              </div>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="border-blue-100 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Rows per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="25">25 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                  <SelectItem value="100">100 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              )}
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedReports.size === observations.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedReports(new Set(observations.map(obs => obs.id)));
                            } else {
                              setSelectedReports(new Set());
                            }
                          }}
                          className="border-blue-200"
                        />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-blue-900"
                        onClick={() => handleSort('created_at')}
                      >
                        Date/Time {sortConfig?.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="text-blue-900">Reporter</TableHead>
                      <TableHead className="text-blue-900">Details</TableHead>
                      <TableHead className="text-blue-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {observations.map(obs => {
                      const isSynced = obs.activity_observation && obs.activity_observation.length > 0;
                      return (
                        <TableRow key={obs.id} className="hover:bg-blue-50/50 transition-colors">
                          <TableCell>
                            <Checkbox
                              checked={selectedReports.has(obs.id)}
                              onCheckedChange={(checked) => {
                                const newSelected = new Set(selectedReports);
                                if (checked) {
                                  newSelected.add(obs.id);
                                } else {
                                  newSelected.delete(obs.id);
                                }
                                setSelectedReports(newSelected);
                              }}
                              className="border-blue-200"
                            />
                          </TableCell>
                          <TableCell>
                            {obs.created_at ? new Date(obs.created_at).toLocaleString() : 'N/A'}
                          </TableCell>
                          <TableCell>{`${obs.users?.first_name || ''} ${obs.users?.last_name || ''}`.trim() || 'Unknown'}</TableCell>
                          <TableCell>
                            {obs.total_elephants && obs.total_elephants > 0 ?
                              `${obs.total_elephants} elephants` :
                              obs.observation_type === 'indirect' ? 'Indirect Sign' : 'Loss Report'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {isSynced ? (
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                                  disabled
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Synced
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleManualSync(obs.id)}
                                  disabled={syncing === obs.id}
                                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600"
                                >
                                  {syncing === obs.id ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4" />
                                      Syncing...
                                    </>
                                  ) : (
                                    <>
                                      <RefreshCw className="w-4 h-4" />
                                      Sync Now
                                    </>
                                  )}
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setViewObs(obs)}
                                className="border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                              >
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setEditObs(obs)}
                                className="border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                              >
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleDelete(obs.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-blue-900">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-blue-900">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Modal */}
        {viewObs && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl border border-blue-100">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">View Report</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-blue-900"><strong>Date:</strong> {viewObs.created_at ? new Date(viewObs.created_at).toLocaleDateString() : 'N/A'}</p>
                  <p className="text-blue-900"><strong>Time:</strong> {viewObs.created_at ? new Date(viewObs.created_at).toLocaleTimeString() : 'N/A'}</p>
                  <p className="text-blue-900"><strong>Reporter:</strong> {`${viewObs.users?.first_name || ''} ${viewObs.users?.last_name || ''}`.trim() || 'Unknown'}</p>
                  {viewObs.reporter_mobile && <p className="text-blue-900"><strong>Contact:</strong> {viewObs.reporter_mobile}</p>}
                  {viewObs.email && <p className="text-blue-900"><strong>Email:</strong> {viewObs.email}</p>}
                  {viewObs.associated_division && <p className="text-blue-900"><strong>Division:</strong> {viewObs.associated_division}</p>}
                  {viewObs.associated_range && <p className="text-blue-900"><strong>Range:</strong> {viewObs.associated_range}</p>}
                  {viewObs.associated_beat && <p className="text-blue-900"><strong>Beat:</strong> {viewObs.associated_beat}</p>}
                </div>
                <div>
                  {viewObs.total_elephants !== undefined && viewObs.total_elephants > 0 && (
                    <p className="text-blue-900">
                      <strong>Total Elephants:</strong> {viewObs.total_elephants}
                    </p>
                  )}
                  {viewObs.damage_done && <p className="text-blue-900"><strong>Damage:</strong> {viewObs.damage_done}</p>}
                  {viewObs.damage_description && <p className="text-blue-900"><strong>Description:</strong> {viewObs.damage_description}</p>}
                  {viewObs.latitude && <p className="text-blue-900"><strong>Latitude:</strong> {viewObs.latitude}</p>}
                  {viewObs.longitude && <p className="text-blue-900"><strong>Longitude:</strong> {viewObs.longitude}</p>}
                  {viewObs.activity_observation?.[0] && (
                    <>
                      <p className="mt-4 font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Observation Details:</p>
                      {viewObs.activity_observation[0].total_elephants > 0 && (
                        <p className="text-blue-900"><strong>Observed Elephants:</strong> {viewObs.activity_observation[0].total_elephants}</p>
                      )}
                      {viewObs.activity_observation[0].adult_male_count > 0 && (
                        <p className="text-blue-900"><strong>Adult Males:</strong> {viewObs.activity_observation[0].adult_male_count}</p>
                      )}
                      {viewObs.activity_observation[0].adult_female_count > 0 && (
                        <p className="text-blue-900"><strong>Adult Females:</strong> {viewObs.activity_observation[0].adult_female_count}</p>
                      )}
                      {viewObs.activity_observation[0].sub_adult_male_count > 0 && (
                        <p className="text-blue-900"><strong>Sub-adult Males:</strong> {viewObs.activity_observation[0].sub_adult_male_count}</p>
                      )}
                      {viewObs.activity_observation[0].sub_adult_female_count > 0 && (
                        <p className="text-blue-900"><strong>Sub-adult Females:</strong> {viewObs.activity_observation[0].sub_adult_female_count}</p>
                      )}
                      {viewObs.activity_observation[0].calf_count > 0 && (
                        <p className="text-blue-900"><strong>Calves:</strong> {viewObs.activity_observation[0].calf_count}</p>
                      )}
                      {viewObs.activity_observation[0].damage_done && (
                        <p className="text-blue-900"><strong>Observed Damage:</strong> {viewObs.activity_observation[0].damage_done}</p>
                      )}
                      {viewObs.activity_observation[0].damage_description && (
                        <p className="text-blue-900"><strong>Damage Description:</strong> {viewObs.activity_observation[0].damage_description}</p>
                      )}
                      {viewObs.activity_observation[0].created_at && (
                        <p className="text-blue-900"><strong>Observation Date:</strong> {new Date(viewObs.activity_observation[0].created_at).toLocaleString()}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setViewObs(null)}
                  className="border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editObs && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
              <h2 className="text-xl font-bold mb-4">Edit Observation</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                if (form instanceof HTMLFormElement) {
                  const formData = new FormData(form);
                  handleEdit(formData);
                }
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="activity_date">Date</Label>
                    <DatePicker
                      date={activityDate}
                      setDate={setActivityDate}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="activity_time">Time</Label>
                    <Input 
                      name="activity_time" 
                      type="time" 
                      defaultValue={editObs.activity_date.toISOString().split('T')[1]}
                      className="border-blue-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="observation_type">Observation Type</Label>
                    <Select
                      value={editObs.observation_type}
                      onValueChange={(value) => {
                        const newObservationType = value as ObservationType;
                        handleEdit(new FormData(new Map([
                          ['activity_date', editObs.activity_date.toISOString()],
                          ['activity_time', editObs.activity_date.toISOString().split('T')[1]],
                          ['observation_type', newObservationType],
                          ['latitude', editObs.latitude],
                          ['longitude', editObs.longitude]
                        ])));
                      }}
                    >
                      <SelectTrigger className="border-blue-100 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select observation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct">Direct</SelectItem>
                        <SelectItem value="indirect">Indirect</SelectItem>
                        <SelectItem value="loss">Loss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input 
                      name="latitude" 
                      type="text" 
                      defaultValue={editObs.latitude}
                      className="border-blue-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input 
                      name="longitude" 
                      type="text" 
                      defaultValue={editObs.longitude}
                      className="border-blue-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditObs(null)}
                    className="border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-sm"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}