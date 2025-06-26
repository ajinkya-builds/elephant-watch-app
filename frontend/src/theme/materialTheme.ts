import { createTheme } from '@mui/material/styles';

// Modern minimalist Material Design 3 color scheme with refined blue-green theme
const materialTheme = createTheme({
  palette: {
    // Primary color (Blue) - updated for minimalist style
    primary: {
      main: '#1a73e8', // Primary blue - maintained for brand consistency
      light: '#7eb6ff', // Lighter blue - more vibrant
      dark: '#0d4b8c', // Darker blue - richer for contrast
      contrastText: '#FFFFFF',
    },
    // Secondary color (Green) - refined
    secondary: {
      main: '#0b8043', // Primary green - maintained for brand consistency
      light: '#87caac', // Softer green for subtle highlights
      dark: '#09683a', // Deeper green for contrast
      contrastText: '#FFFFFF',
    },
    // Accent color (Teal) - new complementary color
    info: {
      main: '#00a0b0', // Teal accent
      light: '#80d2db', // Light teal
      dark: '#00778a', // Dark teal
      contrastText: '#FFFFFF',
    },
    // Error colors - refined for minimalist design
    error: {
      main: '#d32f2f', // Red 700
      light: '#ef5350', // Red 400
      dark: '#c62828', // Red 800
      contrastText: '#FFFFFF',
    },
    // Warning colors - more subtle
    warning: {
      main: '#ed6c02', // Orange 700
      light: '#ff9800', // Orange 500
      dark: '#e65100', // Orange 900
      contrastText: '#FFFFFF',
    },
    // Success colors (using refined secondary green)
    success: {
      main: '#0b8043', // Same as secondary
      light: '#87caac', // Softer green
      dark: '#09683a', // Deeper green
      contrastText: '#FFFFFF',
    },
    // Background and surface colors - cleaner for minimalist approach
    background: {
      default: '#f8fafc', // Clean light gray-blue
      paper: '#FFFFFF',
    },
    // Text colors - high contrast for readability
    text: {
      primary: '#1c2434', // Deeper gray for better contrast
      secondary: '#4b5563', // Gray-600
      disabled: '#9ca3af', // Gray-400
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'system-ui',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.625rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.375rem',
      fontWeight: 600,
      letterSpacing: '-0.0125em',
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12, // Increased border radius for more modern feel
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          boxShadow: 'none',
          padding: '10px 20px',
          transition: 'all 0.2s ease',
          fontWeight: 500,
          letterSpacing: '0.01em',
          '&:hover': {
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #1a73e8 30%, #0b8043 90%)',
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            fontWeight: 500,
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1a73e8',
              borderWidth: 2,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#7eb6ff',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
          padding: 20,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&:hover': {
            backgroundColor: 'rgba(26, 115, 232, 0.06)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRightWidth: 0,
          boxShadow: '4px 0px 16px rgba(0, 0, 0, 0.06)',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          '&.MuiChip-filled': {
            background: 'rgba(26, 115, 232, 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.06)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          color: '#1c2434',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          height: 68,
          boxShadow: '0px -1px 4px rgba(0, 0, 0, 0.06)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#4B5563',
          '&.Mui-selected': {
            color: '#1a73e8',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
          background: 'linear-gradient(45deg, #1a73e8 30%, #0b8043 90%)',
          color: '#FFFFFF',
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.16)',
            transform: 'translateY(-2px)',
          },
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          padding: 8,
        },
        thumb: {
          boxShadow: 'none',
        },
      },
    },
  },
});

export default materialTheme;
