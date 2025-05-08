import React, { Suspense } from 'react'; // Import React and Suspense
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ReportActivityPage from "./pages/ReportActivityPage";

const queryClient = new QueryClient();

// Dynamically import PwaReloader only for production builds
// const LazyPwaReloader = import.meta.env.PROD // Commented out
//   ? React.lazy(() => import("./components/PwaReloader"))
//   : null;

// Test comment for redeploy
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* Conditionally render PwaReloader using Suspense for React.lazy */}
      {/* {import.meta.env.PROD && LazyPwaReloader && ( // Commented out
        <Suspense fallback={null}> 
          <LazyPwaReloader />
        </Suspense>
      )} */}
      <BrowserRouter basename="/elephant-watch-app">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/report-activity" element={<ReportActivityPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;