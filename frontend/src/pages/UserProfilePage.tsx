import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/NewAuthContext';
import { AndroidCard } from '@/components/ui/android-card';
import { useAndroidTheme } from '@/theme/AndroidThemeProvider';
import { cn } from '@/lib/utils';
import { applyThemeClasses } from '@/theme/AndroidThemeUtils';
import { LogOut, User, Settings, HelpCircle, Lock } from 'lucide-react';

export default function UserProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme } = useAndroidTheme();

  const containerClasses = applyThemeClasses(theme, 'bg-background text-onBackground');
  const cardClasses = applyThemeClasses(theme, 'bg-surface text-onSurface');
  const headerClasses = applyThemeClasses(theme, 'text-primary');

  const menuItems = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: <User className="w-5 h-5" />,
      onClick: () => navigate('/user-profile/edit'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      onClick: () => navigate('/settings'),
    },
    {
      id: 'privacy',
      label: 'Privacy & Security',
      icon: <Lock className="w-5 h-5" />,
      onClick: () => navigate('/privacy'),
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: <HelpCircle className="w-5 h-5" />,
      onClick: () => navigate('/help'),
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: <LogOut className="w-5 h-5" />,
      onClick: async () => {
        await signOut();
        navigate('/login');
      },
      isDanger: true,
    },
  ];

  return (
    <div className={cn("min-h-screen p-4 md:p-8 bg-gradient-to-b from-[#f8fafc] to-[#e8f1fe]/30", containerClasses)}>
      <div className="max-w-md mx-auto">
        <h1 className={cn("text-2xl font-light tracking-tight mb-8", headerClasses)}>Account</h1>
        
        <AndroidCard className={cn("mb-8 overflow-hidden border-0 shadow-md", cardClasses)}>
          <div className="p-8">
            <div className="flex items-center gap-6 mb-2">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-light bg-white/80 shadow-sm border border-primary/10 backdrop-blur-sm",
                applyThemeClasses(theme, 'text-primary')
              )}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className={cn("text-xl font-normal mb-1", headerClasses)}>
                  {user?.email || 'User'}
                </h2>
                <p className={cn("text-sm py-1 px-3 rounded-full inline-block", applyThemeClasses(theme, 'bg-primaryContainer/30 text-onPrimaryContainer'))}>
                  {user?.role ? user.role.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ') : 'User'}
                </p>
              </div>
            </div>
          </div>
        </AndroidCard>

        <AndroidCard className={cn("overflow-hidden border border-gray-200 dark:border-gray-800", cardClasses)}>
          {menuItems.map((item, index) => (
            <div 
              key={item.id}
              onClick={item.onClick}
              className={cn(
                "flex items-center px-6 py-5 cursor-pointer transition-all duration-200",
                index !== 0 && "border-t border-gray-100 dark:border-gray-800",
                item.isDanger 
                  ? "hover:bg-error/5 text-error"
                  : "hover:bg-primary/5"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-sm",
                item.isDanger 
                  ? "bg-white border border-error/10 text-error" 
                  : "bg-white/80 border border-primary/10 text-primary"
              )}>
                {item.icon}
              </div>
              <span className={cn("flex-1 text-base", item.isDanger ? 'font-medium text-error' : 'font-normal')}>
                {item.label}
              </span>
              {!item.isDanger && (
                <span className={cn("text-lg opacity-60", applyThemeClasses(theme, 'text-onSurfaceVariant'))}>
                  ›
                </span>
              )}
            </div>
          ))}
        </AndroidCard>
      </div>
    </div>
  );
}
