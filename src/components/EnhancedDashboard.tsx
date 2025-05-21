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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Stats Cards */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Total Sightings</h2>
        <p className="text-3xl font-bold text-green-600">0</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Regions</h2>
        <p className="text-3xl font-bold text-green-600">0</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Conservation Status</h2>
        <p className="text-3xl font-bold text-green-600">Active</p>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2 lg:col-span-3">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Sightings Map</h2>
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Map will be displayed here</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2 lg:col-span-3">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <p className="text-gray-500">No recent activity to display</p>
        </div>
      </div>
    </div>
  );
}; 