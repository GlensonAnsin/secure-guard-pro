import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized Environment Validation
 * 
 * Validates all required environment variables at startup
 * and exports a typed `env` object for use throughout the app.
 */
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_PORT: z.coerce.number().default(3000),

  // Database
  DB_DIALECT: z.enum(['mysql', 'postgres', 'mariadb', 'sqlite']).default('mysql'),
  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  DB_PORT: z.coerce.number().default(3306),
  DB_DATABASE: z.string().min(1, 'DB_DATABASE is required'),
  DB_DATABASE_TEST: z.string().optional(),
  DB_USERNAME: z.string().min(1, 'DB_USERNAME is required'),
  DB_PASSWORD: z.string().default(''),
  DB_SSL: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters for security'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Logging
  LOG_LEVEL: z.string().default('info'),

  // Maintenance
  MAINTENANCE_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`   ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

const env = parsed.data;

export default env;
