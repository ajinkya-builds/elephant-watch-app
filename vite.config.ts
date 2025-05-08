import { defineConfig, Plugin, HtmlTagDescriptor } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";

// Keep your existing devErrorAndNavigationPlugin
export function devErrorAndNavigationPlugin(): Plugin {
  let stacktraceJsContent: string | null = null;
  let dyadShimContent: string | null = null;

  return {
    name: "dev-error-and-navigation-handler",
    apply: "serve", // Only apply in development

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

const pwaOptions: Partial<VitePWAOptions> = {
  registerType: "autoUpdate",
  injectRegister: false, // We will register manually in a React component
  devOptions: {
    enabled: true, // Enable PWA in development for testing
    type: 'module',
  },
  manifest: {
    name: "Elephant Watch",
    short_name: "ElephantWatch",
    description: "Report elephant activity to help conservation efforts.",
    theme_color: "#4CAF50", // A green theme color
    background_color: "#ffffff",
    display: "standalone",
    scope: "/",
    start_url: "/",
    icons: [
      {
        src: "pwa-192x192.png", // You'll need to add these icons to your public folder
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "pwa-512x512.png", // You'll need to add these icons to your public folder
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "pwa-512x512.png", // Maskable icon
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"], // Cache these file types
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/pauafmgoewfdhwnsexzy\.supabase\.co\/.*/i, // Your Supabase URL
        handler: "NetworkFirst", // Or 'NetworkOnly' if you don't want to cache API responses
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
  const plugins = [react(), VitePWA(pwaOptions)];
  if (mode === 'development') {
    plugins.unshift(devErrorAndNavigationPlugin()); // Add dev plugin only in development
  }

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