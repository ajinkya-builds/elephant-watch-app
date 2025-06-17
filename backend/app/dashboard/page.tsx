'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { supabase } from '../../src/lib/supabaseClient';
import { format } from 'date-fns';
import * as React from "react";

interface ActivityReport {
  id: string;
  created_at: string;
  total_elephants?: number;
  adult_male_count?: number;
  adult_female_count?: number;
  sub_adult_male_count?: number;
  sub_adult_female_count?: number;
  calf_count?: number;
  observation_type: string;
  division_name?: string;
  range_name?: string;
  beat_name?: string;
}

interface DashboardData {
  total_elephants: number;
  monthly_trends: {
    date: string;
    count: number;
  }[];
  demographics: {
    name: string;
    value: number;
  }[];
  recent_activities: {
    date: string;
    time: string;
    type: string;
    total_elephants: number;
    location: string;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default async function DashboardPage() {
  const { data: reports, error } = await supabase
    .from('activity_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching data:', error);
    return <div>Error loading dashboard data</div>;
  }

  const processedData: DashboardData = {
    total_elephants: (reports as ActivityReport[]).reduce((sum: number, report: ActivityReport) => sum + (report.total_elephants || 0), 0),
    monthly_trends: (reports as ActivityReport[]).reduce((acc: { date: string; count: number }[], report: ActivityReport) => {
      const date = format(new Date(report.created_at), 'MMM yyyy');
      const existing = acc.find((item: { date: string; count: number }) => item.date === date);
      if (existing) {
        existing.count += report.total_elephants || 0;
      } else {
        acc.push({ date, count: report.total_elephants || 0 });
      }
      return acc;
    }, []),
    demographics: [
      { name: 'Adult Males', value: (reports as ActivityReport[]).reduce((sum: number, report: ActivityReport) => sum + (report.adult_male_count || 0), 0) },
      { name: 'Adult Females', value: (reports as ActivityReport[]).reduce((sum: number, report: ActivityReport) => sum + (report.adult_female_count || 0), 0) },
      { name: 'Sub-adult Males', value: (reports as ActivityReport[]).reduce((sum: number, report: ActivityReport) => sum + (report.sub_adult_male_count || 0), 0) },
      { name: 'Sub-adult Females', value: (reports as ActivityReport[]).reduce((sum: number, report: ActivityReport) => sum + (report.sub_adult_female_count || 0), 0) },
      { name: 'Calves', value: (reports as ActivityReport[]).reduce((sum: number, report: ActivityReport) => sum + (report.calf_count || 0), 0) }
    ],
    recent_activities: (reports as ActivityReport[]).slice(0, 5).map(report => ({
      date: format(new Date(report.created_at), 'MMM dd, yyyy'),
      time: format(new Date(report.created_at), 'HH:mm'),
      type: report.observation_type,
      total_elephants: report.total_elephants || 0,
      location: `${report.division_name || ''} ${report.range_name || ''} ${report.beat_name || ''}`.trim()
    }))
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Elephants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{processedData.total_elephants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData.monthly_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processedData.demographics}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {processedData.demographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Date</th>
                  <th className="text-left">Time</th>
                  <th className="text-left">Type</th>
                  <th className="text-left">Total Elephants</th>
                  <th className="text-left">Location</th>
                </tr>
              </thead>
              <tbody>
                {processedData.recent_activities.map((activity, index) => (
                  <tr key={index}>
                    <td>{activity.date}</td>
                    <td>{activity.time}</td>
                    <td>{activity.type}</td>
                    <td>{activity.total_elephants}</td>
                    <td>{activity.location}</td>
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