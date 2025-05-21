import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { loadEnv } from 'vite';

// Validate environment variables
function validateEnv(env: Record<string, string>) {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = required.filter(key => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Log environment variable status (without exposing values)
  console.log('Environment Variables Status:');
  required.forEach(key => {
    const value = env[key];
    console.log(`${key}: ${value ? '✓ Present' : '✗ Missing'} (${value?.length} chars)`);
  });
}

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Validate environment variables
  validateEnv(env);

  // Base configuration
  const config = {
    base: mode === 'development' ? '/' : '/elephant-watch-app/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
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
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(env.VITE_SUPABASE_SERVICE_ROLE_KEY)
    }
  };

  // Development-specific configuration
  if (mode === 'development') {
    return {
      ...config,
      server: {
        host: true,
        port: 8080,
        strictPort: true
      }
    };
  }

  // Production configuration
  return config;
});