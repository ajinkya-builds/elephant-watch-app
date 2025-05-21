import { defineConfig, Plugin, HtmlTagDescriptor } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { loadEnv } from 'vite';
// import { VitePWA, VitePWAOptions } from "vite-plugin-pwa"; // Commented out

// Load environment variables
const env = loadEnv('production', process.cwd(), '');

// Debug environment variables
console.log('=== Vite Environment Variables Debug ===');
console.log('Environment Variables:', {
  VITE_SUPABASE_URL: env.VITE_SUPABASE_URL?.substring(0, 10) + '...',
  VITE_SUPABASE_URL_LENGTH: env.VITE_SUPABASE_URL?.length,
  VITE_SUPABASE_ANON_KEY_LENGTH: env.VITE_SUPABASE_ANON_KEY?.length,
  VITE_SUPABASE_ANON_KEY_PARTS: env.VITE_SUPABASE_ANON_KEY?.split('.').length,
  VITE_SUPABASE_SERVICE_ROLE_KEY_LENGTH: env.VITE_SUPABASE_SERVICE_ROLE_KEY?.length,
  VITE_SUPABASE_SERVICE_ROLE_KEY_PARTS: env.VITE_SUPABASE_SERVICE_ROLE_KEY?.split('.').length
});

// Validate required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_SERVICE_ROLE_KEY'
];

const missingEnvVars = requiredEnvVars.filter(
  varName => !env[varName]
);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Log environment variable status
console.log('Environment Variables Status:');
requiredEnvVars.forEach(varName => {
  const value = env[varName];
  console.log(`${varName}: ${value ? '✓ Present' : '✗ Missing'} (${value?.length} chars)`);
});

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
            `[devErrorAndNavigationPlugin] Failed to read stacktrace.js:`,
            error
          );
          stacktraceJsContent = null;
        }
      }

      const dyadShimPath = path.join("dyad-shim.js");
      if (dyadShimPath) {
        try {
          dyadShimContent = fs.readFileSync(dyadShimPath, "utf-8");
        } catch (error) {
          console.error(
            `[devErrorAndNavigationPlugin] Failed to read dyad-shim.js:`,
            error
          );
          dyadShimContent = null;
        }
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

// const pwaOptions: Partial<VitePWAOptions> = { // Commented out
// ...
// };

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const commonConfig = {
    base: '/elephant-watch-app/',
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
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    envPrefix: 'VITE_',
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(env.VITE_SUPABASE_SERVICE_ROLE_KEY)
    }
  };

  const GITHUB_REPO_NAME = "elephant-watch-app"; 

  if (mode === 'development') {
    console.log("[vite.config.ts] Configuring for development mode.");
    console.log('Environment Variables loaded:', {
      VITE_SUPABASE_URL: env.VITE_SUPABASE_URL?.substring(0, 10) + '...',
      VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY ? '✓ Present' : '❌ Missing',
      VITE_SUPABASE_SERVICE_ROLE_KEY: env.VITE_SUPABASE_SERVICE_ROLE_KEY ? '✓ Present' : '❌ Missing'
    });
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
    plugins: [react()],
  };
});