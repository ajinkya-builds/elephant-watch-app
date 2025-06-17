import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

type UseLocalStorageResult<T> = [T, (value: SetValue<T>) => void, () => void];

/**
 * A custom hook that persists state to localStorage and syncs it between tabs/windows.
 * 
 * @param key - The key under which to store the value in localStorage
 * @param initialValue - The initial value to use if no value exists in localStorage
 * @returns [storedValue, setValue, removeValue] - The stored value, a function to update it, and a function to remove it
 * 
 * @example
 * // Basic usage
 * const [name, setName] = useLocalStorage('username', 'Guest');
 * 
 * @example
 * // With object value
 * const [user, setUser] = useLocalStorage('user', { id: 1, name: 'John' });
 * 
 * @example
 * // With removal
 * const [theme, setTheme, clearTheme] = useLocalStorage('theme', 'light');
 * // ...
 * <button onClick={() => clearTheme()}>Reset to default</button>
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageResult<T> {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      const parsed = item ? parseJSON<T>(item) : initialValue;
      return parsed ?? initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save to state
        setStoredValue(valueToStore);
        
        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          
          // Notify other components using this hook that the value changed
          window.dispatchEvent(
            new StorageEvent('local-storage', {
              key,
              newValue: JSON.stringify(valueToStore),
            })
          );
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove the value from localStorage and reset to initial value
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
        
        // Notify other components using this hook that the value was removed
        window.dispatchEvent(
          new StorageEvent('local-storage', {
            key,
            newValue: null,
          })
        );
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [initialValue, key]);

  // Sync changes across tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent | CustomEvent) => {
      if ((event as StorageEvent).key && (event as StorageEvent).key !== key) {
        return;
      }
      
      // Handle both StorageEvent (from other tabs) and our custom event
      const newValue = (event as StorageEvent).newValue || 
                     (event as CustomEvent).detail?.newValue;
      
      if (newValue === null) {
        setStoredValue(initialValue);
      } else {
        setStoredValue(parseJSON(newValue) || initialValue);
      }
    };

    // Listen for changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for our custom event (triggered by setValue)
    window.addEventListener('local-storage', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange as EventListener);
    };
  }, [initialValue, key]);

  return [storedValue, setValue, removeValue] as const;
}

// A wrapper for JSON.parse that handles undefined and throws on invalid JSON
function parseJSON<T>(value: string | null): T | undefined {
  try {
    return value === 'undefined' ? undefined : JSON.parse(value ?? '');
  } catch {
    console.log('parsing error on', { value });
    return undefined;
  }
}

/**
 * A custom hook that returns a function to check if a key exists in localStorage
 * @returns A function that checks if a key exists in localStorage
 * 
 * @example
 * const hasKey = useHasLocalStorageKey();
 * // ...
 * if (hasKey('userToken')) {
 *   // Do something
 * }
 */
export function useHasLocalStorageKey() {
  return useCallback((key: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      return window.localStorage.getItem(key) !== null;
    } catch (error) {
      console.warn(`Error checking for localStorage key "${key}":`, error);
      return false;
    }
  }, []);
}

/**
 * A custom hook that returns all keys in localStorage
 * @returns An array of all keys in localStorage
 * 
 * @example
 * const keys = useLocalStorageKeys();
 * // keys = ['user', 'theme', 'settings']
 */
export function useLocalStorageKeys(): string[] {
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      setKeys(Object.keys(window.localStorage));
      
      const handleStorageChange = () => {
        setKeys(Object.keys(window.localStorage));
      };
      
      // Listen for changes to localStorage
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    } catch (error) {
      console.warn('Error reading localStorage keys:', error);
    }
  }, []);

  return keys;
}
