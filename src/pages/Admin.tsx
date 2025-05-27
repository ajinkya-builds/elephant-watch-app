import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const adminCards = [
  {
    title: "User Management",
    description: "Add, edit, or remove users. Assign roles and manage permissions.",
    icon: "👤",
    onClick: (navigate: any) => navigate('/admin/users'),
    color: "bg-white hover:bg-gray-50",
  },
  {
    title: "Observation & Report Management",
    description: "View, edit, or delete observations and reports submitted by users.",
    icon: "📋",
    onClick: (navigate: any) => navigate('/admin/observations'),
    color: "bg-white hover:bg-gray-50",
  },
  {
    title: "System Log",
    description: "View activity, error, system, and login logs.",
    icon: "📝",
    onClick: (navigate: any) => navigate('/admin/logs'),
    color: "bg-white hover:bg-gray-50",
  },
];

export default function Admin() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Admin Panel</h1>
          <p className="text-gray-600 text-lg">Manage your application's core functions</p>
        </div>
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
          {adminCards.map((card, idx) => (
            <Card
              key={card.title}
              className={`shadow-lg cursor-pointer transition-all duration-300 rounded-xl p-6 flex flex-row items-center gap-6 ${card.color}`}
              onClick={() => card.onClick(navigate)}
            >
              <div className="flex items-center justify-center text-5xl bg-gray-50 rounded-full p-4 shadow-sm min-w-[80px]">
                {card.icon}
              </div>
              <div className="flex-1">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="text-2xl font-semibold text-gray-800">{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-gray-600 text-base">
                  {card.description}
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
