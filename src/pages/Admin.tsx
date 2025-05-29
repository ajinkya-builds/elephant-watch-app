import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, FileText, Settings, Activity, AlertCircle, Database } from "lucide-react";

const adminCards = [
  {
    title: "User Management",
    description: "Add, edit, or remove users. Assign roles and manage permissions.",
    icon: <Users className="h-6 w-6" />,
    onClick: (navigate: any) => navigate('/admin/users'),
    color: "from-blue-600 to-green-600",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Observation & Report Management",
    description: "View, edit, or delete observations and reports submitted by users.",
    icon: <FileText className="h-6 w-6" />,
    onClick: (navigate: any) => navigate('/admin/observations'),
    color: "from-blue-600 to-green-600",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "System Log",
    description: "View activity, error, system, and login logs.",
    icon: <Database className="h-6 w-6" />,
    onClick: (navigate: any) => navigate('/admin/logs'),
    color: "from-blue-600 to-green-600",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "System Settings",
    description: "Configure system settings, notifications, and maintenance.",
    icon: <Settings className="h-6 w-6" />,
    onClick: (navigate: any) => navigate('/admin/settings'),
    color: "from-blue-600 to-green-600",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Activity Dashboard",
    description: "View detailed statistics and activity reports.",
    icon: <Activity className="h-6 w-6" />,
    onClick: (navigate: any) => navigate('/admin/statistics'),
    color: "from-blue-600 to-green-600",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Alerts & Notifications",
    description: "Manage system alerts and notification settings.",
    icon: <AlertCircle className="h-6 w-6" />,
    onClick: (navigate: any) => navigate('/admin/notifications'),
    color: "from-blue-600 to-green-600",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
];

export default function Admin() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12">
      <div className="container mx-auto p-2 sm:p-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent tracking-tight mb-3">Admin Panel</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Manage your application's core functions and monitor system performance
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {adminCards.map((card) => (
            <Card
              key={card.title}
              className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-blue-100"
              onClick={() => card.onClick(navigate)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className={`${card.iconBg} p-3 rounded-xl`}>
                    <div className={card.iconColor}>{card.icon}</div>
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{card.description}</p>
                <div className={`mt-4 h-1 w-full bg-gradient-to-r ${card.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
