import { defineConfig, Plugin, HtmlTagDescriptor } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";

// Keep your existing devErrorAndNavigationPlugin definition
export function devErrorAndNavigationPlugin(): Plugin {
  let stacktraceJsContent: string | null = null;
  let dyadShimContent: string | null = null;

  return {
    name: "dev-error-and-navigation-handler",
    apply: "serve", 

    configResolved() {
      const stackTraceLibPath = path.join(
        "node_modules",
        "stacktrace-js",
        "dist",
        "stacktrace.min.js"
      );
      if (stackTraceLibPath) {
        try {
          stacktraceJsContent = fs.readFileSync(stackTraceLibPath, "utf-8");
        } catch (error) {
          console.error(
            `[dyad-shim] Failed to read stacktrace.js from ${stackTraceLibPath}:`,
            error
          );
          stacktraceJsContent = null;
        }
      } else {
        console.error(`[dyad-shim] stacktrace.js not found.`);
      }

      const dyadShimPath = path.join("dyad-shim.js");
      if (dyadShimPath) {
        try {
          dyadShimContent = fs.readFileSync(dyadShimPath, "utf-8");
        } catch (error) {
          console.error(
            `[dyad-shim] Failed to read dyad-shim from ${dyadShimPath}:`,
            error
          );
          dyadShimContent = null;
        }
      } else {
        console.error(`[dyad-shim] dyad-shim.js not found.`);
      }
    },

    transformIndexHtml(html) {
      const tags: HtmlTagDescriptor[] = [];
      if (stacktraceJsContent) {
        tags.push({
          tag: "script",
          injectTo: "head-prepend",
          children: stacktraceJsContent,
        });
      }
      if (dyadShimContent) {
        tags.push({
          tag: "script",
          injectTo: "head-prepend",
          children: dyadShimContent,
        });
      }
      return { html, tags };
    },
  };
}

// Keep your existing pwaOptions definition
const pwaOptions: Partial<VitePWAOptions> = {
  registerType: "autoUpdate",
  injectRegister: false, 
  devOptions: { 
    enabled: false, 
  },
  manifest: {
    name: "Elephant Watch",
    short_name: "ElephantWatch",
    description: "Report elephant activity to help conservation efforts.",
    theme_color: "#4CAF50", 
    background_color: "#ffffff",
    display: "standalone",
    scope: "/",
    start_url: "/",
    icons: [
      {
        src: "pwa-192x192.png", 
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "pwa-512x512.png", 
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "pwa-512x512.png", 
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"], 
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/pauafmgoewfdhwnsexzy\.supabase\.co\/.*/i, 
        handler: "NetworkFirst", 
        options: {
          cacheName: "supabase-api-cache",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 1, // 1 day
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
};

export default defineConfig(({ mode }) => {
  if (mode === 'development') {
    // Development mode: only react plugin and force optimizeDeps
    return {
      server: {
        host: "::",
        port: 8080,
      },
      plugins: [react()], // Only the react plugin
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      optimizeDeps: {
        force: true, // Force Vite to re-bundle dependencies
      }
    };
  }
  
  // Production mode: react plugin and VitePWA plugin
  // The devErrorAndNavigationPlugin is not added here as it's for 'serve' (dev)
  return {
    server: { // server config is less relevant for 'build' but harmless
      host: "::",
      port: 8080,
    },
    plugins: [react(), VitePWA(pwaOptions)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});