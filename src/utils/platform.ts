/**
 * Platform-specific utilities for handling Android and web differences
 */

// Check if running in Android WebView
export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for Android WebView user agent
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes('android') && userAgent.includes('wv');
};

// Check if running in a mobile browser
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
};

// Get platform-specific storage
export const getPlatformStorage = () => {
  if (isAndroid()) {
    // Use Android's native storage
    return {
      getItem: async (key: string) => {
        try {
          // @ts-ignore - Android interface
          return await window.Android.getStorageItem(key);
        } catch (e) {
          console.warn('Failed to get item from Android storage:', e);
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          // @ts-ignore - Android interface
          await window.Android.setStorageItem(key, value);
        } catch (e) {
          console.warn('Failed to set item in Android storage:', e);
        }
      },
      removeItem: async (key: string) => {
        try {
          // @ts-ignore - Android interface
          await window.Android.removeStorageItem(key);
        } catch (e) {
          console.warn('Failed to remove item from Android storage:', e);
        }
      }
    };
  }
  
  // Default to localStorage for web
  return {
    getItem: async (key: string) => localStorage.getItem(key),
    setItem: async (key: string, value: string) => localStorage.setItem(key, value),
    removeItem: async (key: string) => localStorage.removeItem(key)
  };
};

// Get platform-specific file system
export const getPlatformFileSystem = () => {
  if (isAndroid()) {
    return {
      saveFile: async (filename: string, data: string) => {
        try {
          // @ts-ignore - Android interface
          await window.Android.saveFile(filename, data);
          return true;
        } catch (e) {
          console.warn('Failed to save file in Android:', e);
          return false;
        }
      },
      readFile: async (filename: string) => {
        try {
          // @ts-ignore - Android interface
          return await window.Android.readFile(filename);
        } catch (e) {
          console.warn('Failed to read file from Android:', e);
          return null;
        }
      },
      deleteFile: async (filename: string) => {
        try {
          // @ts-ignore - Android interface
          await window.Android.deleteFile(filename);
          return true;
        } catch (e) {
          console.warn('Failed to delete file in Android:', e);
          return false;
        }
      }
    };
  }
  
  // Default to browser's File System Access API or fallback
  return {
    saveFile: async (filename: string, data: string) => {
      try {
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        return true;
      } catch (e) {
        console.warn('Failed to save file:', e);
        return false;
      }
    },
    readFile: async (filename: string) => {
      // Not implemented for web
      return null;
    },
    deleteFile: async (filename: string) => {
      // Not implemented for web
      return false;
    }
  };
};

// Get platform-specific network status
export const getPlatformNetworkStatus = () => {
  if (isAndroid()) {
    return {
      isOnline: async () => {
        try {
          // @ts-ignore - Android interface
          return await window.Android.isNetworkAvailable();
        } catch (e) {
          console.warn('Failed to check network status in Android:', e);
          return navigator.onLine;
        }
      }
    };
  }
  
  // Default to browser's online status
  return {
    isOnline: async () => navigator.onLine
  };
}; 