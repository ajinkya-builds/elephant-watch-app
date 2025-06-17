import { describe, it, expect, vi, beforeEach } from 'vitest';
import { config } from '../app/config/config';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it('should use default values when environment variables are not set', () => {
    expect(config.port).toBe(3000);
    expect(config.nodeEnv).toBe('development');
    expect(config.jwt.expiresIn).toBe('1d');
    expect(config.cors.origin).toBe('*');
  });

  it('should use environment variables when set', () => {
    process.env.PORT = '4000';
    process.env.NODE_ENV = 'production';
    process.env.JWT_EXPIRES_IN = '2h';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

    const newConfig = require('../app/config/config').config;

    expect(newConfig.port).toBe(4000);
    expect(newConfig.nodeEnv).toBe('production');
    expect(newConfig.jwt.expiresIn).toBe('2h');
    expect(newConfig.cors.origin).toBe('http://localhost:3000');
  });

  it('should throw error if required environment variables are missing', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_KEY;
    delete process.env.JWT_SECRET;

    expect(() => {
      require('../app/config/config');
    }).toThrow('Missing required environment variable');
  });

  it('should have correct CORS configuration', () => {
    expect(config.cors.methods).toEqual(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
    expect(config.cors.allowedHeaders).toEqual(['Content-Type', 'Authorization']);
  });

  it('should have correct JWT configuration', () => {
    expect(config.jwt).toHaveProperty('secret');
    expect(config.jwt).toHaveProperty('expiresIn');
  });

  it('should have correct Supabase configuration', () => {
    expect(config.supabase).toHaveProperty('url');
    expect(config.supabase).toHaveProperty('key');
  });
}); 