import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import type { Plugin } from 'vite';

// Define Capacitor plugin names
const capacitorPlugins = [
  'app',
  'camera',
  'device',
  'filesystem',
  'geolocation',
  'network',
  'preferences',
  'share',
  'splash-screen',
  'status-bar',
  'storage',
];

// Create a Vite plugin to handle Capacitor imports
function capacitorPlugin(): Plugin {
  return {
    name: 'vite-plugin-capacitor',
    config() {
      return {
        optimizeDeps: {
          exclude: capacitorPlugins.map(pkg => `@capacitor/${pkg}`),
        },
        ssr: {
          noExternal: true,
        },
      };
    },
    resolveId(id: string) {
      if (capacitorPlugins.some(pkg => id.startsWith(`@capacitor/${pkg}`))) {
        return id;
      }
      return null;
    },
    load(id: string) {
      if (capacitorPlugins.some(pkg => id.startsWith(`@capacitor/${pkg}`))) {
        const pluginName = id.split('/').pop()?.replace('@', '');
        return `export default window.Capacitor?.Plugins?.${pluginName} || {};`;
      }
      return null;
    },
  };
}

export default defineConfig(({ mode }) => {
  console.log('Starting Vite configuration...');
  console.log('Mode:', mode);
  
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  console.log('Environment variables loaded');
  
  // Validate required environment variables
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_SERVICE_ROLE_KEY'
  ];

  console.log('Checking environment variables...');
  const missingEnvVars = requiredEnvVars.filter(varName => !env[varName]);
  if (missingEnvVars.length > 0) {
    console.error('Missing environment variables:', missingEnvVars);
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
  console.log('All required environment variables are present');

  const base = '/';

  return {
    base,
    plugins: [
      capacitorPlugin(),
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Elephant Watch',
          short_name: 'EWatch',
          description: 'Elephant Watch Application',
          theme_color: '#ffffff',
          start_url: base,
          scope: base,
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        'react': path.resolve(__dirname, '../node_modules/react'),
        'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@emotion/react',
        '@emotion/styled',
        '@radix-ui/react-*',
      ],
      esbuildOptions: {
        // Ensure JSX is handled properly
        loader: {
          '.js': 'jsx',
        },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('@radix-ui')) {
                return 'radix';
              }
              return 'vendor';
            }
          },
        },
        external: []
      },
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(env.VITE_SUPABASE_SERVICE_ROLE_KEY),
      'process.env': env,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/__tests__/setup.ts'],
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      coverage: {
        reporter: ['text', 'json', 'html'],
      },
    },
  };
});