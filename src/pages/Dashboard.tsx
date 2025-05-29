import React from "react";
import { EnhancedDashboard } from '@/components/EnhancedDashboard';
import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col">
      {/* BeatMap removed, no space above */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
                <PawPrint className="w-8 h-8 text-white relative z-10" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Eravat Dashboard</h1>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container mx-auto p-2 sm:p-4"
      >
        <EnhancedDashboard />
      </motion.div>
      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-r from-blue-600 to-green-600 text-white mt-8 py-6"
      >
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-medium">© {new Date().getFullYear()} Eravat - Advanced Elephant Monitoring & Conservation Platform</p>
        </div>
      </motion.div>
    </div>
  );
}
