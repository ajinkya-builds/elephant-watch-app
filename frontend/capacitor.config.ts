import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eravat.app',
  appName: 'Eravat',
  webDir: 'dist',
  // Use bundled assets instead of trying to load from localhost
  // This ensures the app works offline and doesn't try to make network requests during startup
  android: {
    allowMixedContent: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    // Configure Geolocation plugin
    Geolocation: {
      permissions: {
        android: {
          alwaysPermission: true
        }
      }
    },
    // Configure Motion plugin for compass
    Motion: {
      permissions: {
        android: true
      }
    },
    // Configure Network plugin for connectivity monitoring
    Network: {},
    // Configure Device plugin for system info
    Device: {}
  }
};

export default config;
