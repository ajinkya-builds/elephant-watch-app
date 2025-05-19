import { defineConfig, Plugin, HtmlTagDescriptor } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
// import { VitePWA, VitePWAOptions } from "vite-plugin-pwa"; // Commented out

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

// const pwaOptions: Partial<VitePWAOptions> = { // Commented out
// ...
// };

export default defineConfig(({ mode }) => {
  const commonConfig = {
    base: mode === 'production' ? '/elephant-watch-app/' : '/',
    server: {
      host: "::",
      port: 8080,
      strictPort: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
  };

  const GITHUB_REPO_NAME = "elephant-watch-app"; 

  if (mode === 'development') {
    console.log("[vite.config.ts] Configuring for development mode.");
    return {
      ...commonConfig,
      plugins: [devErrorAndNavigationPlugin(), react()],
      base: '/', 
    };
  }
  
  // Production mode (for GitHub Pages deployment)
  console.log("[vite.config.ts] Configuring for production mode.");
  return {
    ...commonConfig,
    // plugins: [react(), VitePWA(pwaOptions)], // Commented out PWA plugin
    plugins: [react()], // Only react plugin for production for now
    base: `/${GITHUB_REPO_NAME}/`, 
  };
});