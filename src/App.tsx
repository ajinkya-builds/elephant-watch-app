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

const queryClient = new QueryClient();

// Dynamically import PwaReloader only for production builds
const LazyPwaReloader = import.meta.env.PROD
  ? React.lazy(() => import("./components/PwaReloader"))
  : null;

const App = () => {
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        toast.error("Database connection error. Please try again later.");
      }
    };
    checkConnection();
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
                    <Dashboard />
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