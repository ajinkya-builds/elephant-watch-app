import { defineConfig, Plugin, HtmlTagDescriptor } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs"; // Re-enable fs as it's used by the dev plugin
// import { VitePWA, VitePWAOptions } from "vite-plugin-pwa"; // Still commented out

// Re-enable devErrorAndNavigationPlugin
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

      const dyadShimPath = path.join("dyad-shim.js"); // Assuming dyad-shim.js is in the root
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

/* // Temporarily commented out PWA options
const pwaOptions: Partial<VitePWAOptions> = {
  // ... pwa options ...
};
*/

export default defineConfig(({ mode }) => {
  const plugins = [react()]; 
  
  if (mode === 'development') {
    plugins.unshift(devErrorAndNavigationPlugin()); // Re-enable this plugin
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