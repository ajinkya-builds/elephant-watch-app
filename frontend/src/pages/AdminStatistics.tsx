import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getAdminStatistics, AdminStatisticsData } from "@/lib/adminStatisticsService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminStatistics() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("7d");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<AdminStatisticsData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const data = await getAdminStatistics();
      setStatistics(data);
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
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Statistics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-8 w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Statistics</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Failed to load statistics'}
        </div>
      </div>
    );
  }

  const userActivityData = statistics.userActivityTimeline.map(item => ({
    hour: item.hour,
    activity: item.activity_count,
    users: item.unique_users
  }));

  const recordCreationData = statistics.recordCreationTimeline.map(item => ({
    day: item.day,
    records: item.record_count,
    users: item.unique_users
  }));

  const resourceUtilizationData = statistics.resourceUtilization.map(item => ({
    hour: item.hour,
    requests: item.request_count,
    responseTime: item.avg_response_time,
    errors: item.error_count
  }));

  const userDistributionData = [
    { name: 'Admins', value: statistics.userStats.total_admins },
    { name: 'Regular Users', value: statistics.userStats.total_users - statistics.userStats.total_admins }
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">User Activity</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="activity" stroke="#8884d8" />
                <Line type="monotone" dataKey="users" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Record Creation</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recordCreationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="records" fill="#8884d8" />
                <Bar dataKey="users" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Resource Utilization</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceUtilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requests" fill="#8884d8" />
                <Bar dataKey="errors" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">User Distribution</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">User Statistics</h2>
          <div className="space-y-2">
            <p>Total Users: {statistics.userStats.total_users}</p>
            <p>Active Users: {statistics.userStats.active_users}</p>
            <p>Daily Active Users: {statistics.userStats.daily_active_users}</p>
            <p>Total Admins: {statistics.userStats.total_admins}</p>
            <p>New Users (24h): {statistics.userStats.new_users_24h}</p>
            <p>New Users (7d): {statistics.userStats.new_users_7d}</p>
            <p>New Users (30d): {statistics.userStats.new_users_30d}</p>
            <p>Growth Rate: {statistics.userStats.user_growth_rate}%</p>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Activity Statistics</h2>
          <div className="space-y-2">
            <p>Total Records: {statistics.activityStats.total_records}</p>
            <p>Records (24h): {statistics.activityStats.records_24h}</p>
            <p>Records (7d): {statistics.activityStats.records_7d}</p>
            <p>Records (30d): {statistics.activityStats.records_30d}</p>
            <p>Avg Records/User: {statistics.activityStats.avg_records_per_user}</p>
            <p>Most Common Activity: {statistics.activityStats.most_common_activity}</p>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">System Health</h2>
          <div className="space-y-2">
            <p>Errors (24h): {statistics.systemHealth.errors_24h}</p>
            <p>Errors (7d): {statistics.systemHealth.errors_7d}</p>
            <p>Failed Logins (24h): {statistics.systemHealth.failed_logins_24h}</p>
            <p>Failed Logins (7d): {statistics.systemHealth.failed_logins_7d}</p>
            <p>System Uptime: {statistics.systemHealth.system_uptime}%</p>
            <p>Avg Response Time: {statistics.systemHealth.avg_response_time}ms</p>
          </div>
        </Card>
      </div>

      <Card className="mt-8 p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {statistics.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-1">
                <div className="font-medium">{activity.event_type}</div>
                <div className="text-sm text-gray-500">{activity.details}</div>
                <div className="text-xs text-gray-400">
                  {new Date(activity.event_time).toLocaleString()} by {activity.user}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 