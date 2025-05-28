import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Settings, Bell, Globe, Clock, Shield, Database } from "lucide-react";

export default function AdminSettings() {
  const [maintenance, setMaintenance] = useState(false);
  const [notification, setNotification] = useState(true);
  const [timezone, setTimezone] = useState("UTC");
  const [language, setLanguage] = useState("en");
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [searchLog, setSearchLog] = useState("");
  const navigate = useNavigate();

  // Dummy logs
  const activityLogs = [
    { id: 1, user: "admin@example.com", action: "Updated settings", time: "2024-06-01 10:00", ip: "192.168.1.1" },
    { id: 2, user: "user1@example.com", action: "Logged in", time: "2024-06-01 09:30", ip: "192.168.1.2" },
  ];
  const errorLogs = [
    { id: 1, level: "Error", message: "Failed to send email", time: "2024-06-01 08:00" },
    { id: 2, level: "Warning", message: "Slow response detected", time: "2024-06-01 07:45" },
  ];
  const systemLogs = [
    { id: 1, job: "Backup", status: "Success", time: "2024-06-01 02:00" },
    { id: 2, job: "Data Sync", status: "Failed", time: "2024-06-01 01:00" },
  ];
  const loginLogs = [
    { id: 1, user: "admin@example.com", status: "Success", time: "2024-06-01 10:00", ip: "192.168.1.1", browser: "Chrome" },
    { id: 2, user: "user1@example.com", status: "Failed", time: "2024-06-01 09:00", ip: "192.168.1.2", browser: "Firefox" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-10">
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
            <li className="text-gray-600">System Settings</li>
          </ol>
        </nav>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">System Settings</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Configure system settings, notifications, and maintenance options
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* General Settings */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                  <p className="text-sm text-gray-500">Enable maintenance mode for system updates</p>
                </div>
                <Switch checked={maintenance} onCheckedChange={setMaintenance} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Send email notifications for important events</p>
                </div>
                <Switch checked={notification} onCheckedChange={setNotification} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Session Timeout (minutes)</label>
                <Input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  className="max-w-[200px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Regional Settings */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">Regional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Timezone</label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="max-w-[200px]">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="IST">IST</SelectItem>
                    <SelectItem value="EST">EST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="max-w-[200px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="mr">Marathi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="bg-red-100 p-3 rounded-xl">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Password Policy</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" checked readOnly />
                    <span className="text-sm text-gray-600">Require strong passwords</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" checked readOnly />
                    <span className="text-sm text-gray-600">Enable two-factor authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" checked readOnly />
                    <span className="text-sm text-gray-600">Regular password rotation</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Logs */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search logs..."
                    value={searchLog}
                    onChange={(e) => setSearchLog(e.target.value)}
                    className="max-w-[300px]"
                  />
                  <Button variant="outline">Filter</Button>
                </div>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">{log.time}</TableCell>
                          <TableCell className="text-sm">{log.action}</TableCell>
                          <TableCell className="text-sm">{log.user}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Success
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-8 max-w-7xl mx-auto">
          <Button variant="outline">Reset to Default</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
} 