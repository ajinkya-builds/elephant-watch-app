'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface DashboardData {
  totalElephants: { month: string; total_elephants: number }[];
  demographics: {
    total_males: number;
    total_females: number;
    total_calves: number;
    total_unknown: number;
  };
  observationTypes: { observation_type: string; count: number }[];
  recentActivities: {
    activity_date: string;
    activity_time: string;
    observation_type: string;
    total_elephants: number;
    latitude: string;
    longitude: string;
  }[];
  monthlyTrends: {
    month: string;
    total_observations: number;
    total_elephants_seen: number;
    days_with_activity: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [
          { data: totalElephants },
          { data: demographics },
          { data: observationTypes },
          { data: recentActivities },
          { data: monthlyTrends }
        ] = await Promise.all([
          supabase.from('dashboard_total_elephants').select('*'),
          supabase.from('dashboard_elephant_demographics').select('*'),
          supabase.from('dashboard_observation_types').select('*'),
          supabase.from('dashboard_recent_activities').select('*'),
          supabase.from('dashboard_monthly_trends').select('*')
        ]);

        setData({
          totalElephants: totalElephants || [],
          demographics: demographics?.[0] || { total_males: 0, total_females: 0, total_calves: 0, total_unknown: 0 },
          observationTypes: observationTypes || [],
          recentActivities: recentActivities || [],
          monthlyTrends: monthlyTrends || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading dashboard data...</div>;
  }

  if (!data) {
    return <div className="p-8">Error loading dashboard data</div>;
  }

  const demographicsData = [
    { name: 'Males', value: data.demographics.total_males },
    { name: 'Females', value: data.demographics.total_females },
    { name: 'Calves', value: data.demographics.total_calves },
    { name: 'Unknown', value: data.demographics.total_unknown }
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Elephants Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.totalElephants}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => format(new Date(value), 'MMM yyyy')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMMM yyyy')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total_elephants" 
                    stroke="#8884d8" 
                    name="Total Elephants"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Elephant Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographicsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {demographicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Activity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => format(new Date(value), 'MMM yyyy')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMMM yyyy')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total_observations" 
                    stroke="#82ca9d" 
                    name="Total Observations"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="days_with_activity" 
                    stroke="#8884d8" 
                    name="Days with Activity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
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
                  <th className="text-left p-2">Total Elephants</th>
                  <th className="text-left p-2">Location</th>
                </tr>
              </thead>
              <tbody>
                {data.recentActivities.map((activity, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{format(new Date(activity.activity_date), 'MMM dd, yyyy')}</td>
                    <td className="p-2">{activity.activity_time}</td>
                    <td className="p-2">{activity.observation_type}</td>
                    <td className="p-2">{activity.total_elephants}</td>
                    <td className="p-2">
                      {activity.latitude}, {activity.longitude}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 