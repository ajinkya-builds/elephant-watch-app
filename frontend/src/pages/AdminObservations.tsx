import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Loader2, Pencil, Trash2, PlusCircle, X, RefreshCw } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

type ObservationType = 'direct' | 'indirect' | 'loss';
type ReportStatus = 'draft' | 'submitted' | 'synced' | 'error';

interface ReportToUser {
  id: string;
  name: string;
  email: string;
}

interface ActivityObservation {
  id: string;
  activity_report_id: string;
  observation_type: 'direct' | 'indirect' | 'loss';
  direct_sighting_type?: string;
  indirect_sighting_type?: string;
  damage_done: string;
  damage_description?: string;
  compass_bearing?: number;
  created_at: string;
  updated_at: string;
  total_elephants: number;
  adult_male_count: number;
  adult_female_count: number;
  unknown_count: number;
  calf_count: number;
  sub_adult_male_count: number;
  sub_adult_female_count: number;
  report_to_users?: ReportToUser[];
}

interface Observation {
  id: string;
  user_id: string;
  activity_date: string;
  activity_time: string;
  latitude: number;
  longitude: number;
  observation_type: 'direct' | 'indirect' | 'loss';
  status: 'draft' | 'submitted' | 'synced' | 'error';
  is_offline: boolean;
  damage_done: boolean;
  damage_description?: string;
  created_at: Date;
  updated_at: Date;
  total_elephants: number;
  reporter_mobile: string;
  email: string;
  compass_bearing?: number;
  indirect_sighting_type?: string;
  activity_observation?: ActivityObservation[];
  associated_division: string;
  associated_range: string;
  associated_beat: string;
}



