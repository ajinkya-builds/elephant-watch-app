import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function AdminStatistics() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("7d");
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Dummy KPIs
  const kpis = [
    { label: "Total Users", value: 120, link: "/admin/users" },
    { label: "Active Users", value: 87, link: "/admin/users" },
    { label: "Total Records", value: 5400, link: "/admin/observations" },
    { label: "Daily Active Users", value: 34, link: "/admin/users" },
    { label: "Pending Approvals", value: 3, link: "/admin/observations" },
    { label: "System Uptime %", value: "99.98%", link: "#" },
    { label: "Error/Alert Count", value: 2, link: "/admin/settings" },
  ];

  // Dummy recent activity
  const recentActivity = [
    { id: 1, event: "User login", user: "admin@example.com", time: "2024-06-01 10:00" },
    { id: 2, event: "Edited record", user: "user1@example.com", time: "2024-06-01 09:45" },
    { id: 3, event: "Role changed", user: "mod@example.com", time: "2024-06-01 09:30" },
    { id: 4, event: "Failed login", user: "user2@example.com", time: "2024-06-01 09:15" },
  ];

  // Dummy tasks/notifications
  const tasks = [
    { id: 1, text: "Backup due in 2 hours" },
    { id: 2, text: "3 pending approvals" },
    { id: 3, text: "System update available" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
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
        <h1 className="text-3xl font-bold text-green-800 mb-8 text-center">Admin Dashboard & Statistics</h1>

        {/* Date filter and refresh toggle */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex gap-2 items-center">
            <span className="font-medium">Date Range:</span>
            <select
              className="border rounded px-2 py-1"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="custom">Custom</option>
            </select>
            {dateRange === "custom" && (
              <Input type="date" className="ml-2" />
            )}
          </div>
          <div className="flex gap-2 items-center">
            <span className="font-medium">Auto Refresh</span>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>
        </div>

        {/* KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
          {kpis.map((kpi, idx) => (
            <div
              key={kpi.label}
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
              onClick={() => kpi.link && kpi.link !== '#' ? navigate(kpi.link) : null}
              title={kpi.link && kpi.link !== '#' ? `Go to ${kpi.label}` : undefined}
            >
              <span className="text-xs text-gray-500 mb-1">{kpi.label}</span>
              <span className="text-2xl font-bold text-green-800">{kpi.value}</span>
            </div>
          ))}
        </div>

        {/* Charts & Visual Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <Card className="cursor-pointer hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>User Signups Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center text-gray-400">[Line Chart Placeholder]</div>
              <Button variant="link" className="mt-2" onClick={() => navigate('/admin/users')}>View Details</Button>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>Active vs Inactive Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center text-gray-400">[Pie Chart Placeholder]</div>
              <Button variant="link" className="mt-2" onClick={() => navigate('/admin/users')}>View Details</Button>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>Logins by Day/Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center text-gray-400">[Bar Chart Placeholder]</div>
              <Button variant="link" className="mt-2" onClick={() => navigate('/admin/users')}>View Details</Button>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>Records Created per Module</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center text-gray-400">[Bar Chart Placeholder]</div>
              <Button variant="link" className="mt-2" onClick={() => navigate('/admin/observations')}>View Details</Button>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>System/API Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center text-gray-400">[Line Chart Placeholder]</div>
              <Button variant="link" className="mt-2" onClick={() => navigate('/admin/settings')}>View Details</Button>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>Resource Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center text-gray-400">[Resource Chart Placeholder]</div>
              <Button variant="link" className="mt-2" onClick={() => navigate('/admin/settings')}>View Details</Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Feed & Task Center */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-gray-100">
                {recentActivity.map(act => (
                  <li key={act.id} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-green-800">{act.event}</span> by <span className="text-gray-700">{act.user}</span>
                    </div>
                    <span className="text-xs text-gray-500">{act.time}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Task & Notification Center</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-gray-100">
                {tasks.map(task => (
                  <li key={task.id} className="py-2 flex items-center">
                    <span className="text-green-700 mr-2">•</span> {task.text}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Export Option */}
        <div className="flex justify-end">
          <Button variant="outline">Export Dashboard Data</Button>
        </div>
      </div>
    </div>
  );
} 