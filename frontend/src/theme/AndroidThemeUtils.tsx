import { AndroidTheme } from './AndroidThemeProvider';
import { cn } from '@/lib/utils';

/**
 * AndroidThemeUtils
 * 
 * Utility functions to apply theme-based styling with Tailwind CSS
 */

/**
 * Maps theme color keys to corresponding Tailwind CSS classes
 */
export const getColorClass = (
  theme: AndroidTheme, 
  colorKey: keyof AndroidTheme['colors'], 
  type: 'text' | 'bg' | 'border' = 'bg'
): string => {
  // This is a simplified approach since we're using predefined Tailwind colors
  // In a real implementation with a custom design system, you'd use CSS variables
  
  const colorMap: Record<string, Record<string, string>> = {
    // Primary colors
    primary: { 
      bg: theme.isDark ? 'bg-blue-400' : 'bg-blue-600',
      text: theme.isDark ? 'text-blue-400' : 'text-blue-600',
      border: theme.isDark ? 'border-blue-400' : 'border-blue-600'
    },
    onPrimary: { 
      bg: 'bg-white',
      text: 'text-white',
      border: 'border-white'
    },
    primaryContainer: { 
      bg: theme.isDark ? 'bg-blue-900' : 'bg-blue-100',
      text: theme.isDark ? 'text-blue-900' : 'text-blue-100',
      border: theme.isDark ? 'border-blue-900' : 'border-blue-100'
    },
    onPrimaryContainer: { 
      bg: theme.isDark ? 'bg-blue-50' : 'bg-blue-900',
      text: theme.isDark ? 'text-blue-50' : 'text-blue-900',
      border: theme.isDark ? 'border-blue-50' : 'border-blue-900'
    },
    
    // Secondary colors
    secondary: { 
      bg: theme.isDark ? 'bg-slate-300' : 'bg-slate-600',
      text: theme.isDark ? 'text-slate-300' : 'text-slate-600',
      border: theme.isDark ? 'border-slate-300' : 'border-slate-600'
    },
    onSecondary: { 
      bg: 'bg-white',
      text: 'text-white',
      border: 'border-white'
    },
    secondaryContainer: { 
      bg: theme.isDark ? 'bg-slate-700' : 'bg-slate-100',
      text: theme.isDark ? 'text-slate-700' : 'text-slate-100',
      border: theme.isDark ? 'border-slate-700' : 'border-slate-100'
    },
    onSecondaryContainer: { 
      bg: theme.isDark ? 'bg-slate-100' : 'bg-slate-900',
      text: theme.isDark ? 'text-slate-100' : 'text-slate-900',
      border: theme.isDark ? 'border-slate-100' : 'border-slate-900'
    },
    
    // Error colors
    error: { 
      bg: theme.isDark ? 'bg-red-400' : 'bg-red-600',
      text: theme.isDark ? 'text-red-400' : 'text-red-600',
      border: theme.isDark ? 'border-red-400' : 'border-red-600'
    },
    onError: { 
      bg: 'bg-white',
      text: 'text-white',
      border: 'border-white'
    },
    errorContainer: { 
      bg: theme.isDark ? 'bg-red-900' : 'bg-red-100',
      text: theme.isDark ? 'text-red-900' : 'text-red-100',
      border: theme.isDark ? 'border-red-900' : 'border-red-100'
    },
    onErrorContainer: { 
      bg: theme.isDark ? 'bg-red-100' : 'bg-red-900',
      text: theme.isDark ? 'text-red-100' : 'text-red-900',
      border: theme.isDark ? 'border-red-100' : 'border-red-900'
    },
    
    // Background colors
    background: { 
      bg: theme.isDark ? 'bg-neutral-900' : 'bg-neutral-50',
      text: theme.isDark ? 'text-neutral-900' : 'text-neutral-50',
      border: theme.isDark ? 'border-neutral-900' : 'border-neutral-50'
    },
    onBackground: { 
      bg: theme.isDark ? 'bg-neutral-100' : 'bg-neutral-900',
      text: theme.isDark ? 'text-neutral-100' : 'text-neutral-900',
      border: theme.isDark ? 'border-neutral-100' : 'border-neutral-900'
    },
    surface: { 
      bg: theme.isDark ? 'bg-neutral-800' : 'bg-white',
      text: theme.isDark ? 'text-neutral-800' : 'text-white',
      border: theme.isDark ? 'border-neutral-800' : 'border-white'
    },
    onSurface: { 
      bg: theme.isDark ? 'bg-neutral-100' : 'bg-neutral-900',
      text: theme.isDark ? 'text-neutral-100' : 'text-neutral-900',
      border: theme.isDark ? 'border-neutral-100' : 'border-neutral-900'
    },
    surfaceVariant: { 
      bg: theme.isDark ? 'bg-neutral-700' : 'bg-neutral-100',
      text: theme.isDark ? 'text-neutral-700' : 'text-neutral-100',
      border: theme.isDark ? 'border-neutral-700' : 'border-neutral-100'
    },
    onSurfaceVariant: { 
      bg: theme.isDark ? 'bg-neutral-200' : 'bg-neutral-700',
      text: theme.isDark ? 'text-neutral-200' : 'text-neutral-700',
      border: theme.isDark ? 'border-neutral-200' : 'border-neutral-700'
    },
    outline: { 
      bg: theme.isDark ? 'bg-neutral-500' : 'bg-neutral-300',
      text: theme.isDark ? 'text-neutral-500' : 'text-neutral-300',
      border: theme.isDark ? 'border-neutral-500' : 'border-neutral-300'
    }
  };

  return colorMap[colorKey]?.[type] || '';
};

