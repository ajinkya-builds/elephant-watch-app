import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { fetchAdminStatistics, AdminStatisticsData } from "@/lib/adminStatisticsService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminStatistics() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("7d");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStatisticsData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const data = await fetchAdminStatistics();
      setStats(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchStats, 60000); // Refresh every minute
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-800" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load statistics</h2>
          <Button onClick={fetchStats}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const userActivityData = stats.userActivityTimeline.map(item => ({
    time: new Date(item.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    activity: item.activity_count,
    users: item.unique_users
  })).reverse(); // Reverse to show chronological order

  const recordCreationData = stats.recordCreationTimeline.map(item => ({
    date: new Date(item.day).toLocaleDateString(),
    records: item.record_count,
    users: item.unique_users
  }));

  const resourceUtilizationData = stats.resourceUtilization.map(item => ({
    time: new Date(item.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    requests: item.request_count,
    errors: item.error_count
  })).reverse(); // Reverse to show chronological order

  const userDistributionData = [
    { name: 'Admins', value: stats.userStats.total_admins },
    { name: 'Moderators', value: stats.userStats.total_moderators },
    { name: 'Regular Users', value: stats.userStats.total_regular_users }
  ];

  const filteredUserDistributionData = userDistributionData.filter(entry => entry.value > 0);

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
            <li className="text-gray-600">Admin Dashboard & Statistics</li>
          </ol>
        </nav>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard & Statistics</h1>
          <div className="flex items-center gap-4">
            <select
              className="border rounded px-2 py-1"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Auto Refresh</span>
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
          <Card className="bg-white shadow-sm hover:shadow-md transition">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">Total Users</div>
              <div className="text-2xl font-bold text-green-800">{stats.userStats.total_users}</div>
              <div className="text-xs text-gray-500 mt-1">+{stats.userStats.new_users_7d} this week</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm hover:shadow-md transition">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">Active Users</div>
              <div className="text-2xl font-bold text-blue-800">{stats.userStats.active_users}</div>
              <div className="text-xs text-gray-500 mt-1">{stats.userStats.daily_active_users} today</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm hover:shadow-md transition">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">Total Records</div>
              <div className="text-2xl font-bold text-purple-800">{stats.activityStats.total_records}</div>
              <div className="text-xs text-gray-500 mt-1">+{stats.activityStats.records_24h} today</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm hover:shadow-md transition">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">Daily Active Users</div>
              <div className="text-2xl font-bold text-orange-800">{stats.userStats.daily_active_users}</div>
              <div className="text-xs text-gray-500 mt-1">{stats.activityStats.active_users_24h} in last 24h</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm hover:shadow-md transition">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">System Errors</div>
              <div className="text-2xl font-bold text-red-800">{stats.systemHealth.errors_24h}</div>
              <div className="text-xs text-gray-500 mt-1">{stats.systemHealth.errors_7d} in last 7 days</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm hover:shadow-md transition">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">Failed Logins</div>
              <div className="text-2xl font-bold text-yellow-800">{stats.systemHealth.failed_logins_24h}</div>
              <div className="text-xs text-gray-500 mt-1">{stats.systemHealth.failed_logins_7d} in last 7 days</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm hover:shadow-md transition">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">System Uptime</div>
              <div className="text-2xl font-bold text-green-800">99.98%</div>
              <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Visual Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-gray-900">User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-80">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={filteredUserDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {filteredUserDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-6 mt-6">
                  {filteredUserDistributionData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                      <span className="text-xs text-gray-500">({entry.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Record Creation Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recordCreationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="records" fill="#8884d8" />
                    <Bar dataKey="users" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Option */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => {
            // TODO: Implement export functionality
            toast.info('Export functionality coming soon');
          }}>
            Export Dashboard Data
          </Button>
        </div>
      </div>
    </div>
  );
} 