import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Users, Calendar, MapPin, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
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

// Mock data for demonstration
const MOCK_DATA = {
  kpiSummary: {
    total_activities: 1250,
    total_users: 45,
    total_days: 180,
    total_elephants_sighted: 320,
    today_activities: 12,
    today_active_users: 8,
    weekly_activities: 85,
    weekly_active_users: 25,
    total_divisions: 5,
    total_ranges: 15,
    total_beats: 45
  },
  divisionStats: [
    { division_name: 'North Division', total_observations: 450, direct_sightings: 200, indirect_signs: 150, loss_reports: 100 },
    { division_name: 'South Division', total_observations: 380, direct_sightings: 180, indirect_signs: 120, loss_reports: 80 },
    { division_name: 'East Division', total_observations: 320, direct_sightings: 150, indirect_signs: 100, loss_reports: 70 },
  ],
  monthlyTrends: [
    { month: '2024-01', observations: 120, elephants: 45 },
    { month: '2024-02', observations: 150, elephants: 60 },
    { month: '2024-03', observations: 180, elephants: 75 },
  ],
  observationTypes: [
    { type: 'Direct Sighting', value: 530 },
    { type: 'Indirect Signs', value: 370 },
    { type: 'Loss Report', value: 250 },
  ],
  recentActivities: [
    { date: '2024-03-20', time: '09:30', type: 'Direct', count: 5, location: 'North Beat' },
    { date: '2024-03-20', time: '14:15', type: 'Indirect', count: 0, location: 'South Beat' },
    { date: '2024-03-19', time: '11:45', type: 'Direct', count: 3, location: 'East Beat' },
  ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const DashboardPreview: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Preview</h1>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_DATA.kpiSummary.total_activities}</div>
            <p className="text-xs text-muted-foreground">
              {MOCK_DATA.kpiSummary.today_activities} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_DATA.kpiSummary.total_users}</div>
            <p className="text-xs text-muted-foreground">
              {MOCK_DATA.kpiSummary.weekly_active_users} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Elephants Sighted</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_DATA.kpiSummary.total_elephants_sighted}</div>
            <p className="text-xs text-muted-foreground">
              Across {MOCK_DATA.kpiSummary.total_divisions} divisions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_DATA.kpiSummary.total_beats}</div>
            <p className="text-xs text-muted-foreground">
              Beats across {MOCK_DATA.kpiSummary.total_ranges} ranges
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Activity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_DATA.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="observations" stroke="#8884d8" name="Observations" />
                  <Line type="monotone" dataKey="elephants" stroke="#82ca9d" name="Elephants" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Observation Types */}
        <Card>
          <CardHeader>
            <CardTitle>Observation Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_DATA.observationTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {MOCK_DATA.observationTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Count</th>
                  <th className="text-left p-2">Location</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DATA.recentActivities.map((activity, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{activity.date}</td>
                    <td className="p-2">{activity.time}</td>
                    <td className="p-2">{activity.type}</td>
                    <td className="p-2">{activity.count}</td>
                    <td className="p-2">{activity.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Division Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Division Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Division</th>
                  <th className="text-left p-2">Total Observations</th>
                  <th className="text-left p-2">Direct Sightings</th>
                  <th className="text-left p-2">Indirect Signs</th>
                  <th className="text-left p-2">Loss Reports</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DATA.divisionStats.map((division, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{division.division_name}</td>
                    <td className="p-2">{division.total_observations}</td>
                    <td className="p-2">{division.direct_sightings}</td>
                    <td className="p-2">{division.indirect_signs}</td>
                    <td className="p-2">{division.loss_reports}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 