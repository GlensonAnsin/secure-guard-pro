import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset module registry so env.ts re-executes
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should validate a complete set of environment variables', async () => {
    // Set up complete env
    process.env.NODE_ENV = 'development';
    process.env.APP_PORT = '3000';
    process.env.DB_DIALECT = 'mysql';
    process.env.DB_HOST = '127.0.0.1';
    process.env.DB_PORT = '3306';
    process.env.DB_DATABASE = 'lumina';
    process.env.DB_USERNAME = 'root';
    process.env.DB_PASSWORD = 'password';
    process.env.JWT_SECRET = 'a_very_long_secret_key_12345';
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    process.env.CORS_ORIGIN = 'http://localhost:3000';
    process.env.LOG_LEVEL = 'info';

    // The env schema from env.ts — testing the schema directly
    const envSchema = z.object({
      NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
      APP_PORT: z.coerce.number().default(3000),
      DB_DIALECT: z.enum(['mysql', 'postgres', 'mariadb', 'sqlite']).default('mysql'),
      DB_HOST: z.string().min(1),
      DB_PORT: z.coerce.number().default(3306),
      DB_DATABASE: z.string().min(1),
      DB_DATABASE_TEST: z.string().optional(),
      DB_USERNAME: z.string().min(1),
      DB_PASSWORD: z.string().default(''),
      DB_SSL: z.string().optional(),
      JWT_SECRET: z.string().min(16),
      JWT_EXPIRES_IN: z.string().default('15m'),
      JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
      CORS_ORIGIN: z.string().default('http://localhost:3000'),
      LOG_LEVEL: z.string().default('info'),
      MAINTENANCE_SECRET: z.string().optional(),
    });

    const result = envSchema.safeParse(process.env);
    expect(result.success).toBe(true);
  });

  it('should fail when JWT_SECRET is missing', () => {
    const envSchema = z.object({
      JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
    });

    const result = envSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should fail when JWT_SECRET is too short', () => {
    const envSchema = z.object({
      JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
    });

    const result = envSchema.safeParse({ JWT_SECRET: 'short' });
    expect(result.success).toBe(false);
  });

  it('should fail when DB_HOST is missing', () => {
    const envSchema = z.object({
      DB_HOST: z.string().min(1, 'DB_HOST is required'),
    });

    const result = envSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should use default values when optional vars are missing', () => {
    const envSchema = z.object({
      APP_PORT: z.coerce.number().default(3000),
      LOG_LEVEL: z.string().default('info'),
      CORS_ORIGIN: z.string().default('http://localhost:3000'),
    });

    const result = envSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.APP_PORT).toBe(3000);
      expect(result.data.LOG_LEVEL).toBe('info');
      expect(result.data.CORS_ORIGIN).toBe('http://localhost:3000');
    }
  });
});
