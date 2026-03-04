import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Logger from '../src/utils/Logger.js';

class KeyGenerator {
  private envPath: string;
  private examplePath: string;

  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
    this.examplePath = path.join(process.cwd(), '.env.example');
  }

  public run(): void {
    try {
      this.ensureEnvExists();
      this.updateKeys();
      Logger.info('Application keys generated and saved to .env successfully.');
    } catch (error) {
      Logger.error('Failed to generate keys:', error);
      process.exit(1);
    }
  }

  /**
   * Generates a random 64-character hex string.
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Checks if .env exists. If not, copies .env.example.
   */
  private ensureEnvExists(): void {
    if (!fs.existsSync(this.envPath)) {
      if (fs.existsSync(this.examplePath)) {
        fs.copyFileSync(this.examplePath, this.envPath);
        Logger.info('Created .env file from .env.example');
      } else {
        throw new Error('.env.example file not found. Cannot generate .env.');
      }
    }
  }

  /**
   * Reads .env, replaces specific keys, and writes it back.
   */
  private updateKeys(): void {
    let envContent = fs.readFileSync(this.envPath, 'utf-8');

    // 1. Update JWT_SECRET
    envContent = this.replaceOrAppend(envContent, 'JWT_SECRET', this.generateSecret());

    // 2. Update MAINTENANCE_SECRET
    envContent = this.replaceOrAppend(envContent, 'MAINTENANCE_SECRET', this.generateSecret());

    fs.writeFileSync(this.envPath, envContent);
  }

  /**
   * Helper to replace an existing key's value or append if missing.
   */
  private replaceOrAppend(content: string, key: string, newValue: string): string {
    const regex = new RegExp(`^${key}=.*`, 'm');
    
    if (regex.test(content)) {
      // Key exists, replace it
      return content.replace(regex, `${key}=${newValue}`);
    } else {
      // Key missing, append it
      return content + `\n${key}=${newValue}`;
    }
  }
}

new KeyGenerator().run();