import React from 'react';
import { 
  Drawer, 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Avatar, 
  Typography, 
  Divider, 
  IconButton
} from '@mui/material';
import { 
  Home, 
  Dashboard, 
  AddCircleOutline, 
  Settings, 
  Person, 
  Group, 
  Visibility, 
  BarChart, 
  Notifications, 
  ExitToApp, 
  ChevronLeft
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNetworkStatus } from '@/utils/networkStatus';
import WifiOffIcon from '@mui/icons-material/WifiOff';

interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  onSignOut: (e: React.MouseEvent) => Promise<void>;
}

export function NavigationDrawer({ open, onClose, onSignOut }: NavigationDrawerProps) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline } = useNetworkStatus();

  // Material Design standard drawer width
  const drawerWidth = 280;
  
  // User profile image (placeholder - can be replaced with actual user avatar if available)
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

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Navigation items with proper categorization
  const navItems = [
    { 
      path: '/', 
      label: 'Home', 
      icon: <Home />,
      visible: true 
    },
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: <Dashboard />,
      visible: user?.role !== 'data_collector' 
    },
    { 
      path: '/report', 
      label: 'Report Activity', 
      icon: <AddCircleOutline />,
      visible: true 
    }
  ];

  // Admin navigation items
  const adminItems = [
    { 
      path: '/admin', 
      label: 'Admin Dashboard', 
      icon: <Dashboard />,
      visible: isAdmin 
    },
    { 
      path: '/admin/users', 
      label: 'User Management', 
      icon: <Group />,
      visible: isAdmin 
    },
    { 
      path: '/admin/observations', 
      label: 'Observations', 
      icon: <Visibility />,
      visible: isAdmin 
    },
    { 
      path: '/admin/statistics', 
      label: 'Statistics', 
      icon: <BarChart />,
      visible: isAdmin 
    },
    { 
      path: '/admin/settings', 
      label: 'Settings', 
      icon: <Settings />,
      visible: isAdmin 
    },
    { 
      path: '/admin/notifications', 
      label: 'Notifications', 
      icon: <Notifications />,
      visible: isAdmin 
    }
  ];

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      sx={{
        '& .MuiDrawer-paper': { 
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRadius: '0 12px 12px 0', // Rounded corners on right side
          overflow: 'hidden'
        },
      }}
    >
      {/* Drawer Header with Close Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={onClose} edge="end" aria-label="close drawer">
          <ChevronLeft />
        </IconButton>
      </Box>
      
      {/* User Profile Section */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          p: 3, 
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          mb: 1
        }}
      >
        <Avatar 
          sx={{ 
            width: 72, 
            height: 72, 
            bgcolor: profileColor,
            fontSize: '2rem',
            mb: 2,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.12)'
          }}
        >
          {userInitial}
        </Avatar>
        
        <Typography variant="subtitle1" fontWeight={600}>{user?.email}</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              textTransform: 'capitalize',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {user?.role?.replace('_', ' ')}
            {!isOnline && (
              <>
                <Box component="span" sx={{ mx: 1 }}>•</Box>
                <WifiOffIcon sx={{ fontSize: '0.875rem', mr: 0.5 }} color="warning" />
                <Typography variant="body2" color="warning.main">Offline</Typography>
              </>
            )}
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Main Navigation Items */}
      <List sx={{ p: 1 }}>
        {navItems
          .filter(item => item.visible)
          .map((item) => (
            <ListItem 
              key={item.path} 
              disablePadding 
              sx={{ mb: 0.5 }}
              component={Link} 
              to={item.path}
              onClick={onClose}
            >
              <ListItemButton 
                selected={isActive(item.path)}
                sx={{
                  borderRadius: '12px',
                  py: 1.5,
                  pl: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white'
                    }
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))
        }
      </List>
      
      {/* Admin Section - Only visible for admin users */}
      {isAdmin && (
        <>
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ px: 3, py: 1 }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              fontWeight={600}
              sx={{ textTransform: 'uppercase' }}
            >
              Administration
            </Typography>
          </Box>
          
          <List sx={{ p: 1 }}>
            {adminItems
              .filter(item => item.visible)
              .map((item) => (
                <ListItem 
                  key={item.path} 
                  disablePadding 
                  sx={{ mb: 0.5 }}
                  component={Link} 
                  to={item.path}
                  onClick={onClose}
                >
                  <ListItemButton 
                    selected={isActive(item.path)}
                    sx={{
                      borderRadius: '12px',
                      py: 1.5,
                      pl: 2,
                      '&.Mui-selected': {
                        bgcolor: 'secondary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'secondary.dark',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white'
                        }
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))
            }
          </List>
        </>
      )}
      
      <Box sx={{ flexGrow: 1 }} />
      
      {/* Sign Out Option - at the bottom */}
      <List sx={{ p: 1 }}>
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={(e) => {
              onSignOut(e);
              onClose();
            }}
            sx={{ 
              borderRadius: '12px',
              py: 1.5,
              pl: 2,
              color: 'error.main'
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}
