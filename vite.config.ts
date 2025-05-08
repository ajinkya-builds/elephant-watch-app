import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import fs from "fs"; // No longer needed if dev plugin is disabled
// import { VitePWA, VitePWAOptions } from "vite-plugin-pwa"; // Still commented out

// Keep your existing devErrorAndNavigationPlugin, but we won't call it for now
/*
export function devErrorAndNavigationPlugin(): Plugin {
  // ... plugin code ...
}
*/

/* // Temporarily commented out PWA options
const pwaOptions: Partial<VitePWAOptions> = {
  // ... pwa options ...
};
*/

export default defineConfig(({ mode }) => {
  const plugins = [react()]; // Using only react plugin for now
  
  // if (mode === 'development') {
  //   plugins.unshift(devErrorAndNavigationPlugin()); // Also commented out
  // }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});