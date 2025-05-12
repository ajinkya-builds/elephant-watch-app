import React, { Suspense } from "react";
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

const queryClient = new QueryClient();

// Dynamically import PwaReloader only for production builds
const LazyPwaReloader = import.meta.env.PROD
  ? React.lazy(() => import("./components/PwaReloader"))
  : null;

const App = () => {
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
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Header />
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-activity"
              element={
                <ProtectedRoute>
                  <Header />
                  <ReportActivityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Header />
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Header />
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <Header />
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/observations"
              element={
                <ProtectedRoute>
                  <Header />
                  <AdminObservations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/statistics"
              element={
                <ProtectedRoute>
                  <Header />
                  <AdminStatistics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <Header />
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;