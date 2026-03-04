import { Options } from 'sequelize';
import Logger from '../utils/Logger.js';
import env from './env.js';

class DatabaseConfig {
  public development: Options;
  public test: Options;
  public production: Options;

  constructor() {
    this.development = this.getEnvironmentConfig();
    this.test = this.getEnvironmentConfig('test');
    this.production = this.getEnvironmentConfig('production');
  }

  /**
   * Helper to generate config based on the environment.
   * This reduces repetition.
   */
  private getEnvironmentConfig(envName: 'development' | 'test' | 'production' = 'development'): Options {
    const isTest = envName === 'test';
    const isProd = envName === 'production';
    const useSSL = env.DB_SSL === 'true';

    return {
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      database: isTest ? env.DB_DATABASE_TEST : env.DB_DATABASE,
      host: env.DB_HOST,
      port: env.DB_PORT,
      dialect: env.DB_DIALECT as any,
      dialectOptions: useSSL ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {},
      // Disable logging in test/production to keep logs clean
      logging: isProd || isTest ? false : (msg) => Logger.info(`[SQL] ${msg}`),
    };
  }
}

export default new DatabaseConfig();