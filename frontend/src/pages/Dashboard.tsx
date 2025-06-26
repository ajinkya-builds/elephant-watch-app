import { motion, AnimatePresence } from "framer-motion";
import { AndroidCard } from "@/components/ui/android-card";
import { useAndroidTheme } from "@/theme/AndroidThemeProvider";
import { Activity, AlertTriangle, BarChart2, Calendar, MapPin, Users, Plus, Sun, Moon } from "lucide-react";
import React from 'react';
import { Link } from 'react-router-dom';
import { EnhancedDashboard } from '@/components/EnhancedDashboard';

interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  href: string;
  bgColor: string;
  textColor: string;
}

interface ActivityItem {
  id: number;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}

// Stats data
const stats: StatItem[] = [
  { 
    label: 'Active Elephants', 
    value: '24', 
    icon: <Activity className="h-5 w-5 text-emerald-500" />, 
    change: '+12%', 
    changeType: 'positive' 
  },
  { 
    label: 'Alerts Today', 
    value: '5', 
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, 
    change: '-2', 
    changeType: 'negative' 
  },
  { 
    label: 'Ranger Patrols', 
    value: '8', 
    icon: <Users className="h-5 w-5 text-blue-500" />, 
    change: '+3', 
    changeType: 'positive' 
  },
  { 
    label: 'Areas Monitored', 
    value: '15', 
    icon: <MapPin className="h-5 w-5 text-violet-500" />, 
    change: '0', 
    changeType: 'neutral' 
  },
];

// Quick actions data
const quickActions: QuickAction[] = [
  { 
    label: 'New Sighting', 
    icon: <Plus className="h-5 w-5" />, 
    href: '/report',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    textColor: 'text-emerald-600 dark:text-emerald-400'
  },
  { 
    label: 'View Map', 
    icon: <MapPin className="h-5 w-5" />, 
    href: '/map',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  { 
    label: 'Reports', 
    icon: <BarChart2 className="h-5 w-5" />, 
    href: '/reports',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-600 dark:text-purple-400'
  },
  { 
    label: 'Schedule', 
    icon: <Calendar className="h-5 w-5" />, 
    href: '/schedule',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-600 dark:text-amber-400'
  },
];

// Recent activity data
const recentActivity: ActivityItem[] = [
  {
    id: 1,
    type: 'sighting',
    title: 'New elephant sighting',
    description: 'Herd of 5 elephants spotted near the river',
    time: '10 minutes ago',
    icon: <Activity className="h-4 w-4 text-emerald-500" />
  },
  {
    id: 2,
    type: 'alert',
    title: 'Security alert',
    description: 'Unusual movement detected in zone 4B',
    time: '1 hour ago',
    icon: <AlertTriangle className="h-4 w-4 text-amber-500" />
  },
  {
    id: 3,
    type: 'patrol',
    title: 'Patrol completed',
    description: 'Ranger team completed morning patrol',
    time: '2 hours ago',
    icon: <Users className="h-4 w-4 text-blue-500" />
  }
];

export default function Dashboard() {
  const { theme, toggleDarkMode } = useAndroidTheme();
  const isDark = theme.isDark;

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const handleQuickAction = (action: string) => {
    console.log('Action:', action);
    // Handle quick action click
  };
  
  // State to control dashboard view
  const [showEnhancedDashboard, setShowEnhancedDashboard] = React.useState(true);

  // Helper function to render stats cards
  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <AndroidCard className="h-full">
            <div className="flex items-start justify-between p-6">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
                <div className={`mt-2 flex items-center text-sm ${
                  stat.changeType === 'positive' ? 'text-emerald-600 dark:text-emerald-400' :
                  stat.changeType === 'negative' ? 'text-rose-600 dark:text-rose-400' :
                  'text-slate-500 dark:text-slate-400'
                }`}>
                  {stat.change}
                  {stat.changeType === 'positive' && (
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                  {stat.changeType === 'negative' && (
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${stat.changeType === 'positive' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                stat.changeType === 'negative' ? 'bg-rose-100 dark:bg-rose-900/30' :
                'bg-slate-100 dark:bg-slate-800/50'}`}>
                {stat.icon}
              </div>
            </div>
          </AndroidCard>
        </motion.div>
      ))}
    </div>
  );

  // Render quick actions
  const renderQuickActions = () => (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <Link
              to={action.href}
              className={`flex flex-col items-center justify-center p-6 rounded-xl transition-all ${action.bgColor} ${action.textColor} hover:shadow-md`}
              onClick={() => handleQuickAction(action.label)}
            >
              <div className="p-3 rounded-full bg-white/20 mb-3">
                {action.icon}
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Render recent activity
  const renderRecentActivity = () => (
    <div>
      <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {recentActivity.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start p-4 rounded-xl bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`p-2 rounded-lg ${
              activity.type === 'sighting' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
              activity.type === 'alert' ? 'bg-amber-100 dark:bg-amber-900/30' :
              'bg-blue-100 dark:bg-blue-900/30'
            }`}>
              {activity.icon}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-medium text-slate-900 dark:text-white">{activity.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{activity.description}</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-950/80 p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Elephant Watch Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">{currentDate}</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </button>
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            U
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="space-y-8">
        {/* Dashboard Toggle */}
        <div className="flex justify-end">
          <button 
            onClick={() => setShowEnhancedDashboard(!showEnhancedDashboard)}
            className={`px-4 py-2 rounded-lg transition-all ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
          >
            {showEnhancedDashboard ? 'Show Simple Dashboard' : 'Show Enhanced Dashboard'}
          </button>
        </div>
        
        {showEnhancedDashboard ? (
          /* Enhanced Dashboard with Map and Metrics */
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <EnhancedDashboard />
          </div>
        ) : (
          /* Original Dashboard Content */
          <>
            {/* Stats Grid */}
            {renderStats()}
            
            {/* Quick Actions */}
            {renderQuickActions()}
            
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {renderRecentActivity()}
              </div>
              
              {/* Status Overview */}
              <div>
                <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">System Status</h2>
                <div className="space-y-4">
                  <AndroidCard className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">Camera System</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">All cameras operational</p>
                      </div>
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                    </div>
                  </AndroidCard>
                  
                  <AndroidCard className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">Sensors</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">24/25 active</p>
                      </div>
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500"></div>
                    </div>
                  </AndroidCard>
                  
                  <AndroidCard className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">Network</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Stable connection</p>
                      </div>
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                    </div>
                  </AndroidCard>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} Elephant Watch. All rights reserved.</p>
      </footer>
    </div>
  );
}
