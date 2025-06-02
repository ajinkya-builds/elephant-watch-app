import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto py-8 sm:py-12 px-2 sm:px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="flex justify-center mb-4 sm:mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <img src="/elephant_photo.png" alt="Elephant Logo" className="w-16 h-16 sm:w-24 sm:h-24 relative z-10" />
            </motion.div>
          </div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl sm:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"
          >
            Eravat
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Advanced Elephant Monitoring & Conservation Platform
          </motion.p>
        </motion.div>

        {/* Admin Button - Only show for admin users */}
        {user && user.role !== 'data_collector' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-8 sm:mb-12 text-center"
          >
            <Button 
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-xl text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/admin')}
            >
              Access Admin Panel
            </Button>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 max-w-4xl mx-auto"
        >
          <Card className="hover:shadow-xl transition-all duration-300 bg-white border-0 rounded-2xl overflow-hidden group">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-blue-800 flex items-center gap-2 text-lg sm:text-xl">
                <Activity className="w-5 h-5" />
                Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                View comprehensive statistics and recent observations in real-time
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl py-4 sm:py-6 text-base sm:text-lg font-semibold transition-all duration-300 group-hover:scale-[1.02]"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 bg-white border-0 rounded-2xl overflow-hidden group">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="text-green-800 flex items-center gap-2 text-lg sm:text-xl">
                <MapPin className="w-5 h-5" />
                Report Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Report new elephant sightings or activities in your area
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl py-4 sm:py-6 text-base sm:text-lg font-semibold transition-all duration-300 group-hover:scale-[1.02]"
                onClick={() => navigate("/report")}
              >
                Report Activity
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}