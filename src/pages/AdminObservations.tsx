import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabaseClient";
import { ActivityReport } from "@/lib/observations";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight, Download, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Breadcrumb } from "@/components/ui/breadcrumb";

// All user_id references in this file must be public.users.id, not the auth UID. If setting user_id, look up by auth_id.

export default function AdminObservations() {
  const [observations, setObservations] = useState<ActivityReport[]>([]);
  const [viewObs, setViewObs] = useState<ActivityReport | null>(null);
  const [editObs, setEditObs] = useState<ActivityReport | null>(null);
  const [selectedReports, setSelectedReports] = useState<Set<number>>(new Set());
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchObservations();
  }, [currentPage, pageSize, filters, sortConfig]);

  const fetchObservations = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('activity_reports')
        .select(`
          *,
          users (
            first_name,
            last_name
          ),
          activity_observation (
            id
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.reporterName) {
        query = query.or(`users.first_name.ilike.%${filters.reporterName}%,users.last_name.ilike.%${filters.reporterName}%`);
      }
      if (filters.dateRange) {
        query = query.gte('created_at', filters.dateRange.toISOString());
      }

      // Apply sorting
      if (sortConfig) {
        query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      query = query.range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      const { data: reports, error: reportsError, count } = await query;

      if (reportsError) {
        console.error('Query error:', reportsError);
        throw reportsError;
      }

      // If we need to check for unsynced reports, fetch the observations separately
      if (filters.showUnsyncedOnly && reports) {
        const { data: observations } = await supabase
          .from('activity_observation')
          .select('activity_report_id')
          .in('activity_report_id', reports.map(r => r.id));

        const syncedReportIds = new Set(observations?.map(o => o.activity_report_id) || []);
        const filteredReports = reports.filter(r => !syncedReportIds.has(r.id));
        
        setObservations(filteredReports);
        setTotalRecords(filteredReports.length);
        setTotalPages(Math.ceil(filteredReports.length / pageSize));
      } else {
        setObservations(reports || []);
        setTotalRecords(count || 0);
        setTotalPages(Math.ceil((count || 0) / pageSize));
      }
    } catch (error) {
      console.error('Error fetching observations:', error);
      toast.error('Failed to fetch observations');
    } finally {
      setIsLoading(false);
    }
  };

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

      const csvContent = [
        headers.join(','),
        ...data.map(obs => [
          new Date(obs.created_at).toLocaleString(),
          obs.division_name,
          obs.range_name,
          obs.beat_name,
          obs.total_elephants,
          obs.damage_done,
          obs.users?.full_name,
          obs.email,
          obs.reporter_mobile
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

  const handleDelete = async (id: number) => {
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

  const handleEdit = async (id: number, formData: Partial<ActivityReport>) => {
    try {
      const { error } = await supabase
        .from('activity_reports')
        .update(formData)
        .eq('id', id);

      if (error) throw error;
      
      setObservations(observations.map(obs => 
        obs.id === id ? { ...obs, ...formData } : obs
      ));
      
      setEditObs(null);
      toast.success('Report updated successfully');
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
    }
  };

  const handleManualSync = async (reportId: string) => {
    try {
      setSyncing(reportId);
      
      // First check if observation already exists
      const { data: existingObs, error: checkError } = await supabase
        .from('activity_observation')
        .select('*')
        .eq('activity_report_id', reportId);

      if (checkError) {
        console.error('Error checking existing observation:', checkError);
        throw checkError;
      }

      if (existingObs && existingObs.length > 0) {
        toast.success('Report already synced');
        await fetchObservations();
        return;
      }

      // Process the report
      const { data: result, error: processError } = await supabase.rpc('process_new_activity_reports', { 
        p_report_id: reportId 
      });

      if (processError) {
        console.error('Error processing report:', processError);
        throw processError;
      }

      if (!result) {
        throw new Error('No response from server');
      }

      if (result.status === 'error') {
        console.error('Processing error:', result.error, result.detail);
        throw new Error(result.error || result.message || 'Failed to process report');
      }

      if (result.status !== 'success') {
        throw new Error(result.message || 'Unexpected response from server');
      }

      // Verify the observation was created
      const { data: newObs, error: verifyError } = await supabase
        .from('activity_observation')
        .select('*')
        .eq('activity_report_id', reportId);

      if (verifyError) {
        console.error('Error verifying observation:', verifyError);
        throw verifyError;
      }

      if (!newObs || newObs.length === 0) {
        throw new Error('Failed to verify observation creation');
      }

      toast.success(result.message || 'Report synced successfully');
      await fetchObservations();
    } catch (error: any) {
      console.error('Error syncing report:', error);
      toast.error(error.message || 'Failed to sync report');
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <Breadcrumb
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Observation & Report Management" }
          ]}
        />

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
              <DatePicker
                selected={filters.dateRange}
                onChange={(date) => setFilters(prev => ({ ...prev, dateRange: date }))}
                placeholderText="Filter by date..."
                className="border-blue-100 focus:border-blue-500 focus:ring-blue-500"
              />
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
                          <TableCell>{new Date(obs.created_at).toLocaleString()}</TableCell>
                          <TableCell>{`${obs.users?.first_name || ''} ${obs.users?.last_name || ''}`.trim() || 'Unknown'}</TableCell>
                          <TableCell>
                            {obs.total_elephants > 0 ? 
                              `${obs.total_elephants} elephants` : 
                              obs.damage_description || 'No details'}
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
                  <p className="text-blue-900"><strong>Date:</strong> {new Date(viewObs.created_at).toLocaleDateString()}</p>
                  <p className="text-blue-900"><strong>Time:</strong> {new Date(viewObs.created_at).toLocaleTimeString()}</p>
                  <p className="text-blue-900"><strong>Reporter:</strong> {`${viewObs.users?.first_name || ''} ${viewObs.users?.last_name || ''}`.trim() || 'Unknown'}</p>
                  {viewObs.reporter_mobile && <p className="text-blue-900"><strong>Contact:</strong> {viewObs.reporter_mobile}</p>}
                  {viewObs.email && <p className="text-blue-900"><strong>Email:</strong> {viewObs.email}</p>}
                  {viewObs.associated_division && <p className="text-blue-900"><strong>Division:</strong> {viewObs.associated_division}</p>}
                  {viewObs.associated_range && <p className="text-blue-900"><strong>Range:</strong> {viewObs.associated_range}</p>}
                  {viewObs.associated_beat && <p className="text-blue-900"><strong>Beat:</strong> {viewObs.associated_beat}</p>}
                </div>
                <div>
                  {viewObs.total_elephants > 0 && <p className="text-blue-900"><strong>Total Elephants:</strong> {viewObs.total_elephants}</p>}
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl border border-blue-100">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Edit Report</h2>
              <form 
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleEdit(editObs.id, {
                    total_elephants: parseInt(formData.get('total_elephants') as string),
                    damage_done: formData.get('damage_done') as string,
                    damage_description: formData.get('damage_description') as string,
                  });
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-900">Total Elephants</label>
                    <Input 
                      name="total_elephants" 
                      type="number" 
                      defaultValue={editObs.total_elephants}
                      className="border-blue-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-900">Damage Done</label>
                    <Input 
                      name="damage_done" 
                      defaultValue={editObs.damage_done}
                      className="border-blue-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1 text-blue-900">Description</label>
                    <Input 
                      name="damage_description" 
                      defaultValue={editObs.damage_description || ''}
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