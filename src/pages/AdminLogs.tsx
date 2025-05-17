import React, { useEffect, useState, useCallback } from "react";
import {
  fetchActivityLogs, fetchErrorLogs, fetchLoginLogs, fetchSystemLogs
} from "@/lib/logsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";

// Helper to get browser info
function getBrowserInfo() {
  return navigator.userAgent;
}

export default function AdminLogs() {
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [searchLog, setSearchLog] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all logs
  const fetchAllLogs = useCallback(async () => {
    setLoading(true);
    const [a, e, l, s] = await Promise.all([
      fetchActivityLogs(), fetchErrorLogs(), fetchLoginLogs(), fetchSystemLogs()
    ]);
    setActivityLogs(a.data || []);
    setErrorLogs(e.data || []);
    setLoginLogs(l.data || []);
    setSystemLogs(s.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllLogs();
  }, [fetchAllLogs]);

  // Download helpers for each log type
  const downloadCSV = (rows: any[], headers: string[], filename: string) => {
    const csv = [headers, ...rows.map(row => headers.map(h => row[h] ?? "")).map(row => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  console.log("loginLogs from Supabase:", loginLogs);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
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
            <li className="text-gray-600">System Logs</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-bold text-green-800 mb-8 text-center">System Logs</h1>
        <div className="flex justify-end mb-4">
          <Button onClick={fetchAllLogs} variant="default" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading logs...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Activity Logs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Activity Logs</CardTitle>
                <Button size="sm" variant="outline" onClick={() => downloadCSV(activityLogs, ["user_email", "action", "time", "ip"], "activity_logs.csv")}>Download</Button>
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
                      {activityLogs
                        .filter(l =>
                          l.user_email?.toLowerCase().includes(searchLog.toLowerCase()) ||
                          l.action?.toLowerCase().includes(searchLog.toLowerCase())
                        )
                        .slice(0, 5)
                        .map(log => (
                          <TableRow key={log.id}>
                            <TableCell>{log.user_email}</TableCell>
                            <TableCell>{log.action}</TableCell>
                            <TableCell>{log.time}</TableCell>
                            <TableCell>{log.ip}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  {activityLogs.length === 0 && <div className="text-center text-gray-400 py-4">No activity logs found.</div>}
                </div>
              </CardContent>
            </Card>

            {/* Error Logs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Error Logs</CardTitle>
                <Button size="sm" variant="outline" onClick={() => downloadCSV(errorLogs, ["level", "message", "time"], "error_logs.csv")}>Download</Button>
              </CardHeader>
              <CardContent>
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
                      {errorLogs.slice(0, 5).map(log => (
                        <TableRow key={log.id}>
                          <TableCell>{log.level}</TableCell>
                          <TableCell>{log.message}</TableCell>
                          <TableCell>{log.time}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {errorLogs.length === 0 && <div className="text-center text-gray-400 py-4">No error logs found.</div>}
                </div>
              </CardContent>
            </Card>

            {/* System Logs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>System Logs</CardTitle>
                <Button size="sm" variant="outline" onClick={() => downloadCSV(systemLogs, ["job", "status", "time"], "system_logs.csv")}>Download</Button>
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
                      {systemLogs.slice(0, 5).map(log => (
                        <TableRow key={log.id}>
                          <TableCell>{log.job}</TableCell>
                          <TableCell>{log.status}</TableCell>
                          <TableCell>{log.time}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {systemLogs.length === 0 && <div className="text-center text-gray-400 py-4">No system logs found.</div>}
                </div>
              </CardContent>
            </Card>

            {/* Login Logs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Login Logs</CardTitle>
                <Button size="sm" variant="outline" onClick={() => downloadCSV(loginLogs, ["user_email", "status", "time", "ip", "browser"], "login_logs.csv")}>Download</Button>
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
                      {loginLogs.slice(0, 5).map(log => (
                        <TableRow key={log.id}>
                          <TableCell>{log.user_email}</TableCell>
                          <TableCell>{log.status}</TableCell>
                          <TableCell>{log.time}</TableCell>
                          <TableCell>{log.ip}</TableCell>
                          <TableCell>{log.browser}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {loginLogs.length === 0 && <div className="text-center text-gray-400 py-4">No login logs found.</div>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 