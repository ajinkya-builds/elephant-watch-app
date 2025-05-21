import React from "react";
import { EnhancedDashboard } from '@/components/EnhancedDashboard';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-md">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Elephant Watch Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <EnhancedDashboard />
      </div>
      
      {/* Footer */}
      <div className="bg-green-800 text-white mt-8 py-4">
        <div className="container mx-auto px-6 text-center text-sm">
          <p>© {new Date().getFullYear()} Elephant Watch App - Monitoring and Conservation</p>
        </div>
      </div>
    </div>
  );
}
