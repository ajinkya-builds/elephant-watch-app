import { useState, useEffect } from 'react';

/**
 * A custom hook that debounces a value.
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * // The effect will only run when the user stops typing for 500ms
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     fetchResults(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * A custom hook that debounces a callback function.
 * @param callback The callback function to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced callback
 * 
 * @example
 * const handleSearch = (query: string) => {
 *   console.log('Searching for:', query);
 *   // Your search logic here
 * };
 * 
 * const debouncedSearch = useDebounceCallback(handleSearch, 500);
 * 
 * // In your component:
 * <input 
 *   type="text" 
 *   onChange={(e) => debouncedSearch(e.target.value)}
 *   placeholder="Search..."
 * />
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const id = window.setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(id);
  };
}

/**
 * A custom hook that combines state with debouncing
 * @param initialValue The initial value
 * @param delay The delay in milliseconds
 * @returns [value, setValue, debouncedValue]
 * 
 * @example
 * const [searchTerm, setSearchTerm, debouncedSearchTerm] = useDebouncedState('', 500);
 * 
 * // The effect will only run when the user stops typing for 500ms
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     fetchResults(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 * 
 * // In your component:
 * <input 
 *   value={searchTerm}
 *   onChange={(e) => setSearchTerm(e.target.value)}
 *   placeholder="Search..."
 * />
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, (value: T) => void, T] {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(value, delay);

  return [value, setValue, debouncedValue];
}
