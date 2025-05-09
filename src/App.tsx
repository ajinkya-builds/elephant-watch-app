import React, { Suspense, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ReportActivityPage from "./pages/ReportActivityPage";
import Login from "./components/Login"; // Import the Login component
import { supabase } from "@/lib/supabaseClient";

const queryClient = new QueryClient();

// Dynamically import PwaReloader only for production builds
const LazyPwaReloader = import.meta.env.PROD
  ? React.lazy(() => import("./components/PwaReloader"))
  : null;

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session); // Set to true if a session exists
    };
    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* Conditionally render PwaReloader using Suspense for React.lazy */}
        {import.meta.env.PROD && LazyPwaReloader && (
          <Suspense fallback={null}>
            <LazyPwaReloader />
          </Suspense>
        )}
        <BrowserRouter basename={import.meta.env.DEV ? "/" : "/elephant-watch-app"}>
          <Routes>
            {!isAuthenticated ? (
              // If not authenticated, show the login page
              <Route path="*" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
            ) : (
              // If authenticated, show the app routes
              <>
                <Route path="/" element={<Index />} />
                <Route path="/report-activity" element={<ReportActivityPage />} />
                <Route path="*" element={<NotFound />} />
              </>
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;