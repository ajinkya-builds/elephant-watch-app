import React, { createContext, useContext, ReactNode } from 'react';

// Define the theme colors based on Material Design 3
export interface AndroidThemeColors {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  shadow: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
}

// Define the theme typography
export interface AndroidThemeTypography {
  fontFamily: string;
  displayLarge: string;
  displayMedium: string;
  displaySmall: string;
  headlineLarge: string;
  headlineMedium: string;
  headlineSmall: string;
  titleLarge: string;
  titleMedium: string;
  titleSmall: string;
  labelLarge: string;
  labelMedium: string;
  labelSmall: string;
  bodyLarge: string;
  bodyMedium: string;
  bodySmall: string;
}

// Define the theme shapes
export interface AndroidThemeShape {
  cornerSmall: string;
  cornerMedium: string;
  cornerLarge: string;
  cornerExtraLarge: string;
}

// Define the theme spacing
export interface AndroidThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

// Define the complete theme
export interface AndroidTheme {
  colors: AndroidThemeColors;
  typography: AndroidThemeTypography;
  shape: AndroidThemeShape;
  spacing: AndroidThemeSpacing;
  isDark: boolean;
}

// Default light theme
export const defaultLightTheme: AndroidTheme = {
  colors: {
    // Primary color (Blue) - refined for minimalist design
    primary: '#1a73e8',
    onPrimary: '#ffffff',
    primaryContainer: '#e8f1fe',
    onPrimaryContainer: '#0d3c78',
    
    // Secondary color (Green) - refined for minimalist design
    secondary: '#0b8043',
    onSecondary: '#ffffff',
    secondaryContainer: '#e6f5ed',
    onSecondaryContainer: '#07522b',
    
    // Tertiary color (Teal for subtle accents)
    tertiary: '#00a0b0',
    onTertiary: '#ffffff',
    tertiaryContainer: '#e0f7fa',
    onTertiaryContainer: '#006a75',
    
    // Error colors - refined
    error: '#dc2626',
    onError: '#ffffff',
    errorContainer: '#fee2e2',
    onErrorContainer: '#7f1d1d',
    
    // Background and surface colors - cleaner for minimalist approach
    background: '#f8fafc',
    onBackground: '#1c2434',
    surface: '#ffffff',
    onSurface: '#1c2434',
    surfaceVariant: '#f1f5f9',
    onSurfaceVariant: '#475569',
    outline: '#cbd5e1',
    shadow: 'rgba(0, 0, 0, 0.06)',
    inverseSurface: '#1c2434',
    inverseOnSurface: '#f8fafc',
    inversePrimary: '#7eb6ff',
  },
  typography: {
    fontFamily: 'Roboto, system-ui, sans-serif',
    displayLarge: 'text-6xl font-normal leading-tight tracking-tighter',
    displayMedium: 'text-5xl font-normal leading-tight tracking-tight',
    displaySmall: 'text-4xl font-normal leading-tight',
    headlineLarge: 'text-3xl font-normal leading-snug',
    headlineMedium: 'text-2xl font-normal leading-snug',
    headlineSmall: 'text-xl font-normal leading-snug',
    titleLarge: 'text-lg font-medium leading-normal',
    titleMedium: 'text-base font-medium leading-normal tracking-wide',
    titleSmall: 'text-sm font-medium leading-normal tracking-wide',
    labelLarge: 'text-sm font-medium leading-normal',
    labelMedium: 'text-xs font-medium leading-normal tracking-wide',
    labelSmall: 'text-[0.6875rem] font-medium leading-normal tracking-wide',
    bodyLarge: 'text-base font-normal leading-relaxed',
    bodyMedium: 'text-sm font-normal leading-relaxed',
    bodySmall: 'text-xs font-normal leading-relaxed',
  },
  shape: {
    cornerSmall: 'rounded',
    cornerMedium: 'rounded-md',
    cornerLarge: 'rounded-lg',
    cornerExtraLarge: 'rounded-xl',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  isDark: false,
};

// Default dark theme
export const defaultDarkTheme: AndroidTheme = {
  colors: {
    // Primary color (Blue) - Dark theme
    primary: '#8ab4f8',
    onPrimary: '#003785',
    primaryContainer: '#004aac',
    onPrimaryContainer: '#d6e2ff',
    
    // Secondary color (Green) - Dark theme
    secondary: '#a5d6a7',
    onSecondary: '#1b5e20',
    secondaryContainer: '#2e7d32',
    onSecondaryContainer: '#c8e6c9',
    
    // Tertiary color (Teal) - Dark theme
    tertiary: '#4db6ac',
    onTertiary: '#003731',
    tertiaryContainer: '#004f45',
    onTertiaryContainer: '#b2f5ea',
    
    // Error colors - Dark theme
    error: '#ffb4ab',
    onError: '#690005',
    errorContainer: '#93000a',
    onErrorContainer: '#ffdad6',
    
    // Background and surface colors - Dark theme
    background: '#121212',
    onBackground: '#e1e2e5',
    surface: '#191c1e',
    onSurface: '#e1e2e5',
    surfaceVariant: '#43474e',
    onSurfaceVariant: '#c3c7cf',
    outline: '#8d9199',
    shadow: '#000000',
    inverseSurface: '#e1e2e5',
    inverseOnSurface: '#2e3133',
    inversePrimary: '#006abc',
  },
  typography: {
    fontFamily: 'Roboto, system-ui, sans-serif',
    displayLarge: 'text-6xl font-normal leading-tight tracking-tighter',
    displayMedium: 'text-5xl font-normal leading-tight tracking-tight',
    displaySmall: 'text-4xl font-normal leading-tight',
    headlineLarge: 'text-3xl font-normal leading-snug',
    headlineMedium: 'text-2xl font-normal leading-snug',
    headlineSmall: 'text-xl font-normal leading-snug',
    titleLarge: 'text-lg font-medium leading-normal',
    titleMedium: 'text-base font-medium leading-normal tracking-wide',
    titleSmall: 'text-sm font-medium leading-normal tracking-wide',
    labelLarge: 'text-sm font-medium leading-normal',
    labelMedium: 'text-xs font-medium leading-normal tracking-wide',
    labelSmall: 'text-[0.6875rem] font-medium leading-normal tracking-wide',
    bodyLarge: 'text-base font-normal leading-relaxed',
    bodyMedium: 'text-sm font-normal leading-relaxed',
    bodySmall: 'text-xs font-normal leading-relaxed',
  },
  shape: {
    cornerSmall: 'rounded',
    cornerMedium: 'rounded-md',
    cornerLarge: 'rounded-lg',
    cornerExtraLarge: 'rounded-xl',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  isDark: true,
};

// Create theme context
interface ThemeContextType {
  theme: AndroidTheme;
  setTheme: (theme: AndroidTheme) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAndroidTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAndroidTheme must be used within an AndroidThemeProvider');
  }
  return context;
};

interface AndroidThemeProviderProps {
  children: ReactNode;
  initialTheme?: AndroidTheme;
}

export const AndroidThemeProvider: React.FC<AndroidThemeProviderProps> = ({
  children,
  initialTheme = defaultLightTheme,
}) => {
  const [theme, setTheme] = React.useState<AndroidTheme>(initialTheme);

  // Toggle between light and dark themes
  const toggleDarkMode = () => {
    setTheme(theme.isDark ? defaultLightTheme : defaultDarkTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleDarkMode }}>
      <div className={theme.isDark ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Helper to apply theme-based styling
export const withAndroidTheme = (
  Component: React.ComponentType<any>,
  styleFactory: (theme: AndroidTheme) => Record<string, string>
) => {
  return (props: any) => {
    const { theme } = useAndroidTheme();
    const themeStyles = styleFactory(theme);
    
    return <Component {...props} themeStyles={themeStyles} />;
  };
};