const AdminObservations = () => {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [editingObservation, setEditingObservation] = useState<Partial<Observation> & { id?: string } | null>(null);

  // Fetch observations on component mount and when currentPage changes
  useEffect(() => {
    fetchObservations();
  }, [currentPage]);

  const fetchObservations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error, count } = await supabase
        .from('activity_reports')
        .select(`
          *,
          activity_observation (
            *
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log('Fetched observations with report_to_users:', JSON.stringify(data, null, 2));
        const formattedData = data.map((item: any): Observation => {
          const createdDate = item.created_at ? new Date(item.created_at) : new Date();
          const updatedDate = item.updated_at ? new Date(item.updated_at) : new Date();
          
          return {
            id: item.id || '',
            created_at: createdDate,
            updated_at: updatedDate,
            user_id: item.user_id || '',
            activity_date: item.activity_date || createdDate.toISOString().split('T')[0],
            activity_time: item.activity_time || createdDate.toTimeString().split(' ')[0],
            latitude: Number(item.latitude) || 0,
            longitude: Number(item.longitude) || 0,
            observation_type: (item.observation_type as ObservationType) || 'direct',
            status: (item.status as ReportStatus) || 'submitted',
            is_offline: Boolean(item.is_offline),
            total_elephants: Number(item.total_elephants) || 0,
            damage_done: item.damage_done || false,
            damage_description: item.damage_description || '',
            reporter_mobile: item.reporter_mobile || '',
            email: item.email || '',
            associated_division: item.associated_division || '',
            associated_range: item.associated_range || '',
            associated_beat: item.associated_beat || '',
            compass_bearing: item.compass_bearing,
            indirect_sighting_type: item.indirect_sighting_type,
            activity_observation: item.activity_observation || []
          };
        });
        
        setObservations(formattedData);
        setTotalRecords(count || 0);
        setTotalPages(Math.ceil((count || 1) / pageSize));
      }
    } catch (err) {
      console.error('Error fetching observations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch observations';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('activity_reports')
        .update({ status: 'synced' })
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchObservations();
      toast.success('Report synced successfully');
    } catch (error) {
      console.error('Error syncing report:', error);
      setError('Failed to sync report');
      toast.error('Failed to sync report');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('activity_reports')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchObservations();
      toast.success('Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Failed to delete report');
      toast.error('Failed to delete report');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReports.length === 0) return;
    
    if (!confirm('Are you sure you want to delete the selected reports?')) {
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('activity_reports')
        .delete()
        .in('id', selectedReports);
      
      if (error) throw error;
      
      setSelectedReports([]);
      await fetchObservations();
      toast.success('Selected reports deleted successfully');
    } catch (error) {
      console.error('Error deleting reports:', error);
      setError('Failed to delete selected reports');
      toast.error('Failed to delete selected reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const csvContent = [
        ['ID', 'Date', 'Status', 'Type', 'Elephants', 'Damage', 'Reporter', 'Email', 'Mobile'].join(','),
        ...(data || []).map(obs => {
          const createdDate = obs.created_at || new Date();
          return [
            `"${obs.id || ''}"`,
            `"${createdDate.toLocaleString()}"`,
            `"${obs.status || ''}"`,
            `"${obs.observation_type || ''}"`,
            `"${obs.total_elephants || 0}"`,
            `"${obs.damage_done ? 'Yes' : 'No'}"`,
            `"${obs.reporter_name || 'N/A'}"`,
            `"${obs.email || ''}"`,
            `"${obs.reporter_mobile || ''}"`
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `observations_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data');
      toast.error('Failed to export data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingObservation || !editingObservation.id) return;
    
    try {
      setLoading(true);
      const formData = new FormData(e.target as HTMLFormElement);
      
      const observationData: Partial<Observation> = {
        activity_date: formData.get('activity_date') as string || '',
        activity_time: formData.get('activity_time') as string || '',
        latitude: Number(formData.get('latitude')) || 0,
        longitude: Number(formData.get('longitude')) || 0,
        observation_type: formData.get('observation_type') as ObservationType || 'direct',
        status: formData.get('status') as ReportStatus || 'submitted',
        is_offline: formData.get('is_offline') === 'true',
        reporter_mobile: formData.get('reporter_mobile') as string || '',
        email: formData.get('email') as string || '',
        total_elephants: Number(formData.get('total_elephants')) || 0,
        damage_done: formData.get('damage_done') === 'true',
        damage_description: formData.get('damage_description') as string || '',
        associated_division: formData.get('associated_division') as string || '',
        associated_range: formData.get('associated_range') as string || '',
        associated_beat: formData.get('associated_beat') as string || ''
      };
      
      const { error } = await supabase
        .from('activity_reports')
        .update(observationData)
        .eq('id', editingObservation.id);
      
      if (error) throw error;
      
      setEditingObservation(null);
      await fetchObservations();
      toast.success('Report updated successfully');
    } catch (error) {
      console.error('Error saving report:', error);
      setError('Failed to save report');
      toast.error('Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Observations</CardTitle>
            <Button onClick={() => setEditingObservation({})}>
              <PlusCircle className="w-4 h-4 mr-2" /> Add Observation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    disabled={loading}
                  >
                    Export
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={handleBulkDelete}
                  disabled={selectedReports.length === 0 || loading}
                >
                  Delete Selected
                </Button>
              </div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Beat</TableHead>
                      <TableHead>Range</TableHead>
                      <TableHead>Division</TableHead>
                      <TableHead>Reported To</TableHead>
                      <TableHead>Sighting Details</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {observations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No observations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      observations.map((obs) => (
                        <TableRow key={obs.id}>
                          <TableCell>{new Date(obs.activity_date).toLocaleDateString()}</TableCell>
                          <TableCell className="capitalize">{obs.observation_type}</TableCell>
                          <TableCell>{obs.associated_beat || 'N/A'}</TableCell>
                          <TableCell>{obs.associated_range || 'N/A'}</TableCell>
                          <TableCell>{obs.associated_division || 'N/A'}</TableCell>
                          <TableCell>
                            {(() => {
                              try {
                                const reportToUsers = obs.activity_observation?.[0]?.report_to_users;
                                console.log('Report to users for observation', obs.id, ':', reportToUsers);
                                
                                // Handle case where report_to_users is null/undefined
                                if (!reportToUsers) {
                                  return 'N/A';
                                }
                                
                                // Handle case where report_to_users is an object with user data
                                if (typeof reportToUsers === 'object' && !Array.isArray(reportToUsers)) {
                                  // If it has a 'name' property, use it directly
                                  if ('name' in reportToUsers && typeof reportToUsers.name === 'string') {
                                    return reportToUsers.name;
                                  }
                                  
                                  // Otherwise, try to get values and join them
                                  const users = Object.values(reportToUsers).filter(
                                    (value): value is { name: string } => 
                                      value !== null && 
                                      typeof value === 'object' && 
                                      'name' in value && 
                                      typeof value.name === 'string'
                                  );
                                  
                                  const names = users.map(user => user.name);
                                  return names.length > 0 ? names.join(', ') : 'N/A';
                                }
                                
                                // Handle case where it's an array (for backward compatibility)
                                if (Array.isArray(reportToUsers)) {
                                  const names = reportToUsers
                                    .filter((user): user is ReportToUser => 
                                      user && 
                                      typeof user === 'object' && 
                                      'name' in user && 
                                      typeof user.name === 'string'
                                    )
                                    .map(user => user.name);
                                  return names.length > 0 ? names.join(', ') : 'N/A';
                                }
                                
                                return 'N/A';
                              } catch (error) {
                                console.error('Error processing report_to_users:', error);
                                return 'Error';
                              }
                            })()}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {obs.observation_type === 'direct' && (
                                <>
                                  <div><span className="font-medium">Total Elephants:</span> {obs.activity_observation?.[0]?.total_elephants || obs.total_elephants || 0}</div>
                                  <div><span className="font-medium">Adults:</span> 
                                    {(obs.activity_observation?.[0]?.adult_male_count || 0) + 
                                     (obs.activity_observation?.[0]?.adult_female_count || 0) || 'N/A'}
                                  </div>
                                  <div><span className="font-medium">Calves:</span> {obs.activity_observation?.[0]?.calf_count || 'N/A'}</div>
                                </>
                              )}
                              {obs.observation_type === 'indirect' && (
                                <>
                                  <div><span className="font-medium">Sign Type:</span> {obs.indirect_sighting_type || obs.activity_observation?.[0]?.indirect_sighting_type || 'N/A'}</div>
                                  {obs.activity_observation?.[0]?.damage_done && (
                                    <div><span className="font-medium">Damage:</span> {obs.activity_observation[0].damage_done}</div>
                                  )}
                                </>
                              )}
                              {obs.observation_type === 'loss' && (
                                <>
                                  <div><span className="font-medium">Damage Type:</span> 
                                    {obs.activity_observation?.[0]?.damage_done || 
                                     (obs.damage_done ? 'Yes' : 'No')}
                                  </div>
                                  <div className="truncate max-w-xs">
                                    <span className="font-medium">Details:</span> 
                                    {obs.activity_observation?.[0]?.damage_description || 
                                     obs.damage_description || 
                                     'No details provided'}
                                  </div>
                                </>
                              )}
                              {(obs.compass_bearing || obs.activity_observation?.[0]?.compass_bearing) && (
                                <div className="mt-1">
                                  <span className="font-medium">Heading:</span> {obs.compass_bearing || obs.activity_observation?.[0]?.compass_bearing}°
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingObservation(obs)}
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(obs.id)}
                              disabled={loading}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSync(obs.id)}
                              disabled={loading}
                              title="Sync"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Showing {Math.min((currentPage - 1) * pageSize + 1, totalRecords)} to{' '}
                    {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || loading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {editingObservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Edit Observation</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingObservation(null)}
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="activity_date">Activity Date</Label>
                    <Input
                      type="date"
                      name="activity_date"
                      value={editingObservation.activity_date || ''}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="total_elephants">Total Elephants</Label>
                    <Input
                      type="number"
                      name="total_elephants"
                      value={editingObservation.total_elephants || 0}
                      onChange={(e) => setEditingObservation({ ...editingObservation, total_elephants: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="damage_done">Damage Done</Label>
                    <Input
                      type="checkbox"
                      name="damage_done"
                      checked={!!editingObservation.damage_done}
                      onChange={(e) => setEditingObservation({ ...editingObservation, damage_done: e.target.checked })}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="is_offline">Is Offline</Label>
                    <Input
                      type="checkbox"
                      name="is_offline"
                      checked={!!editingObservation.is_offline}
                      onChange={(e) => setEditingObservation({ ...editingObservation, is_offline: e.target.checked })}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setEditingObservation(null)}
                  className="border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminObservations;