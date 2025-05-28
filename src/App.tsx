import React, { Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
import AdminNotifications from "./pages/AdminNotifications";
import { AuthProvider } from "@/contexts/AuthContext";
import { checkSupabaseConnection } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";

const queryClient = new QueryClient();

// Dynamically import PwaReloader only for production builds
const LazyPwaReloader = import.meta.env.PROD
  ? React.lazy(() => import("./components/PwaReloader"))
  : null;

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('App component mounted');
    const checkConnection = async () => {
      try {
        console.log('Checking Supabase connection...');
        const isConnected = await checkSupabaseConnection();
        console.log('Supabase connection status:', isConnected);
        if (!isConnected) {
          setError("Database connection error. Please try again later.");
          toast.error("Database connection error. Please try again later.");
        }
      } catch (err) {
        console.error('Connection check failed:', err);
        setError("Failed to connect to the database. Please try again later.");
        toast.error("Failed to connect to the database. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    checkConnection();
  }, []);

  console.log('App component rendering...');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {import.meta.env.PROD && LazyPwaReloader && (
            <Suspense fallback={null}>
              <LazyPwaReloader />
            </Suspense>
          )}
          <HashRouter>
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
                      <Footer />
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
                      <Footer />
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
                      <Footer />
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
                      <Footer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Header />
                      <AdminUsers />
                      <Footer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/observations"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Header />
                      <AdminObservations />
                      <Footer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/statistics"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Header />
                      <AdminStatistics />
                      <Footer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Header />
                      <AdminSettings />
                      <Footer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/logs"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Header />
                      <AdminLogs />
                      <Footer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/notifications"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Header />
                      <AdminNotifications />
                      <Footer />
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
                      <Footer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manager/observations"
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <Header />
                      <AdminObservations />
                      <Footer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manager/statistics"
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <Header />
                      <AdminStatistics />
                      <Footer />
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
                      <Footer />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </HashRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;