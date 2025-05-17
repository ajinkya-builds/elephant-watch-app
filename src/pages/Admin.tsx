import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const adminCards = [
  {
    title: "User Management",
    description: "Add, edit, or remove users. Assign roles and manage permissions.",
    icon: "👤",
    onClick: (navigate: any) => navigate('/admin/users'),
  },
  {
    title: "Observation & Report Management",
    description: "View, edit, or delete observations and reports submitted by users.",
    icon: "📋",
    onClick: (navigate: any) => navigate('/admin/observations'),
  },
  {
    title: "System Settings",
    description: "Configure system settings and manage application preferences.",
    icon: "⚙️",
    onClick: (navigate: any) => navigate('/admin/settings'),
  },
  {
    title: "System Log",
    description: "View activity, error, system, and login logs.",
    icon: "📝",
    onClick: (navigate: any) => navigate('/admin/logs'),
  },
];

export default function Admin() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-green-800 mb-8 text-center">Admin Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {adminCards.map((card, idx) => (
            <Card
              key={card.title}
              className="shadow-md cursor-pointer hover:shadow-xl transition rounded-xl p-6 flex flex-col items-start min-h-[180px]"
              onClick={() => card.onClick(navigate)}
            >
              <div className="flex items-center mb-4 text-4xl">{card.icon}</div>
              <CardHeader className="p-0 mb-2">
                <CardTitle className="text-xl font-semibold text-green-800">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-gray-600 text-base">
                {card.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
