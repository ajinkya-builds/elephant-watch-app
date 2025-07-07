import { useNavigate } from "react-router-dom";
import { Activity, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/NewAuthContext";
import { motion } from "framer-motion";
import { AndroidCard } from "@/components/ui/android-card";
import { AndroidButton } from "@/components/ui/android-button";
import { useAndroidTheme } from "@/theme/AndroidThemeProvider";
import { cn } from "@/lib/utils";
import { applyThemeClasses } from "@/theme/AndroidThemeUtils";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useAndroidTheme();

  const containerClasses = applyThemeClasses(theme, "bg-background text-onBackground");
  const headingClasses = applyThemeClasses(theme, "text-primary");
  const subheadingClasses = applyThemeClasses(theme, "text-onBackgroundVariant");

  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e8f1fe]/30", containerClasses)}>
      <div className="container mx-auto py-12 sm:py-16 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-20"
        >
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className={cn(
                "absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse",
                applyThemeClasses(theme, "bg-primary"))}></div>
              <div className="bg-white/80 rounded-full p-4 shadow-lg backdrop-blur-sm">
                <img 
                  src={`${import.meta.env.BASE_URL}elephant_photo.png`} 
                  alt="Elephant Logo" 
                  className="w-20 h-20 sm:w-28 sm:h-28 relative z-10 drop-shadow-sm" 
                />
              </div>
            </motion.div>
          </div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={cn(
              "text-5xl sm:text-6xl mb-4 sm:mb-6 font-light tracking-tight",
              theme.typography.displayMedium,
              headingClasses
            )}
          >
            Eravat
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={cn(
              "text-base sm:text-xl max-w-2xl mx-auto font-normal", 
              theme.typography.bodyLarge, 
              subheadingClasses
            )}
          >
            Advanced Elephant Monitoring & Conservation Platform
          </motion.p>
        </motion.div>

        {/* Admin Button - Only show for admin users */}
        {user && user.role !== 'data_collector' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-10 sm:mb-14 text-center"
          >
            <AndroidButton 
              variant="filled"
              onClick={() => navigate('/admin')}
              className="px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
            >
              Access Admin Panel
            </AndroidButton>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-10 max-w-5xl mx-auto"
        >
          <AndroidCard 
            variant="elevated" 
            interactive 
            className={cn(
              "overflow-hidden transition-all duration-300 border-0 shadow-md hover:shadow-lg", 
              applyThemeClasses(theme, "bg-surface text-onSurface")
            )}
            onClick={() => navigate("/dashboard")}
          >
            <AndroidCard.Header className="pb-2">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3.5 rounded-full bg-white/80 shadow-sm",
                  applyThemeClasses(theme, "text-primary border border-primary/10")
                )}>
                  <Activity className="w-5 h-5" />
                </div>
                <AndroidCard.Title className={theme.typography.titleLarge}>Dashboard</AndroidCard.Title>
              </div>
            </AndroidCard.Header>
            <AndroidCard.Content>
              <AndroidCard.Description className="mb-6 text-gray-600">
                View comprehensive statistics and recent observations in real-time
              </AndroidCard.Description>
              <AndroidButton 
                variant="filled"
                className="w-full rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </AndroidButton>
            </AndroidCard.Content>
          </AndroidCard>

          <AndroidCard 
            variant="elevated" 
            interactive
            className={cn(
              "overflow-hidden transition-all duration-300 border-0 shadow-md hover:shadow-lg",
              applyThemeClasses(theme, "bg-surface text-onSurface")
            )}
            onClick={() => navigate("/report-activity")}
          >
            <AndroidCard.Header className="pb-2">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3.5 rounded-full bg-white/80 shadow-sm",
                  applyThemeClasses(theme, "text-secondary border border-secondary/10")
                )}>
                  <MapPin className="w-5 h-5" />
                </div>
                <AndroidCard.Title className={theme.typography.titleLarge}>Report Activity</AndroidCard.Title>
              </div>
            </AndroidCard.Header>
            <AndroidCard.Content>
              <AndroidCard.Description className="mb-6 text-gray-600">
                Record new sightings, tracks, or other elephant activities
              </AndroidCard.Description>
              <AndroidButton 
                variant="filled"
                color="secondary"
                className="w-full rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => navigate("/report-activity")}
              >
                Report Activity
              </AndroidButton>
            </AndroidCard.Content>
          </AndroidCard>
        </motion.div>
      </div>
    </div>
  );
}