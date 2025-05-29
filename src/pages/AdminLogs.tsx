import React, { useEffect, useState, useCallback } from "react";
import {
  fetchErrorLogs, fetchLoginLogs, fetchSystemLogs
} from "@/lib/logsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Search, AlertCircle, Database, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper to get browser info
function getBrowserInfo() {
  return navigator.userAgent;
}

export default function AdminLogs() {
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("errors");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all logs
  const fetchAllLogs = useCallback(async () => {
    setLoading(true);
    const [e, l, s] = await Promise.all([
      fetchErrorLogs(), fetchLoginLogs(), fetchSystemLogs()
    ]);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-10">
      <div className="container mx-auto p-2 sm:p-4">
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">System Logs</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Monitor system activity, errors, and user actions
          </p>
        </div>
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white shadow-lg mb-8">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Log Management</CardTitle>
              </div>
              <Button onClick={fetchAllLogs} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh Logs
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">Filter</Button>
                <Button variant="outline">Export</Button>
              </div>

              <Tabs defaultValue="errors" className="space-y-4">
                <TabsList className="bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger
                    value="errors"
                    className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Error Logs
                  </TabsTrigger>
                  <TabsTrigger
                    value="system"
                    className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    System Logs
                  </TabsTrigger>
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Login Logs
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="errors" className="space-y-4">
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {errorLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-sm">{log.time}</TableCell>
                            <TableCell className="text-sm">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                log.level === 'Error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {log.level}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm">{log.message}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                Error
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="system" className="space-y-4">
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Job</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {systemLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-sm">{log.time}</TableCell>
                            <TableCell className="text-sm">{log.job}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                log.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {log.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm">-</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="login" className="space-y-4">
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loginLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-sm font-medium">{log.email || log.user}</TableCell>
                            <TableCell className="text-sm">{log.time}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                log.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {log.status === 'Success' ? 'Successful' : 'Failed'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 