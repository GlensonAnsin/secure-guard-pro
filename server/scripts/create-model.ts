import fs from 'fs';
import path from 'path';
import Logger from '../src/utils/Logger.js';

class ModelGenerator {
  private modelName: string;
  private stubPath: string;
  private modelsDir: string;
  private targetPath: string;

  constructor() {
    // 1. Initialize Inputs
    const rawName = process.argv[2];

    if (rawName) {
      this.modelName = this.formatName(rawName);
    } else {
      this.modelName = '';
    }
    
    // 2. Define Paths
    this.stubPath = path.join(process.cwd(), 'scripts', 'stubs', 'model.stub');
    this.modelsDir = path.join(process.cwd(), 'src', 'models');
    
    // Only define target path if model name exists
    this.targetPath = this.modelName 
      ? path.join(this.modelsDir, `${this.modelName}.ts`) 
      : '';
  }

  /**
   * Main entry point to run the generator.
   */
  public run(): void {
    if (!this.validateInput()) {
      return;
    }

    if (this.modelExists()) {
      Logger.error(`Model "${this.modelName}" already exists at src/models/${this.modelName}.ts`);
      process.exit(1);
    }

    this.createFile();
  }

  /**
   * Validates command line arguments.
   */
  private validateInput(): boolean {
    if (!this.modelName) {
      Logger.error('Please provide a model name.');
      console.log('\nUsage: npm run make:model <ModelName>');
      console.log('Example: npm run make:model Product\n');
      process.exit(1);
    }
    return true;
  }

  /**
   * Checks if the file already exists.
   */
  private modelExists(): boolean {
    return fs.existsSync(this.targetPath);
  }

  /**
   * Helper to capitalize the first letter of a string.
   */
  private formatName(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Helper to pluralize table name (User -> users).
   */
  private getTableName(): string {
    return this.modelName.toLowerCase() + 's';
  }

  /**
   * Reads stub, replaces placeholders, and writes the file.
   */
  private createFile(): void {
    try {
      // Read Stub
      let content = fs.readFileSync(this.stubPath, 'utf-8');

      // Replace Placeholders
      const tableName = this.getTableName();
      content = content.replace(/{{ModelName}}/g, this.modelName);
      content = content.replace(/{{TableName}}/g, tableName);

      // Write File
      fs.writeFileSync(this.targetPath, content);

      Logger.info(`Model Created: src/models/${this.modelName}.ts`);
    } catch (error) {
      Logger.error('Failed to create model:', error);
      process.exit(1);
    }
  }
}

new ModelGenerator().run();