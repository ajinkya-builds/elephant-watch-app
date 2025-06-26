import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Settings, Globe, Shield, Database } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e8f1fe]/30 py-10">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Breadcrumb */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <button
                className="text-primary hover:text-primary/80 font-medium transition-colors"
                onClick={() => navigate('/admin')}
              >
                Admin Panel
              </button>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li className="text-gray-500">System Settings</li>
          </ol>
        </nav>

        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-gray-900 dark:text-gray-100 mb-3">System Settings</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl opacity-80">
            Configure system settings, notifications, and maintenance options
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* General Settings */}
          <Card className="bg-white dark:bg-gray-800 shadow-md border border-slate-100 dark:border-slate-800 rounded-xl transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 shadow-sm">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-light tracking-tight text-gray-900 dark:text-gray-100">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Maintenance Mode</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Enable maintenance mode for system updates</p>
                </div>
                <Switch checked={maintenance} onCheckedChange={setMaintenance} />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Send email notifications for important events</p>
                </div>
                <Switch checked={notification} onCheckedChange={setNotification} />
              </div>
              <div className="space-y-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Session Timeout (minutes)</label>
                <Input
                  type="number"
                  className="border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary max-w-[200px]"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  min={1}
                  max={180}
                />
              </div>
            </CardContent>
          </Card>

          {/* Regional Settings */}
          <Card className="bg-white dark:bg-gray-800 shadow-md border border-slate-100 dark:border-slate-800 rounded-xl transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 shadow-sm">
                <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-xl font-light tracking-tight text-gray-900 dark:text-gray-100">Regional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              <div className="space-y-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="max-w-[200px] border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="kn">Kannada</SelectItem>
                    <SelectItem value="ml">Malayalam</SelectItem>
                    <SelectItem value="ta">Tamil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Timezone</label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="max-w-[200px] border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700">
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</SelectItem>
                    <SelectItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-white dark:bg-gray-800 shadow-md border border-slate-100 dark:border-slate-800 rounded-xl transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-full bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800 shadow-sm">
                <Shield className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <CardTitle className="text-xl font-light tracking-tight text-gray-900 dark:text-gray-100">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Require 2FA for admin users</p>
                </div>
                <Switch checked={true} disabled />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">IP Restriction</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Limit admin access to specific IP ranges</p>
                </div>
                <Switch checked={false} disabled />
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                <Button variant="outline" className="mr-3 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow transition-all duration-200">Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Database Settings */}
          <Card className="bg-white dark:bg-gray-800 shadow-md border border-slate-100 dark:border-slate-800 rounded-xl transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 shadow-sm">
                <Database className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-xl font-light tracking-tight text-gray-900 dark:text-gray-100">Activity Logs</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="mb-5">
                <div className="relative">
                  <Input
                    placeholder="Search logs..."
                    value={searchLog}
                    onChange={(e) => setSearchLog(e.target.value)}
                    className="pl-10 border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-medium text-gray-900 dark:text-gray-200">User</TableHead>
                      <TableHead className="font-medium text-gray-900 dark:text-gray-200">Action</TableHead>
                      <TableHead className="font-medium text-gray-900 dark:text-gray-200">Time</TableHead>
                      <TableHead className="font-medium text-gray-900 dark:text-gray-200">IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogs.map((log) => (
                      <TableRow key={log.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <TableCell className="font-medium text-primary">{log.user}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{log.action}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 text-sm">{log.time}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 font-mono text-sm">{log.ip}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 space-y-4">
          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow">Reset to Defaults</Button>
            <Button className="bg-primary hover:bg-primary/90 shadow transition-all duration-300 hover:shadow-md">Save All Changes</Button>
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6 opacity-70">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}