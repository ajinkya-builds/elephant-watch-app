import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/supabaseClient';
import { BeatMap } from './BeatMap';
import { DashboardData } from '@/types/dashboard';
import { RefreshCw, AlertCircle, Users, Calendar, MapPin, Activity, Eye, AlertTriangle, FileText } from 'lucide-react';
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
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

interface HeatmapPoint {
  lat: number;
  lng: number;
  type: 'sighting' | 'incident';
  title: string;
  description: string;
  date: string;
}

interface GeoPolygon {
  id: string;
  name: string;
  coordinates: [number, number][];
  type: 'division' | 'range' | 'beat';
}

interface PolygonResponse {
  id: string;
  name: string;
  geojson: string;
}

interface DivisionPolygon {
  id: string;
  new_division_id: string;
  divisions: {
    name: string;
  };
}

interface RangePolygon {
  id: string;
  new_range_id: string;
  ranges: {
    name: string;
  };
}

interface BeatPolygon {
  id: string;
  new_beat_id: string;
  beats: {
    name: string;
  };
}

interface ActivityMarker {
  id: string;
  latitude: number;
  longitude: number;
  observation_type: string;
  activity_date: string;
  activity_time: string;
  total_elephants?: number;
  male_elephants?: number;
  female_elephants?: number;
  unknown_elephants?: number;
  calves?: number;
  indirect_sighting_type?: string;
  loss_type?: string;
  compass_bearing?: number;
  photo_url?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Component to handle map bounds
function MapBounds({ polygons }: { polygons: GeoPolygon[] }) {
  const map = useMap();

  useEffect(() => {
    if (polygons.length > 0) {
      const bounds = L.latLngBounds(
        polygons.flatMap(polygon => polygon.coordinates)
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [polygons, map]);

  return null;
}

export const EnhancedDashboard: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    timeRange: '7d'
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [divisions, setDivisions] = useState<FilterOption[]>([]);
  const [ranges, setRanges] = useState<FilterOption[]>([]);
  const [beats, setBeats] = useState<FilterOption[]>([]);
  const [data, setData] = useState<DashboardData>({
    divisionStats: [],
    rangeStats: [],
    beatStats: [],
    heatmap: [],
    observationTypes: []
  });
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [selectedPolygons, setSelectedPolygons] = useState<GeoPolygon[]>([]);
  const [activityMarkers, setActivityMarkers] = useState<ActivityMarker[]>([]);

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
          new_id,
          name,
          new_division_id
        `)
        .eq('new_division_id', filters.division)
        .order('name');
      
      if (error) {
        console.error('Error fetching ranges:', error);
        return;
      }
      // Map to FilterOption
      const mappedRanges = (data || []).map((range: any) => ({ id: range.new_id, name: range.name }));
      setRanges(mappedRanges);
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
          new_id,
          name,
          new_range_id,
          new_division_id
        `)
        .eq('new_range_id', filters.range)
        .eq('new_division_id', filters.division)
        .order('name');
      
      if (error) {
        console.error('Error fetching beats:', error);
        return;
      }
      // Map to FilterOption
      const mappedBeats = (data || []).map((beat: any) => ({ id: beat.new_id, name: beat.name }));
      setBeats(mappedBeats);
      setLoading(false);
    }
    
    fetchBeats();
  }, [filters.range, filters.division]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch KPI summary
      const { data: kpiSummary, error: kpiError } = await supabase
        .from('v_dashboard_kpi_summary')
        .select('*')
        .single();

      if (kpiError) throw kpiError;

      // Fetch division stats
      const { data: divisionStats, error: divisionError } = await supabase
        .from('v_dashboard_division_stats')
        .select('*');

      if (divisionError) throw divisionError;

      // Fetch range stats
      const { data: rangeStats, error: rangeError } = await supabase
        .from('v_dashboard_range_stats')
        .select('*');

      if (rangeError) throw rangeError;

      // Fetch beat stats
      const { data: beatStats, error: beatError } = await supabase
        .from('v_dashboard_beat_stats')
        .select('*');

      if (beatError) throw beatError;

      // Fetch observations by type
      const { data: observationTypes, error: observationTypesError } = await supabase
        .from('v_dashboard_observations_by_type')
        .select('*');

      if (observationTypesError) throw observationTypesError;

      // Fetch loss data
      const { data: lossData, error: lossError } = await supabase
        .from('v_elephant_activity_observations_by_type')
        .select('*');

      if (lossError) throw lossError;

      const total_loss_reports = lossData?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;

      // Update kpiSummary
      const updatedKpiSummary = {
        ...kpiSummary,
        total_loss_reports,
        loss_types: lossData || []
      };

