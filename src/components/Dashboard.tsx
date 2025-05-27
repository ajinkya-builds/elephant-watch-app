import React, { useState, useEffect } from 'react';
import { BeatMap } from './BeatMap';
import { supabase } from '@/lib/supabaseClient';
import { RefreshCw, MapPin, Users, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FilterOption {
  id: string;
  name: string;
}

interface DashboardStats {
  totalDivisions: number;
  totalRanges: number;
  totalBeats: number;
  totalObservations: number;
}

export function Dashboard() {
  const [divisions, setDivisions] = useState<FilterOption[]>([]);
  const [ranges, setRanges] = useState<FilterOption[]>([]);
  const [beats, setBeats] = useState<FilterOption[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<string>('');
  const [selectedBeat, setSelectedBeat] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalDivisions: 0,
    totalRanges: 0,
    totalBeats: 0,
    totalObservations: 0
  });

  // Fetch dashboard statistics
  useEffect(() => {
    async function fetchStats() {
      const { data: divisionsCount } = await supabase
        .from('divisions')
        .select('id', { count: 'exact' });
      
      const { data: rangesCount } = await supabase
        .from('ranges')
        .select('id', { count: 'exact' });
      
      const { data: beatsCount } = await supabase
        .from('beats')
        .select('id', { count: 'exact' });
      
      const { data: observationsCount } = await supabase
        .from('observations')
        .select('id', { count: 'exact' });

      setStats({
        totalDivisions: divisionsCount?.length || 0,
        totalRanges: rangesCount?.length || 0,
        totalBeats: beatsCount?.length || 0,
        totalObservations: observationsCount?.length || 0
      });
    }

    fetchStats();
  }, []);

  // Fetch all divisions
  useEffect(() => {
    async function fetchDivisions() {
      setLoading(true);
      const { data, error } = await supabase
        .from('divisions')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching divisions:', error);
        return;
      }
      
      console.log('Fetched divisions:', data);
      setDivisions(data || []);
      setLoading(false);
    }
    
    fetchDivisions();
  }, []);

  // Fetch ranges for selected division
  useEffect(() => {
    async function fetchRanges() {
      if (!selectedDivision) {
        setRanges([]);
        setBeats([]);
        setSelectedRange('');
        setSelectedBeat('');
        return;
      }

      setLoading(true);
      console.log('Fetching ranges for division:', selectedDivision);
      
      const { data, error } = await supabase
        .from('ranges')
        .select(`
          id,
          name,
          associated_division_id
        `)
        .eq('associated_division_id', selectedDivision)
        .order('name');
      
      if (error) {
        console.error('Error fetching ranges:', error);
        return;
      }
      
      console.log('Fetched ranges for division:', selectedDivision, data);
      setRanges(data || []);
      setBeats([]);
      setSelectedRange('');
      setSelectedBeat('');
      setLoading(false);
    }
    
    fetchRanges();
  }, [selectedDivision]);

  // Fetch beats for selected range
  useEffect(() => {
    async function fetchBeats() {
      if (!selectedRange || !selectedDivision) {
        setBeats([]);
        setSelectedBeat('');
        return;
      }

      setLoading(true);
      console.log('Fetching beats for range:', selectedRange, 'and division:', selectedDivision);
      
      // First, let's check if we can get any beats at all
      const { data: allBeats, error: allBeatsError } = await supabase
        .from('beats')
        .select('*')
        .limit(5);
      
      console.log('Sample of all beats:', allBeats);

      // Now fetch beats for the selected range and division
      const { data, error } = await supabase
        .from('beats')
        .select(`
          id,
          name,
          associated_range_id,
          associated_division_id
        `)
        .eq('associated_range_id', selectedRange)
        .eq('associated_division_id', selectedDivision)
        .order('name');
      
      if (error) {
        console.error('Error fetching beats:', error);
        return;
      }
      
      console.log('Fetched beats for range:', selectedRange, 'and division:', selectedDivision, data);
      setBeats(data || []);
      setSelectedBeat('');
      setLoading(false);
    }
    
    fetchBeats();
  }, [selectedRange, selectedDivision]);

  // Handle division selection
  const handleDivisionChange = (divisionId: string) => {
    console.log('Selected division:', divisionId);
    setSelectedDivision(divisionId);
    setSelectedRange('');
    setSelectedBeat('');
  };

  // Handle range selection
  const handleRangeChange = (rangeId: string) => {
    console.log('Selected range:', rangeId);
    setSelectedRange(rangeId);
    setSelectedBeat('');
  };

  // Handle beat selection
  const handleBeatChange = (beatId: string) => {
    console.log('Selected beat:', beatId);
    setSelectedBeat(beatId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh all data
      await Promise.all([
        fetchDivisions(),
        fetchRanges(),
        fetchBeats(),
        fetchStats()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forest Beat Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and analyze forest beat activities</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-10 w-10 mt-4 md:mt-0"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Divisions</CardTitle>
            <MapPin className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalDivisions}</div>
            <p className="text-xs text-gray-500 mt-1">Administrative divisions</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Ranges</CardTitle>
            <MapPin className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalRanges}</div>
            <p className="text-xs text-gray-500 mt-1">Forest ranges</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Beats</CardTitle>
            <MapPin className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalBeats}</div>
            <p className="text-xs text-gray-500 mt-1">Forest beats</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Observations</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalObservations}</div>
            <p className="text-xs text-gray-500 mt-1">Recorded observations</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Area Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Division</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedDivision}
                onChange={(e) => handleDivisionChange(e.target.value)}
                disabled={loading}
              >
                <option value="">Select Division</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Range</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedRange}
                onChange={(e) => handleRangeChange(e.target.value)}
                disabled={!selectedDivision || loading}
              >
                <option value="">Select Range</option>
                {ranges.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Beat</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedBeat}
                onChange={(e) => handleBeatChange(e.target.value)}
                disabled={!selectedRange || loading}
              >
                <option value="">Select Beat</option>
                {beats.map((beat) => (
                  <option key={beat.id} value={beat.id}>
                    {beat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Geographic View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] w-full rounded-lg overflow-hidden">
            <BeatMap
              selectedBeat={selectedBeat}
              selectedRange={selectedRange}
              selectedDivision={selectedDivision}
            />
          </div>
          {/* Map Legend */}
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-[#2563eb] bg-opacity-10 border border-[#2563eb] mr-2"></div>
              <span>Division</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-[#16a34a] bg-opacity-20 border border-[#16a34a] mr-2"></div>
              <span>Range</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-[#dc2626] bg-opacity-30 border border-[#dc2626] mr-2"></div>
              <span>Beat</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 