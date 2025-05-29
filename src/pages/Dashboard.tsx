import React from "react";
import { EnhancedDashboard } from '@/components/EnhancedDashboard';
import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col">
      {/* Header with title and subtitle */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
                <PawPrint className="w-8 h-8 text-white relative z-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Eravat Dashboard</h1>
                <p className="text-base font-medium text-white/90 mt-1">Real-time monitoring and analysis of elephant activities</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Main dashboard content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container mx-auto p-2 sm:p-4"
      >
        <EnhancedDashboard />
      </motion.div>
    </div>
  );
}
