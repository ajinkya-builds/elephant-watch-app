import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, useTheme } from '@mui/material';
import { 
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  AddCircleOutline as AddIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function MaterialBottomNavigation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Current active route
  const getCurrentValue = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path === '/dashboard') return 1;
    if (path === '/report') return 2;
    if (path.startsWith('/map')) return 3;
    return 0; // Default to home
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        elevation: 3,
        zIndex: theme.zIndex.appBar - 1,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
        boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.05)',
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={(_, newValue) => {
          switch(newValue) {
            case 0:
              navigate('/');
              break;
            case 1:
              navigate('/dashboard');
              break;
            case 2:
              navigate('/report');
              break;
            case 3:
              navigate('/map');
              break;
            default:
              navigate('/');
          }
        }}
        sx={{
          height: 64, // Standard Android height
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 0',
            color: 'text.secondary',
            '&.Mui-selected': {
              fontSize: '0.75rem',
              color: 'primary.main',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem',
            '&.Mui-selected': {
              fontSize: '0.65rem',
            },
          },
        }}
      >
        <BottomNavigationAction 
          label="Home" 
          icon={<HomeIcon />}
          sx={{
            borderRadius: '16px 16px 0 0',
            transition: 'all 0.2s',
            '&.Mui-selected': {
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '25%',
                width: '50%',
                height: 3,
                borderRadius: '2px 2px 0 0',
                backgroundColor: 'primary.main',
              }
            }
          }}
        />
        
        {/* Only show Dashboard for non-data collectors */}
        {user?.role !== 'data_collector' && (
          <BottomNavigationAction 
            label="Dashboard" 
            icon={<DashboardIcon />}
            sx={{
              borderRadius: '16px 16px 0 0',
              transition: 'all 0.2s',
              '&.Mui-selected': {
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '25%',
                  width: '50%',
                  height: 3,
                  borderRadius: '2px 2px 0 0',
                  backgroundColor: 'primary.main',
                }
              }
            }}
          />
        )}
        
        <BottomNavigationAction 
          label="Report" 
          icon={<AddIcon />}
          sx={{
            borderRadius: '16px 16px 0 0',
            transition: 'all 0.2s',
            '&.Mui-selected': {
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '25%',
                width: '50%',
                height: 3,
                borderRadius: '2px 2px 0 0',
                backgroundColor: 'primary.main',
              }
            }
          }}
        />
        
        <BottomNavigationAction 
          label="Map" 
          icon={<MapIcon />}
          sx={{
            borderRadius: '16px 16px 0 0',
            transition: 'all 0.2s',
            '&.Mui-selected': {
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '25%',
                width: '50%',
                height: 3,
                borderRadius: '2px 2px 0 0',
                backgroundColor: 'primary.main',
              }
            }
          }}
        />
      </BottomNavigation>
    </Paper>
  );
}
