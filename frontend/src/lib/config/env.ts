/**
 * Environment configuration
 * All environment variables should be validated and exported from here
 */

// Validate required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

// Type for required environment variables
type RequiredEnvVars = typeof requiredEnvVars[number];

// Validate environment variables
const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL as string,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Elephant Watch',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    nodeEnv: import.meta.env.MODE || 'development',
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
  },
} as const;