      const newData: DashboardData = {
        kpiSummary: updatedKpiSummary,
        divisionStats: divisionStats || [],
        rangeStats: rangeStats || [],
        beatStats: beatStats || [],
        heatmap: [],
        observationTypes: observationTypes || []
      };
      
      setData(newData);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch polygon data when filters change
  useEffect(() => {
    async function fetchPolygons() {
      if (!filters.division) {
        setSelectedPolygons([]);
        return;
      }

      try {
        let polygons: GeoPolygon[] = [];

        // Fetch division polygon
        const { data: divisionData, error: divisionError } = await supabase
          .from('division_polygons')
          .select(`
            id,
            new_division_id,
            divisions!inner(
              name
            )
          `)
          .eq('new_division_id', filters.division)
          .single() as { data: DivisionPolygon | null, error: any };

        console.log('Division data:', divisionData);
        console.log('Division error:', divisionError);

        if (divisionData) {
          try {
            // Get the polygon data using a raw query
            const { data: polygonData, error: polygonError } = await supabase
              .from('division_polygons')
              .select('polygon')
              .eq('id', divisionData.id)
              .single();

            if (polygonError) {
              console.error('Error fetching polygon:', polygonError);
              return;
            }

            // Convert the polygon to GeoJSON
            const { data: geoJsonData, error: geoJsonError } = await supabase
              .rpc('st_asgeojson', { geom: polygonData.polygon });

            if (geoJsonError) {
              console.error('Error converting to GeoJSON:', geoJsonError);
              return;
            }

            const geoJson = JSON.parse(geoJsonData);
            console.log('Parsed division GeoJSON:', geoJson);
            polygons.push({
              id: divisionData.id,
              name: divisionData.divisions.name,
              coordinates: geoJson.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng]),
              type: 'division'
            });
          } catch (error) {
            console.error('Error processing division polygon:', error);
          }
        }

        // Fetch range polygon if selected
        if (filters.range) {
          const { data: rangeData, error: rangeError } = await supabase
            .from('range_polygons')
            .select(`
              id,
              new_range_id,
              ranges!inner(
                name
              )
            `)
            .eq('new_range_id', filters.range)
            .single() as { data: RangePolygon | null, error: any };

          console.log('Range data:', rangeData);
          console.log('Range error:', rangeError);

          if (rangeData) {
            try {
              // Get the polygon data using a raw query
              const { data: polygonData, error: polygonError } = await supabase
                .from('range_polygons')
                .select('polygon')
                .eq('id', rangeData.id)
                .single();

              if (polygonError) {
                console.error('Error fetching polygon:', polygonError);
                return;
              }

              // Convert the polygon to GeoJSON
              const { data: geoJsonData, error: geoJsonError } = await supabase
                .rpc('st_asgeojson', { geom: polygonData.polygon });

              if (geoJsonError) {
                console.error('Error converting to GeoJSON:', geoJsonError);
                return;
              }

              const geoJson = JSON.parse(geoJsonData);
              console.log('Parsed range GeoJSON:', geoJson);
              polygons.push({
                id: rangeData.id,
                name: rangeData.ranges.name,
                coordinates: geoJson.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng]),
                type: 'range'
              });
            } catch (error) {
              console.error('Error processing range polygon:', error);
            }
          }
        }

