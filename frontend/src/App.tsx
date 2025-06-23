import React, { Suspense, lazy, Component, ErrorInfo, ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/NewAuthContext';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { FullPageLoader } from './components/ui/FullPageLoader';
import { Header } from '@/components/Header';
import { NavigationSetup } from '@/components/NavigationSetup';

// Lazy load pages
const Index = lazy(() => import('./pages/Index'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ReportActivityPage = lazy(() => import('./pages/ReportActivityPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./components/Login'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminObservations = lazy(() => import('./pages/AdminObservations'));
const AdminStatistics = lazy(() => import('./pages/AdminStatistics'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminNotifications = lazy(() => import('./pages/AdminNotifications'));

class ErrorBoundary extends Component<{ children: ReactNode, fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode, fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

const ProtectedLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <NavigationSetup />
    <main className="flex-grow container mx-auto p-4">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const router = createHashRouter([
  {
    path: '/login',
    element: <Suspense fallback={<FullPageLoader />}><Login /></Suspense>,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          { index: true, element: <Suspense fallback={<FullPageLoader />}><Index /></Suspense> },
          { path: 'report-activity', element: <Suspense fallback={<FullPageLoader />}><ReportActivityPage /></Suspense> },
          { path: 'dashboard', element: (
            <ErrorBoundary fallback={<div>Failed to load dashboard. Please try refreshing the page.</div>}>
              <Suspense fallback={<FullPageLoader />}>
                <Dashboard />
              </Suspense>
            </ErrorBoundary>
          )},
          {
            path: 'admin',
            element: <Suspense fallback={<FullPageLoader />}><Admin /></Suspense>
          },
          {
            path: 'admin/users',
            element: <Suspense fallback={<FullPageLoader />}><AdminUsers /></Suspense>
          },
          {
            path: 'admin/observations',
            element: <Suspense fallback={<FullPageLoader />}><AdminObservations /></Suspense>
          },
          {
            path: 'admin/statistics',
            element: <Suspense fallback={<FullPageLoader />}><AdminStatistics /></Suspense>
          },
          {
            path: 'admin/settings',
            element: <Suspense fallback={<FullPageLoader />}><AdminSettings /></Suspense>
          },
          {
            path: 'admin/notifications',
            element: <Suspense fallback={<FullPageLoader />}><AdminNotifications /></Suspense>
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Suspense fallback={<FullPageLoader />}><NotFound /></Suspense>,
  },
]);

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        {children}
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const AppContent: React.FC = () => {
  return <RouterProvider router={router} />;
};

const App: React.FC = () => (
  <AppProviders>
    <AppContent />
  </AppProviders>
);

export default App;
