import { useNavigate } from "react-router-dom";
import { Users, FileText, Settings, Activity, AlertCircle } from "lucide-react";
import { AndroidCard } from "@/components/ui/android-card";
import { useAndroidTheme } from "@/theme/AndroidThemeProvider";
import { applyThemeClasses } from "@/theme/AndroidThemeUtils";
import { cn } from "@/lib/utils";

const adminCards = [
  {
    title: "User Management",
    description: "Add, edit, or remove users. Assign roles and manage permissions.",
    icon: <Users className="h-6 w-6" />,
    onClick: (navigate: any) => navigate('users'),
    color: "primary",
  },
  {
    title: "Observation & Report Management",
    description: "View, edit, or delete observations and reports submitted by users.",
    icon: <FileText className="h-6 w-6" />,
    onClick: (navigate: any) => navigate('observations'),
    color: "secondary",
  },
  {
    title: "System Settings",
    description: "Configure system settings, notifications, and maintenance.",
    icon: <Settings className="h-6 w-6" />,
    onClick: (navigate: any) => navigate('settings'),
    color: "tertiary",
  },
  {
    title: "Activity Dashboard",
    description: "View detailed statistics and activity reports.",
    icon: <Activity className="h-6 w-6" />,
    onClick: (navigate: any) => navigate('statistics'),
    color: "primary",
  },
  {
    title: "Alerts & Notifications",
    description: "Manage system alerts and notification settings.",
    icon: <AlertCircle className="h-6 w-6" />,
    onClick: (navigate: any) => navigate('notifications'),
    color: "secondary",
  },
];

export default function Admin() {
  const navigate = useNavigate();
  const { theme } = useAndroidTheme();
  
  // Apply Android theme styling
  const containerClasses = applyThemeClasses(theme, 'bg-background text-onBackground');
  const headerClasses = applyThemeClasses(theme, 'text-onSurface');
  const subtitleClasses = applyThemeClasses(theme, 'text-onSurfaceVariant');
  
  return (
    <div className={cn("min-h-screen py-8 bg-gradient-to-b from-[#f8fafc] to-[#e8f1fe]/30", containerClasses)}>
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className={cn(theme.typography.displaySmall, headerClasses, "mb-3 font-light tracking-tight")}>
            Admin Panel
          </h1>
          <p className={cn(theme.typography.bodyLarge, subtitleClasses, "max-w-2xl opacity-80 text-gray-700 dark:text-gray-300")}>
            Manage your application's core functions and monitor system performance
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {adminCards.map((card) => (
            <AndroidCard
              key={card.title}
              variant="elevated"
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-lg border-0 shadow-md overflow-hidden",
                applyThemeClasses(theme, 'bg-surface text-onSurface')
              )}
              onClick={() => card.onClick(navigate)}
            >
              <AndroidCard.Header className="pb-2">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3.5 rounded-full bg-white/80 shadow-sm", 
                    `border border-${card.color}/10 text-${card.color}`
                  )}>
                    {card.icon}
                  </div>
                  <AndroidCard.Title className={theme.typography.titleLarge}>
                    {card.title}
                  </AndroidCard.Title>
                </div>
              </AndroidCard.Header>
              <AndroidCard.Content>
                <AndroidCard.Description className="text-gray-600 dark:text-gray-300 mb-4">
                  {card.description}
                </AndroidCard.Description>
              </AndroidCard.Content>
              <AndroidCard.Footer>
                <div className={cn(
                  "h-1.5 w-full rounded-full", 
                  `bg-${card.color} bg-opacity-80`
                )} />
              </AndroidCard.Footer>
            </AndroidCard>
          ))}
        </div>
      </div>
    </div>
  );
}
