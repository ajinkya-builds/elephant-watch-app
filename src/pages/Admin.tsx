import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-green-800 mb-8 text-center">Admin Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Management */}
          <Card
            className="shadow-md cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate('/admin/users')}
          >
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Add, edit, or remove users. Assign roles and manage permissions.</p>
            </CardContent>
          </Card>

          {/* Observation/Report Management */}
          <Card
            className="shadow-md cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate('/admin/observations')}
          >
            <CardHeader>
              <CardTitle>Observation & Report Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">View, edit, or delete observations and reports submitted by users.</p>
            </CardContent>
          </Card>

          {/* Admin Dashboard/Statistics */}
          <Card
            className="shadow-md cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate('/admin/statistics')}
          >
            <CardHeader>
              <CardTitle>Admin Dashboard & Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">View system statistics, usage analytics, and admin-specific dashboards.</p>
            </CardContent>
          </Card>

          {/* System Settings/Logs */}
          <Card
            className="shadow-md cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate('/admin/settings')}
          >
            <CardHeader>
              <CardTitle>System Settings & Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Configure system settings, view logs, and manage application preferences.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
