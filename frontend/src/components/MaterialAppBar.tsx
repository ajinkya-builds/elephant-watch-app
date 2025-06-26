import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  useTheme,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  WifiOff as WifiOffIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { NavigationDrawer } from './NavigationDrawer';
import { useNetworkStatus } from '@/utils/networkStatus';
import { toast } from "sonner";

export function MaterialAppBar() {
  const { user, signOut, isAdmin } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  
  // State for navigation drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // State for profile menu
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const profileMenuOpen = Boolean(profileAnchorEl);
  
  // State for notification menu (if you want to implement later)
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const notifMenuOpen = Boolean(notifAnchorEl);

  // Handle drawer toggle
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Handle profile menu
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };
  
  // Handle notification menu
  const handleNotifMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifMenuClose = () => {
    setNotifAnchorEl(null);
  };

  // Sign out handler (using the same logic as the original code)
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Logout button clicked');
    
    try {
      if (!isOnline) {
        toast.warning("Cannot log out while offline. Please reconnect to the internet and try again.", {
          duration: 5000
        });
        return;
      }
      
      console.log('Starting sign out process...');
      
      // Use the signOut method from the auth context
      await signOut();
      
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error("Sign out failed. Please try again.");
    }
  };

  // User avatar setup
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  
  const getRandomProfileColor = (email: string) => {
    const colors = [
      '#3B82F6', // blue-500
      '#10B981', // green-500
      '#EC4899', // pink-500
      '#8B5CF6', // purple-500
      '#F59E0B', // amber-500
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };
  
  const profileColor = user?.email ? getRandomProfileColor(user.email) : '#3B82F6';

  // Return null if no user (same as original implementation)
  if (!user) return null;

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          backgroundColor: 'background.paper',
          color: 'text.primary',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {/* Menu Icon */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: 2,
              color: 'text.primary',
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo and Title */}
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  position: 'relative', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: 32,
                  height: 32, 
                  mr: 1
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    inset: 0, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(to right, #3B82F6, #10B981)',
                    opacity: 0.3, 
                    filter: 'blur(4px)',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 0.3 },
                      '50%': { opacity: 0.5 },
                      '100%': { opacity: 0.3 },
                    }
                  }}
                />
                <img
                  src={`${import.meta.env.BASE_URL}elephant_photo.png`}
                  alt="Elephant Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative' }}
                />
              </Box>
              <Typography 
                variant="h6" 
                component="div"
                sx={{
                  background: 'linear-gradient(to right, #3B82F6, #10B981)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px'
                }}
              >
                Eravat
              </Typography>
            </Box>
          </Link>
          
          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Network Status Indicator */}
          {!isOnline && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'warning.main',
                mr: 2,
                px: 1.5,
                py: 0.5,
                bgcolor: 'warning.main',
                borderRadius: 8,
                opacity: 0.15
              }}
            >
              <WifiOffIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
              <Typography variant="caption" color="warning.main" fontWeight={500}>
                Offline
              </Typography>
            </Box>
          )}
          
          {/* Notifications Button */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit"
              onClick={handleNotifMenuOpen}
              size="large"
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Profile Button */}
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              aria-controls={profileMenuOpen ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={profileMenuOpen ? 'true' : undefined}
              sx={{ ml: 1 }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: profileColor,
                  fontSize: '0.875rem'
                }}
              >
                {userInitial}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      
      {/* Navigation Drawer */}
      <NavigationDrawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        onSignOut={handleSignOut}
      />
      
      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchorEl}
        id="account-menu"
        open={profileMenuOpen}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
            mt: 1.5,
            borderRadius: 2,
            minWidth: 220,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" noWrap>{user?.email || user?.phone}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {user?.role.replace('_', ' ')}
          </Typography>
        </Box>
        
        <Divider />
        
        {user?.role === 'admin' && (
          <div>
            <MenuItem onClick={() => navigate('/admin')}>
              <ListItemIcon>
                <DashboardIcon fontSize="small" />
              </ListItemIcon>
              Admin Dashboard
            </MenuItem>
            <MenuItem onClick={() => navigate('/admin/settings')}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
          </div>
        )}
        
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error.main">Sign out</Typography>
        </MenuItem>
      </Menu>
      
      {/* Toolbar spacer to prevent content from hiding behind AppBar */}
      <Toolbar />
    </>
  );
}
