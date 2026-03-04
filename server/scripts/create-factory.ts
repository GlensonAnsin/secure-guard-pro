import fs from 'fs';
import path from 'path';
import Logger from '../src/utils/Logger.js';

class FactoryGenerator {
  private factoryName: string;
  private modelName: string;
  private stubPath: string;
  private factoriesDir: string;
  private targetPath: string;

  constructor() {
    // 1. Get Argument
    const rawName = process.argv[2];

    // 2. Validate & Format
    if (rawName) {
      this.factoryName = this.formatFactoryName(rawName);
      this.modelName = this.guessModelName(this.factoryName);
    } else {
      this.factoryName = '';
      this.modelName = '';
    }

    // 3. Define Paths
    this.stubPath = path.join(process.cwd(), 'scripts', 'stubs', 'factory.stub');
    this.factoriesDir = path.join(process.cwd(), 'src', 'database', 'factories');

    this.targetPath = this.factoryName 
      ? path.join(this.factoriesDir, `${this.factoryName}.ts`) 
      : '';
  }

  /**
   * Ensures 'Factory' suffix and PascalCase.
   * "product" -> "ProductFactory"
   */
  private formatFactoryName(str: string): string {
    let name = str.charAt(0).toUpperCase() + str.slice(1);
    if (!name.endsWith('Factory')) {
      name += 'Factory';
    }
    return name;
  }

  /**
   * Guesses model name by removing 'Factory'.
   * "ProductFactory" -> "Product"
   */
  private guessModelName(factoryName: string): string {
    return factoryName.replace('Factory', '');
  }

  public run(): void {
    if (!this.validateInput()) return;

    if (this.factoryExists()) {
      Logger.error(`Factory "${this.factoryName}" already exists.`);
      process.exit(1);
    }

    this.createFile();
  }

  private validateInput(): boolean {
    if (!this.factoryName) {
      Logger.error('Please provide a factory name.');
      console.log('\nUsage: npm run make:factory <Name>');
      console.log('Example: npm run make:factory Product\n');
      process.exit(1);
    }
    return true;
  }

  private factoryExists(): boolean {
    return fs.existsSync(this.targetPath);
  }

  private createFile(): void {
    try {
      let content = fs.readFileSync(this.stubPath, 'utf-8');

      // Replace Placeholders
      // Regex /g ensures it replaces ALL instances (e.g. extending Factory<Model> AND importing Model)
      content = content.replace(/{{FactoryName}}/g, this.factoryName);
      content = content.replace(/{{ModelName}}/g, this.modelName);

      fs.writeFileSync(this.targetPath, content);

      Logger.info(`Factory Created: src/database/factories/${this.factoryName}.ts`);
    } catch (error) {
      Logger.error('Failed to create factory:', error);
      process.exit(1);
    }
  }
}

new FactoryGenerator().run();