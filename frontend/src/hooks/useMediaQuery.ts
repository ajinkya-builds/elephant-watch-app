import { useState, useEffect, useCallback } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

type BreakpointValues = {
  [key in Breakpoint]: string;
};

const defaultBreakpoints: BreakpointValues = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * A custom hook that tracks if a media query matches the current viewport.
 * 
 * @param query - The media query string or a breakpoint key
 * @param breakpoints - Optional custom breakpoints object
 * @returns boolean - Whether the media query matches
 * 
 * @example
 * // Using a media query string
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * 
 * @example
 * // Using a breakpoint key (defaults to min-width)
 * const isDesktop = useMediaQuery('lg');
 * 
 * @example
 * // Using max-width with breakpoint
 * const isSmallScreen = useMediaQuery({ max: 'md' });
 * 
 * @example
 * // Using range
 * const isTablet = useMediaQuery({ min: 'sm', max: 'lg' });
 * 
 * @example
 * // With custom breakpoints
 * const customBreakpoints = {
 *   mobile: '0px',
 *   tablet: '768px',
 *   desktop: '1024px',
 * };
 * const isTablet = useMediaQuery('tablet', customBreakpoints);
 */
export function useMediaQuery(
  query: string | { min?: Breakpoint | string; max?: Breakpoint | string } | Breakpoint,
  breakpoints: Record<string, string> = defaultBreakpoints
): boolean {
  // Convert query to media query string
  const getMediaQuery = useCallback(() => {
    // If query is a string and not a media query, assume it's a breakpoint
    if (typeof query === 'string' && !query.includes('(')) {
      const breakpoint = query as Breakpoint;
      return `(min-width: ${breakpoints[breakpoint] || breakpoint})`;
    }

    // If query is an object with min/max
    if (typeof query === 'object') {
      const { min, max } = query;
      const minWidth = min ? `(min-width: ${breakpoints[min as Breakpoint] || min})` : '';
      const maxWidth = max ? `(max-width: ${breakpoints[max as Breakpoint] || max})` : '';
      
      if (minWidth && maxWidth) {
        return `${minWidth} and ${maxWidth}`;
      }
      return minWidth || maxWidth;
    }

    // Otherwise, assume it's a valid media query string
    return query;
  }, [query, breakpoints]);

  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = getMediaQuery();
    
    // Skip if we're in a non-browser environment (SSR)
    if (typeof window === 'undefined') {
      return;
    }

    // Create MediaQueryList object
    const media = window.matchMedia(mediaQuery);
    
    // Set initial value
    setMatches(media.matches);
    
    // Create event listener callback
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add listener for changes
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }
    
    // Clean up
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [getMediaQuery]);

  return matches;
}

/**
 * A hook that returns the current breakpoint based on the viewport width.
 * 
 * @param breakpoints - Optional custom breakpoints
 * @returns The current breakpoint key
 * 
 * @example
 * const breakpoint = useBreakpoint();
 * // Returns 'sm', 'md', 'lg', etc.
 */
export function useBreakpoint(
  breakpoints: Record<string, string> = defaultBreakpoints
): string | null {
  const [breakpoint, setBreakpoint] = useState<string | null>(null);
  
  // Sort breakpoints from largest to smallest
  const sortedBreakpoints = Object.entries(breakpoints)
    .sort((a, b) => {
      const aValue = parseInt(a[1], 10);
      const bValue = parseInt(b[1], 10);
      return bValue - aValue;
    });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      let currentBreakpoint: string | null = null;

      // Find the largest breakpoint that matches
      for (const [key, value] of sortedBreakpoints) {
        const breakpointWidth = parseInt(value, 10);
        if (width >= breakpointWidth) {
          currentBreakpoint = key;
          break;
        }
      }

      setBreakpoint(currentBreakpoint);
    };

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sortedBreakpoints]);

  return breakpoint;
}

/**
 * A hook that returns an object with boolean values for each breakpoint
 * indicating whether the current viewport matches that breakpoint.
 * 
 * @param breakpoints - Optional custom breakpoints
 * @returns An object with boolean values for each breakpoint
 * 
 * @example
 * const { sm, md, lg } = useBreakpoints();
 * // { xs: false, sm: true, md: false, lg: false, xl: false, '2xl': false }
 */
export function useBreakpoints(
  breakpoints: Record<string, string> = defaultBreakpoints
): Record<string, boolean> {
  const [matches, setMatches] = useState<Record<string, boolean>>({}); 

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueries = Object.entries(breakpoints).map(([key, value]) => ({
      key,
      media: window.matchMedia(`(min-width: ${value})`),
    }));

    const updateMatches = () => {
      const newMatches: Record<string, boolean> = {};
      mediaQueries.forEach(({ key, media }) => {
        newMatches[key] = media.matches;
      });
      setMatches(newMatches);
    };

    // Initial update
    updateMatches();

    // Add listeners
    mediaQueries.forEach(({ media }) => {
      if (media.addEventListener) {
        media.addEventListener('change', updateMatches);
      } else {
        media.addListener(updateMatches);
      }
    });

    // Clean up
    return () => {
      mediaQueries.forEach(({ media }) => {
        if (media.removeEventListener) {
          media.removeEventListener('change', updateMatches);
        } else {
          media.removeListener(updateMatches);
        }
      });
    };
  }, [breakpoints]);

  return matches;
}
