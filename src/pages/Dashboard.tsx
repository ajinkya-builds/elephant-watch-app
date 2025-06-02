import React from "react";
import { EnhancedDashboard } from '@/components/EnhancedDashboard';
import { motion } from "framer-motion";

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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
                <img src="/elephant_photo.png" alt="Elephant Logo" className="w-8 h-8 sm:w-10 sm:h-10 relative z-10" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Eravat Dashboard</h1>
                <p className="text-sm sm:text-base font-medium text-white/90 mt-1 max-w-2xl">
                  Real-time monitoring and analysis of elephant activities
                </p>
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
        className="container mx-auto p-4 sm:p-6 lg:p-8"
      >
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
          <EnhancedDashboard />
        </div>
      </motion.div>

      {/* Responsive Footer */}
      <footer className="mt-auto bg-white border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Eravat. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
