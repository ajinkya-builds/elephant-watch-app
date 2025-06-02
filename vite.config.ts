import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { loadEnv } from 'vite';

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

  const config = {
    base: '/elephant-watch-app/',
    plugins: [react()],
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
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui': ['@radix-ui/react-icons', '@radix-ui/react-slot', 'class-variance-authority', 'clsx', 'tailwind-merge'],
            'charts': ['recharts'],
            'supabase': ['@supabase/supabase-js']
          }
        }
      }
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(env.VITE_SUPABASE_SERVICE_ROLE_KEY)
    }
  };

  console.log('Configuration generated:', {
    base: config.base,
    build: {
      outDir: config.build.outDir,
      assetsDir: config.build.assetsDir
    }
  });

  return config;
});