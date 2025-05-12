import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

export default function AdminSettings() {
  // Dummy state for toggles and inputs
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
            <li className="text-gray-600">System Settings & Logs</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-bold text-green-800 mb-8 text-center">System Settings & Logs</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Application Name</label>
                <Input defaultValue="Wild Elephant Monitoring System" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Default Timezone</label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Default Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={maintenance} onCheckedChange={setMaintenance} />
                <span>Maintenance Mode</span>
              </div>
              <div className="text-xs text-gray-500">System version: 1.0.0</div>
            </CardContent>
          </Card>

          {/* Authentication & Security */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Password Policy</label>
                <Input defaultValue="Min 8 chars, 1 uppercase, 1 number" />
              </div>
              <div className="flex items-center gap-2">
                <Switch />
                <span>Enable Two-Factor Authentication (2FA)</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Session Timeout (minutes)</label>
                <Input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Login Attempt Limit</label>
                <Input defaultValue={5} type="number" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">IP Whitelist</label>
                <Input placeholder="e.g. 192.168.1.1, 10.0.0.0/8" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">IP Blacklist</label>
                <Input placeholder="e.g. 123.123.123.123" />
              </div>
            </CardContent>
          </Card>

          {/* Email & Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Email & Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">SMTP Server</label>
                <Input defaultValue="smtp.example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sender Email</label>
                <Input defaultValue="noreply@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notification on User Registration</label>
                <Switch checked={notification} onCheckedChange={setNotification} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Template</label>
                <Input defaultValue="Welcome to WEMS!" />
              </div>
            </CardContent>
          </Card>

          {/* Data & Backup */}
          <Card>
            <CardHeader>
              <CardTitle>Data & Backup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Backup Schedule</label>
                <Input defaultValue="Daily at 2:00 AM" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Backup Location</label>
                <Input defaultValue="/backups/" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data Retention Policy</label>
                <Input defaultValue="Keep for 1 year" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Export Data</Button>
                <Button variant="outline">Import Data</Button>
                <Button variant="outline">Restore Backup</Button>
              </div>
            </CardContent>
          </Card>

          {/* Third-party Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>Third-party Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">API Keys</label>
                <Input defaultValue="sk-xxxx-xxxx" />
                <Button variant="outline" className="mt-2">Regenerate</Button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Webhook URL</label>
                <Input defaultValue="https://example.com/webhook" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Connected Services</label>
                <Input defaultValue="Stripe, Google Analytics" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search activity logs..."
                value={searchLog}
                onChange={e => setSearchLog(e.target.value)}
                className="mb-2"
              />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogs.filter(l => l.user.toLowerCase().includes(searchLog.toLowerCase())).map(log => (
                      <TableRow key={log.id}>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.time}</TableCell>
                        <TableCell>{log.ip}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Error Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Error Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="mb-2">Download Logs</Button>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errorLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>{log.level}</TableCell>
                        <TableCell>{log.message}</TableCell>
                        <TableCell>{log.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* System Logs */}
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>{log.job}</TableCell>
                        <TableCell>{log.status}</TableCell>
                        <TableCell>{log.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Login Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Login Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Browser</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.status}</TableCell>
                        <TableCell>{log.time}</TableCell>
                        <TableCell>{log.ip}</TableCell>
                        <TableCell>{log.browser}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 