
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * AndroidBottomNavigation component
 * 
 * This component implements an Android-style bottom navigation bar
 * using Tailwind CSS to mimic Material Design principles
 */
export function AndroidBottomNavigation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to determine if a route is active
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  // Navigation items
  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
          <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
        </svg>
      ),
      active: true,
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3V6ZM3 15.75a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.25Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3v-2.25Z" clipRule="evenodd" />
        </svg>
      ),
      active: user?.role !== 'data_collector',
    },
    {
      name: 'Report',
      path: '/report-activity',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
        </svg>
      ),
      active: true,
    },
    {
      name: 'Map',
      path: '/map',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
        </svg>
      ),
      active: true,
    }
  ];

  // Filter out inactive items (e.g., Dashboard for data collectors)
  const filteredNavItems = navItems.filter(item => item.active);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-surface-container-high dark:bg-surface-container-high-dark border-t border-outline-variant shadow-sm z-50">
      <div className="flex justify-around">
        {filteredNavItems.map((item) => {
          const active = isActive(item.path);
          
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-4 relative focus:outline-none transition-all duration-200 ${
                active 
                  ? 'text-primary dark:text-primary-dark' 
                  : 'text-on-surface-variant dark:text-on-surface-variant-dark hover:bg-on-surface/5 active:bg-on-surface/10'
              }`}
              aria-label={item.name}
              aria-current={active ? 'page' : undefined}
            >
              <div className={`p-1.5 rounded-full transition-colors ${
                active 
                  ? 'bg-secondary-container text-on-secondary-container' 
                  : 'text-on-surface-variant dark:text-on-surface-variant-dark'
              }`}>
                {item.icon}
              </div>
              <span className="text-xs font-medium mt-0.5">{item.name}</span>
              
              {/* Material Design 3 selection indicator */}
              {active && (
                <div className="absolute bottom-0 left-1/4 w-1/2 h-0.5 bg-primary dark:bg-primary-dark rounded-t-full"/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