/**
 * Get typography class based on theme's typography variants
 */
export const getTypographyClass = (
  theme: AndroidTheme,
  variant: keyof AndroidTheme['typography']
): string => {
  return theme.typography[variant] || '';
};

/**
 * Apply elevation (shadow) based on Material Design elevation levels
 */
export const getElevationClass = (
  elevationLevel: 0 | 1 | 2 | 3 | 4 | 5
): string => {
  const elevationMap: Record<number, string> = {
    0: 'shadow-none',
    1: 'shadow-sm',
    2: 'shadow',
    3: 'shadow-md',
    4: 'shadow-lg',
    5: 'shadow-xl'
  };
  
  return elevationMap[elevationLevel] || 'shadow-none';
};

/**
 * Apply shape (corner radius) based on theme's shape definitions
 */
export const getShapeClass = (
  theme: AndroidTheme,
  shapeKey: keyof AndroidTheme['shape']
): string => {
  return theme.shape[shapeKey] || '';
};

/**
 * Apply spacing based on theme's spacing definitions
 */
export const getSpacingClass = (
  theme: AndroidTheme,
  type: 'p' | 'm' | 'gap',
  direction: 'x' | 'y' | 'l' | 'r' | 't' | 'b' | '',
  size: keyof AndroidTheme['spacing']
): string => {
  const directions: Record<string, string> = {
    '': '',
    'x': 'x',
    'y': 'y',
    'l': 'l',
    'r': 'r',
    't': 't',
    'b': 'b'
  };
  
  // Map to Tailwind classes like "px-4" or "mt-2"
  const spacing = theme.spacing[size].replace('rem', '');
  const spacingValue = parseFloat(spacing);
  
  // Convert to Tailwind spacing scale
  let tailwindValue = '0';
  if (spacingValue === 0.25) tailwindValue = '1';
  else if (spacingValue === 0.5) tailwindValue = '2';
  else if (spacingValue === 1) tailwindValue = '4';
  else if (spacingValue === 1.5) tailwindValue = '6';
  else if (spacingValue === 2) tailwindValue = '8';
  else if (spacingValue === 3) tailwindValue = '12';
  else if (spacingValue === 4) tailwindValue = '16';
  
  return `${type}${directions[direction]}-${tailwindValue}`;
};

/**
 * Apply theme-aware styling to components
 */
export const applyThemeClasses = (
  theme: AndroidTheme,
  baseClasses: string = '',
  options: {
    color?: keyof AndroidTheme['colors'];
    colorType?: 'bg' | 'text' | 'border';
    typography?: keyof AndroidTheme['typography'];
    elevation?: 0 | 1 | 2 | 3 | 4 | 5;
    shape?: keyof AndroidTheme['shape'];
    paddingX?: keyof AndroidTheme['spacing'];
    paddingY?: keyof AndroidTheme['spacing'];
    marginX?: keyof AndroidTheme['spacing'];
    marginY?: keyof AndroidTheme['spacing'];
  } = {}
): string => {
  const classes = [baseClasses];
  
  if (options.color) {
    classes.push(getColorClass(theme, options.color, options.colorType || 'bg'));
  }
  
  if (options.typography) {
    classes.push(getTypographyClass(theme, options.typography));
  }
  
  if (options.elevation !== undefined) {
    classes.push(getElevationClass(options.elevation));
  }
  
  if (options.shape) {
    classes.push(getShapeClass(theme, options.shape));
  }
  
  if (options.paddingX) {
    classes.push(getSpacingClass(theme, 'p', 'x', options.paddingX));
  }
  
  if (options.paddingY) {
    classes.push(getSpacingClass(theme, 'p', 'y', options.paddingY));
  }
  
  if (options.marginX) {
    classes.push(getSpacingClass(theme, 'm', 'x', options.marginX));
  }
  
  if (options.marginY) {
    classes.push(getSpacingClass(theme, 'm', 'y', options.marginY));
  }
  
  return cn(...classes);
};
