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
    apply: "serve", // This plugin only applies to the dev server

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
          console.log("[devErrorAndNavigationPlugin] Successfully read stacktrace.js");
        } catch (error) {
          console.error(
            `[devErrorAndNavigationPlugin] Failed to read stacktrace.js from ${stackTraceLibPath}:`,
            error
          );
          stacktraceJsContent = null;
        }
      } else {
        console.error(`[devErrorAndNavigationPlugin] stacktrace.js not found at expected path: ${stackTraceLibPath}`);
      }

      const dyadShimPath = path.join("dyad-shim.js"); // Relative to project root
      if (dyadShimPath) {
        try {
          dyadShimContent = fs.readFileSync(dyadShimPath, "utf-8");
          console.log("[devErrorAndNavigationPlugin] Successfully read dyad-shim.js");
        } catch (error) {
          console.error(
            `[devErrorAndNavigationPlugin] Failed to read dyad-shim.js from ${dyadShimPath}:`,
            error
          );
          dyadShimContent = null;
        }
      } else {
        // This case should not happen if path.join is used correctly with a filename
        console.error(`[devErrorAndNavigationPlugin] dyad-shim.js path resolution failed.`);
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
      if (tags.length > 0) {
        console.log("[devErrorAndNavigationPlugin] Injecting shims into index.html");
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
  const commonConfig = {
    server: {
      host: "::",
      port: 8080,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };

  if (mode === 'development') {
    console.log("[vite.config.ts] Configuring for development mode.");
    return {
      ...commonConfig,
      plugins: [devErrorAndNavigationPlugin(), react()],
      // No optimizeDeps: { force: true }
    };
  }
  
  // Production mode
  console.log("[vite.config.ts] Configuring for production mode.");
  return {
    ...commonConfig,
    plugins: [react(), VitePWA(pwaOptions)], 
  };
});