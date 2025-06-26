import { Plugin } from 'vite';

export function capacitorPlugin(): Plugin {
  const capacitorLibraries = [
    '@capacitor/app',
    '@capacitor/camera',
    '@capacitor/device',
    '@capacitor/filesystem',
    '@capacitor/geolocation',
    '@capacitor/network',
    '@capacitor/preferences',
    '@capacitor/share',
    '@capacitor/splash-screen',
    '@capacitor/status-bar',
    '@capacitor/storage',
  ];

  return {
    name: 'vite-plugin-capacitor',
    config() {
      return {
        optimizeDeps: {
          exclude: capacitorLibraries,
        },
        ssr: {
          noExternal: true,
        },
      };
    },
    resolveId(id: string) {
      if (capacitorLibraries.some(lib => id.startsWith(lib))) {
        // Return the actual module path for Capacitor plugins
        return id;
      }
      return null;
    },
    load(id: string) {
      if (capacitorLibraries.some(lib => id.startsWith(lib))) {
        // Return a simple module that will be replaced by the actual Capacitor plugin at runtime
        return `export default window.Capacitor.Plugins.${id.split('/').pop()} || {};`;
      }
      return null;
    },
  };
}

export default capacitorPlugin();
