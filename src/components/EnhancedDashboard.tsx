import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/supabaseClient';
import { BeatMap } from './BeatMap';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DashboardFilters {
  division?: string;
  range?: string;
  beat?: string;
  startDate?: string;
  endDate?: string;
  timeRange?: string;
}

interface FilterOption {
  id: string;
  name: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const EnhancedDashboard: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    timeRange: '7d'
  });
  const [loading, setLoading] = useState(true);
  const [divisions, setDivisions] = useState<FilterOption[]>([]);
  const [ranges, setRanges] = useState<FilterOption[]>([]);
  const [beats, setBeats] = useState<FilterOption[]>([]);
  const [data, setData] = useState<any>({
    populationTrends: [],
    activityByTime: [],
    activityBySeason: [],
    activityByLandType: [],
    activityByDivision: [],
    activityByRange: [],
    activityByBeat: [],
    timeline: [],
    heatmap: [],
    summary: [],
    observationsByType: [],
    lossReports: []
  });

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
      
      setDivisions(data || []);
      setLoading(false);
    }
    
    fetchDivisions();
  }, []);

  // Fetch ranges for selected division
  useEffect(() => {
    async function fetchRanges() {
      if (!filters.division) {
        setRanges([]);
        setBeats([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('ranges')
        .select(`
          id,
          name,
          division_id
        `)
        .eq('division_id', filters.division)
        .order('name');
      
      if (error) {
        console.error('Error fetching ranges:', error);
        return;
      }
      
      setRanges(data || []);
      setBeats([]);
      setLoading(false);
    }
    
    fetchRanges();
  }, [filters.division]);

  // Fetch beats for selected range
  useEffect(() => {
    async function fetchBeats() {
      if (!filters.range || !filters.division) {
        setBeats([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('beats')
        .select(`
          id,
          name,
          range_id,
          division_id
        `)
        .eq('range_id', filters.range)
        .eq('division_id', filters.division)
        .order('name');
      
      if (error) {
        console.error('Error fetching beats:', error);
        return;
      }
      
      setBeats(data || []);
      setLoading(false);
    }
    
    fetchBeats();
  }, [filters.range, filters.division]);

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch population trends
      const { data: populationTrends } = await supabase
        .from('v_elephant_population_trends')
        .select('*')
        .order('month', { ascending: false })
        .limit(12);

      // Fetch activity by time
      const { data: activityByTime } = await supabase
        .from('v_elephant_activity_by_time')
        .select('*')
        .order('hour_of_day');

      // Fetch activity by season
      const { data: activityBySeason } = await supabase
        .from('v_elephant_activity_by_season')
        .select('*')
        .order('month');

      // Fetch activity by land type
      const { data: activityByLandType } = await supabase
        .from('v_elephant_activity_by_land_type')
        .select('*');

      // Fetch activity by division
      const { data: activityByDivision } = await supabase
        .from('v_elephant_activity_by_division')
        .select('*');

      // Fetch activity by range
      const { data: activityByRange } = await supabase
        .from('v_elephant_activity_by_range')
        .select('*');

      // Fetch activity by beat
      const { data: activityByBeat } = await supabase
        .from('v_elephant_activity_by_beat')
        .select('*');

      // Fetch timeline
      const { data: timeline } = await supabase
        .from('v_elephant_activity_timeline')
        .select('*')
        .order('activity_date', { ascending: false })
        .limit(50);

      // Fetch heatmap data
      const { data: heatmap } = await supabase
        .from('v_elephant_activity_heatmap')
        .select('*');

      // Fetch summary
      const { data: summary } = await supabase
        .from('v_elephant_activity_summary')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      // Fetch observations by type
      const { data: observationsByType } = await supabase
        .from('v_elephant_activity_observations_by_type')
        .select('*');

      // Fetch loss reports
      const { data: lossReports } = await supabase
        .from('v_elephant_activity_loss_reports')
        .select('*');

      setData({
        populationTrends,
        activityByTime,
        activityBySeason,
        activityByLandType,
        activityByDivision,
        activityByRange,
        activityByBeat,
        timeline,
        heatmap,
        summary,
        observationsByType,
        lossReports
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg shadow">
        <div className="relative z-[100]">
          <Select
            value={filters.division}
            onValueChange={(value) => handleFilterChange('division', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Division" />
            </SelectTrigger>
            <SelectContent className="z-[100]">
              {divisions.map((division) => (
                <SelectItem key={division.id} value={division.id}>
                  {division.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative z-[100]">
          <Select
            value={filters.range}
            onValueChange={(value) => handleFilterChange('range', value)}
            disabled={!filters.division}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent className="z-[100]">
              {ranges.map((range) => (
                <SelectItem key={range.id} value={range.id}>
                  {range.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative z-[100]">
          <Select
            value={filters.beat}
            onValueChange={(value) => handleFilterChange('beat', value)}
            disabled={!filters.range}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Beat" />
            </SelectTrigger>
            <SelectContent className="z-[100]">
              {beats.map((beat) => (
                <SelectItem key={beat.id} value={beat.id}>
                  {beat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative z-[100]">
          <Select
            value={filters.timeRange}
            onValueChange={(value) => handleFilterChange('timeRange', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent className="z-[100]">
              <SelectItem value="1d">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Map View */}
      <Card className="relative z-0">
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] w-full">
            <BeatMap
              selectedBeat={filters.beat}
              selectedRange={filters.range}
              selectedDivision={filters.division}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="population">Population</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Observations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary?.[0]?.total_observations || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Direct Sightings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary?.[0]?.direct_sightings || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Indirect Signs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary?.[0]?.indirect_signs || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Loss Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary?.[0]?.loss_reports || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Observations by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Observations by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.observationsByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Observations by Division */}
          <Card>
            <CardHeader>
              <CardTitle>Observations by Division</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.activityByDivision}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="division_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="observation_count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Most Active Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Most Active Division</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.activityByDivision?.[0]?.division_name || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  {data.activityByDivision?.[0]?.observation_count || 0} observations
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Most Active Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.activityByRange?.[0]?.range_name || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  {data.activityByRange?.[0]?.observation_count || 0} observations
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loss Reports Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Loss Reports Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.lossReports}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="loss_type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#ff4d4d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="population" className="space-y-4">
          {/* Population Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Population Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Male', value: data.populationTrends?.[0]?.male_elephants || 0 },
                        { name: 'Female', value: data.populationTrends?.[0]?.female_elephants || 0 },
                        { name: 'Unknown', value: data.populationTrends?.[0]?.unknown_elephants || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.populationTrends?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {/* Activity by Season */}
          <Card>
            <CardHeader>
              <CardTitle>Activity by Season</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.activityBySeason}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="season" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="observation_count" fill="#8884d8" />
                    <Bar dataKey="total_elephants_seen" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity by Land Type */}
          <Card>
            <CardHeader>
              <CardTitle>Activity by Land Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.activityByLandType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="land_type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="observation_count" fill="#8884d8" />
                    <Bar dataKey="total_elephants_seen" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          {/* Activity by Range */}
          <Card>
            <CardHeader>
              <CardTitle>Activity by Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.activityByRange}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="observation_count" fill="#8884d8" />
                    <Bar dataKey="total_elephants_seen" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 