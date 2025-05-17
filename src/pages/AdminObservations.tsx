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
import { Loader2, ChevronLeft, ChevronRight, Download } from "lucide-react";

export default function AdminObservations() {
  const [observations, setObservations] = useState<ActivityReport[]>([]);
  const [viewObs, setViewObs] = useState<ActivityReport | null>(null);
  const [editObs, setEditObs] = useState<ActivityReport | null>(null);
  const [selectedReports, setSelectedReports] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState({
    division: "all",
    dateRange: "",
    search: "",
    email: ""
  });
  const [sortConfig, setSortConfig] = useState<{ key: keyof ActivityReport; direction: 'asc' | 'desc' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchObservations();
  }, [currentPage, pageSize, filters, sortConfig]);

  const fetchObservations = async () => {
    try {
      setIsLoading(true);
      
      // First, get total count
      const { count, error: countError } = await supabase
        .from('activity_reports')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalRecords(count || 0);
      setTotalPages(Math.ceil((count || 0) / pageSize));

      // Then fetch paginated data
      let query = supabase
        .from('activity_reports')
        .select('*')
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      // Apply sorting
      if (sortConfig) {
        query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setObservations(data || []);
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
          obs.reporter_name,
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

  const filteredAndSortedObservations = observations
    .filter(obs => {
      const matchesDivision = filters.division === "all" || obs.division_name === filters.division;
      const matchesSearch = !filters.search || 
        Object.values(obs).some(value => 
          String(value).toLowerCase().includes(filters.search.toLowerCase())
        );
      const matchesEmail = !filters.email || 
        obs.email.toLowerCase().includes(filters.email.toLowerCase());
      return matchesDivision && matchesSearch && matchesEmail;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
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
            <li><span className="mx-1">/</span></li>
            <li className="text-gray-600">Observation & Report Management</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-green-800 mb-8 text-center">
          Observation & Report Management
        </h1>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-xl">User-Submitted Reports</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleExport}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleBulkDelete}
                  disabled={selectedReports.size === 0}
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search reports..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
              <Input
                placeholder="Filter by email..."
                value={filters.email}
                onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
              />
              <Select
                value={filters.division}
                onValueChange={(value) => setFilters(prev => ({ ...prev, division: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Divisions</SelectItem>
                  {Array.from(new Set(observations.map(obs => obs.division_name))).map(division => (
                    <SelectItem key={division} value={division}>{division}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger>
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
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-green-800" />
                </div>
              )}
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedReports.size === filteredAndSortedObservations.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedReports(new Set(filteredAndSortedObservations.map(obs => obs.id)));
                            } else {
                              setSelectedReports(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('created_at')}
                      >
                        Date/Time {sortConfig?.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('division_name')}
                      >
                        Division {sortConfig?.key === 'division_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('email')}
                      >
                        Email {sortConfig?.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedObservations.map(obs => (
                      <TableRow key={obs.id}>
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
                          />
                        </TableCell>
                        <TableCell>{new Date(obs.created_at).toLocaleString()}</TableCell>
                        <TableCell>{obs.division_name}</TableCell>
                        <TableCell>{obs.email}</TableCell>
                        <TableCell>{obs.reporter_name}</TableCell>
                        <TableCell>
                          {obs.total_elephants > 0 ? 
                            `${obs.total_elephants} elephants` : 
                            obs.damage_description || 'No details'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setViewObs(obs)}>
                              View
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditObs(obs)}>
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDelete(obs.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
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
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">View Report</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Date:</strong> {new Date(viewObs.created_at).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {new Date(viewObs.created_at).toLocaleTimeString()}</p>
                  <p><strong>Division:</strong> {viewObs.division_name}</p>
                  <p><strong>Range:</strong> {viewObs.range_name}</p>
                  <p><strong>Beat:</strong> {viewObs.beat_name}</p>
                </div>
                <div>
                  <p><strong>Reporter:</strong> {viewObs.reporter_name}</p>
                  <p><strong>Contact:</strong> {viewObs.reporter_mobile}</p>
                  <p><strong>Total Elephants:</strong> {viewObs.total_elephants}</p>
                  <p><strong>Damage:</strong> {viewObs.damage_done}</p>
                  <p><strong>Description:</strong> {viewObs.damage_description}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setViewObs(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editObs && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Edit Report</h2>
              <form 
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleEdit(editObs.id, {
                    division_name: formData.get('division_name') as string,
                    range_name: formData.get('range_name') as string,
                    beat_name: formData.get('beat_name') as string,
                    total_elephants: parseInt(formData.get('total_elephants') as string),
                    damage_done: formData.get('damage_done') as string,
                    damage_description: formData.get('damage_description') as string,
                  });
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Division</label>
                    <Input name="division_name" defaultValue={editObs.division_name} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Range</label>
                    <Input name="range_name" defaultValue={editObs.range_name} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Beat</label>
                    <Input name="beat_name" defaultValue={editObs.beat_name} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Elephants</label>
                    <Input name="total_elephants" type="number" defaultValue={editObs.total_elephants} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Damage Done</label>
                    <Input name="damage_done" defaultValue={editObs.damage_done} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input name="damage_description" defaultValue={editObs.damage_description || ''} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditObs(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">
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