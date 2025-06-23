import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: process.env.PORT || 3001, // Changed default port to 3001
  nodeEnv: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
} as const;

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
} 