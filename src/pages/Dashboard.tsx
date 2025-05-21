import React from "react";
import { EnhancedDashboard } from '@/components/EnhancedDashboard';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <EnhancedDashboard />
      </main>
    </div>
  );
}