        // Fetch beat polygon if selected
        if (filters.beat) {
          const { data: beatData, error: beatError } = await supabase
            .from('beat_polygons')
            .select(`
              id,
              new_beat_id,
              beats!inner(
                name
              )
            `)
            .eq('new_beat_id', filters.beat)
            .single() as { data: BeatPolygon | null, error: any };

          console.log('Beat data:', beatData);
          console.log('Beat error:', beatError);

          if (beatData) {
            try {
              // Get the polygon data using a raw query
              const { data: polygonData, error: polygonError } = await supabase
                .from('beat_polygons')
                .select('polygon')
                .eq('id', beatData.id)
                .single();

              if (polygonError) {
                console.error('Error fetching polygon:', polygonError);
                return;
              }

              // Convert the polygon to GeoJSON
              const { data: geoJsonData, error: geoJsonError } = await supabase
                .rpc('st_asgeojson', { geom: polygonData.polygon });

              if (geoJsonError) {
                console.error('Error converting to GeoJSON:', geoJsonError);
                return;
              }

              const geoJson = JSON.parse(geoJsonData);
              console.log('Parsed beat GeoJSON:', geoJson);
              polygons.push({
                id: beatData.id,
                name: beatData.beats.name,
                coordinates: geoJson.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng]),
                type: 'beat'
              });
            } catch (error) {
              console.error('Error processing beat polygon:', error);
            }
          }
        }

        console.log('Final polygons array:', polygons);
        setSelectedPolygons(polygons);
      } catch (error) {
        console.error('Error fetching polygon data:', error);
      }
    }

    fetchPolygons();
  }, [filters.division, filters.range, filters.beat]);

  // Fetch activity markers from activity_observation
  useEffect(() => {
    async function fetchActivityMarkers() {
      const { data, error } = await supabase
        .from('activity_observation')
        .select(`
          id,
          latitude,
          longitude,
          observation_type,
          activity_date,
          activity_time,
          total_elephants,
          male_elephants,
          female_elephants,
          unknown_elephants,
          calves,
          indirect_sighting_type,
          loss_type,
          compass_bearing,
          photo_url
        `);
      if (error) {
        console.error('Error fetching activity markers:', error);
        setActivityMarkers([]);
        return;
      }
      // Filter out invalid lat/lng
      setActivityMarkers((data || []).filter((a: any) => a.latitude && a.longitude));
    }
    fetchActivityMarkers();
  }, []);

  if (loading) {
  return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={handleRefresh} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Always render the dashboard UI, even if there is no data
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Select
            value={filters.timeRange}
            onValueChange={(value) => handleFilterChange('timeRange', value)}
          >
            <SelectTrigger className="w-[180px] bg-white border-gray-200 shadow-sm hover:border-blue-500 transition-colors">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleRefresh}
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-100 to-blue-50 shadow-lg rounded-2xl hover:scale-105 hover:shadow-xl transition-all duration-300 border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-blue-700">Total Activities</CardTitle>
            <div className="bg-blue-200 p-2 rounded-full">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-900">{data.kpiSummary?.total_activities || 0}</div>
            <p className="text-xs text-blue-600 mt-1">Across all divisions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-100 to-green-50 shadow-lg rounded-2xl hover:scale-105 hover:shadow-xl transition-all duration-300 border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-green-700">Active Users</CardTitle>
            <div className="bg-green-200 p-2 rounded-full">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-green-900">{data.kpiSummary?.total_users || 0}</div>
            <p className="text-xs text-green-600 mt-1">Total registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-100 to-red-50 shadow-lg rounded-2xl hover:scale-105 hover:shadow-xl transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-red-700">Total Loss</CardTitle>
            <div className="bg-red-200 p-2 rounded-full">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-red-900">{data.kpiSummary?.total_loss_reports || 0}</div>
            <p className="text-xs text-red-600 mt-1">Total loss reports</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-100 to-purple-50 shadow-lg rounded-2xl hover:scale-105 hover:shadow-xl transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-purple-700">Today's Activities</CardTitle>
            <div className="bg-purple-200 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-purple-900">{data.kpiSummary?.today_activities || 0}</div>
            <p className="text-xs text-purple-600 mt-1">Activities in last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Map Section */}
      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">Activity Map</CardTitle>
              <CardDescription>Geographic distribution of elephant activities</CardDescription>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Division
                </Label>
                <Select
                  value={filters.division || ''}
                  onValueChange={(value) => {
                    setFilters(f => ({ ...f, division: value, range: undefined, beat: undefined }));
                  }}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200 shadow-sm hover:border-blue-500 transition-colors">
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((division) => (
                      <SelectItem key={division.id} value={division.id}>
                        {division.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Range
                </Label>
                <Select
                  value={filters.range || ''}
                  onValueChange={(value) => {
                    setFilters(f => ({ ...f, range: value, beat: undefined }));
                  }}
                  disabled={!filters.division}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200 shadow-sm hover:border-blue-500 transition-colors disabled:opacity-50">
                    <SelectValue placeholder="Select Range" />
                  </SelectTrigger>
                  <SelectContent>
                    {ranges.map((range) => (
                      <SelectItem key={range.id} value={range.id}>
                        {range.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Beat
                </Label>
                <Select
                  value={filters.beat || ''}
                  onValueChange={(value) => {
                    setFilters(f => ({ ...f, beat: value }));
                  }}
                  disabled={!filters.range}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200 shadow-sm hover:border-blue-500 transition-colors disabled:opacity-50">
                    <SelectValue placeholder="Select Beat" />
                  </SelectTrigger>
                  <SelectContent>
                    {beats.map((beat) => (
                      <SelectItem key={beat.id} value={beat.id}>
                        {beat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
            <MapContainer
              center={[10.8505, 76.2711]}
              zoom={8}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapBounds polygons={selectedPolygons} />
              {selectedPolygons.map((polygon) => {
                console.log('Rendering polygon:', polygon);
                return (
                  <Polygon
                    key={polygon.id}
                    positions={polygon.coordinates}
                    pathOptions={{
                      color: polygon.type === 'division' ? '#2563eb' : 
                             polygon.type === 'range' ? '#f97316' : '#6b7280',
                      fillColor: polygon.type === 'division' ? '#3b82f6' :
                                polygon.type === 'range' ? '#fb923c' : '#9ca3af',
                      fillOpacity: 0.2,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-gray-900">{polygon.name}</h3>
                        <p className="text-sm text-gray-600">
                          {polygon.type.charAt(0).toUpperCase() + polygon.type.slice(1)} Boundary
                        </p>
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}
              {data.heatmap.map((point, index) => (
                <Marker
                  key={index}
                  position={[point.lat, point.lng]}
                  icon={L.divIcon({
                    className: 'custom-marker',
                    html: `<div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>`,
                    iconSize: [16, 16],
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-900">{point.division_name}</h3>
                      <p className="text-sm text-gray-600">
                        {point.observation_count} observations
                        {point.total_elephants_seen > 0 && ` • ${point.total_elephants_seen} elephants seen`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last observation: {new Date(point.last_observation_date).toLocaleDateString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {activityMarkers.map((activity) => (
                <Marker
                  key={activity.id}
                  position={[activity.latitude, activity.longitude]}
                  icon={L.divIcon({
                    className: 'custom-marker',
                    html: `
                      <div style="
                        width: 24px;
                        height: 24px;
                        background-color: #22c55e;
                        border: 3px solid white;
                        border-radius: 50%;
                        box-shadow: 0 0 10px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      ">
                        <div style="
                          width: 8px;
                          height: 8px;
                          background-color: white;
                          border-radius: 50%;
                        "></div>
                      </div>
                    `,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                    popupAnchor: [0, -12]
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-900">{activity.observation_type}</h3>
                      <p className="text-sm text-gray-600">
                        {activity.activity_date} {activity.activity_time}
                      </p>
                      {activity.total_elephants && (
                        <p className="text-xs text-gray-500 mt-1">
                          Total Elephants: {activity.total_elephants}
                          {activity.male_elephants && ` (${activity.male_elephants} male)`}
                          {activity.female_elephants && ` (${activity.female_elephants} female)`}
                          {activity.calves && ` (${activity.calves} calves)`}
                        </p>
                      )}
                      {activity.indirect_sighting_type && (
                        <p className="text-xs text-gray-500 mt-1">
                          Evidence: {activity.indirect_sighting_type}
                        </p>
                      )}
                      {activity.loss_type && (
                        <p className="text-xs text-gray-500 mt-1">
                          Loss Type: {activity.loss_type}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-600 border-2 border-white shadow-md flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <span className="text-sm text-gray-600">
                Activity Points ({activityMarkers.length})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-white p-2 rounded-xl shadow-md flex gap-4">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 font-semibold px-6 py-2 rounded-lg transition-all duration-300">Overview</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 font-semibold px-6 py-2 rounded-lg transition-all duration-300">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Observations by Type */}
            <Card className="bg-white shadow-lg rounded-2xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">Observations by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.observationTypes} barCategoryGap={24}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <XAxis dataKey="observation_type" className="text-sm" />
                      <YAxis className="text-sm" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} isAnimationActive />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Most Active Areas */}
            <Card className="bg-white shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-blue-900">Most Active Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Most Active Division</p>
                      <p className="text-2xl font-extrabold text-blue-900 mt-1">
                        {data.divisionStats?.[0]?.division_name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-700">Observations</p>
                      <p className="text-2xl font-extrabold text-blue-900 mt-1">
                        {data.divisionStats?.[0]?.total_observations || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Most Active Range</p>
                      <p className="text-2xl font-extrabold text-blue-900 mt-1">
                        {data.rangeStats?.[0]?.range_name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-700">Observations</p>
                      <p className="text-2xl font-extrabold text-blue-900 mt-1">
                        {data.rangeStats?.[0]?.total_observations || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loss Reports Summary */}
          <Card className="bg-white shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-red-700">Loss Reports Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.divisionStats} barCategoryGap={24}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="division_name" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="loss_reports" fill="#ef4444" radius={[8, 8, 0, 0]} isAnimationActive />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-8">
          {/* Activity by Division */}
          <Card className="bg-white shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-blue-900">Activity by Division</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.divisionStats} barCategoryGap={24}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="division_name" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="total_observations" fill="#4f46e5" radius={[8, 8, 0, 0]} isAnimationActive />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity by Range (moved from Geography tab) */}
          <Card className="bg-white shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-blue-900">Activity by Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.rangeStats} barCategoryGap={24}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="range_name" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="total_observations" fill="#4f46e5" radius={[8, 8, 0, 0]} isAnimationActive />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Loss Type Bar Chart */}
          <Card className="bg-white shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-red-700">Loss Reports by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.kpiSummary?.loss_types || []} barCategoryGap={24}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="type" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#ef4444" radius={[8, 8, 0, 0]} isAnimationActive />
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