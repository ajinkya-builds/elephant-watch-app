import React, { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ReportActivityPage from "./pages/ReportActivityPage";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Login from "./components/Login";
import { Header } from "./components/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminUsers from "./pages/AdminUsers";
import AdminObservations from "./pages/AdminObservations";
import AdminStatistics from "./pages/AdminStatistics";
import AdminSettings from "./pages/AdminSettings";
import AdminLogs from "./pages/AdminLogs";
import { AuthProvider } from "@/contexts/AuthContext";
import { checkSupabaseConnection } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { EnhancedDashboard } from '@/components/EnhancedDashboard';

const queryClient = new QueryClient();

// Dynamically import PwaReloader only for production builds
const LazyPwaReloader = import.meta.env.PROD
  ? React.lazy(() => import("./components/PwaReloader"))
  : null;

const App = () => {
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const isConnected = await checkSupabaseConnection();
        
        if (isConnected) {
          console.log('Supabase connection test passed');
          
          // Check if we've already shown the success message in this session
          const hasShownConnectionSuccess = sessionStorage.getItem('hasShownSupabaseSuccess');
          
          if (!hasShownConnectionSuccess) {
            toast.success('Connected to Supabase successfully!');
            // Mark that we've shown the message
            sessionStorage.setItem('hasShownSupabaseSuccess', 'true');
          }
        } else {
          console.error('Supabase connection test failed');
          toast.error('Failed to connect to Supabase. Please check the console for details.');
        }
      } catch (error) {
        console.error('Error during connection test:', error);
        toast.error('Failed to connect to Supabase. Please check your credentials and network connection.');
      }
    };
    testConnection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {import.meta.env.PROD && LazyPwaReloader && (
          <Suspense fallback={null}>
            <LazyPwaReloader />
          </Suspense>
        )}
        <BrowserRouter basename={import.meta.env.DEV ? "/" : "/elephant-watch-app"}>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Root path - Home page with role selection */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Header />
                    <Index />
                  </ProtectedRoute>
                }
              />
              
              {/* Dashboard - Main dashboard for authenticated users */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Header />
                    <EnhancedDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Report Activity - Accessible by all roles */}
              <Route
                path="/report"
                element={
                  <ProtectedRoute>
                    <Header />
                    <ReportActivityPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes - Only accessible by admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Header />
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Header />
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/observations"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Header />
                    <AdminObservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/statistics"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Header />
                    <AdminStatistics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Header />
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/logs"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Header />
                    <AdminLogs />
                  </ProtectedRoute>
                }
              />

              {/* Manager Routes - Accessible by admin and manager */}
              <Route
                path="/manager/users"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <Header />
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/observations"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <Header />
                    <AdminObservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/statistics"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <Header />
                    <AdminStatistics />
                  </ProtectedRoute>
                }
              />

              {/* Data Collector Routes - Accessible by all roles */}
              <Route
                path="/collector/report"
                element={
                  <ProtectedRoute>
                    <Header />
                    <ReportActivityPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;