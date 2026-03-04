import fs from 'fs';
import path from 'path';
import Logger from '../src/utils/Logger.js';

class ControllerGenerator {
  private controllerName: string;
  private stubPath: string;
  private controllersDir: string;
  private targetPath: string;

  constructor() {
    // 1. Get Argument
    const rawName = process.argv[2];

    // 2. Validate & Format
    if (rawName) {
      this.controllerName = this.formatName(rawName);
    } else {
      this.controllerName = '';
    }

    // 3. Define Paths
    this.stubPath = path.join(process.cwd(), 'scripts', 'stubs', 'controller.stub');
    this.controllersDir = path.join(process.cwd(), 'src', 'controllers');

    this.targetPath = this.controllerName 
      ? path.join(this.controllersDir, `${this.controllerName}.ts`) 
      : '';
  }

  /**
   * Helper: Ensures strict PascalCase and appends 'Controller' if missing.
   * "user" -> "UserController"
   * "ProductController" -> "ProductController"
   */
  private formatName(str: string): string {
    let name = str.charAt(0).toUpperCase() + str.slice(1);
    
    // Append 'Controller' if user forgot it
    if (!name.endsWith('Controller')) {
      name += 'Controller';
    }
    
    return name;
  }

  public run(): void {
    if (!this.validateInput()) return;

    if (this.controllerExists()) {
      Logger.error(`Controller "${this.controllerName}" already exists at src/controllers/${this.controllerName}.ts`);
      process.exit(1);
    }

    this.createFile();
  }

  private validateInput(): boolean {
    if (!this.controllerName) {
      Logger.error('Please provide a controller name.');
      console.log('\nUsage: npm run make:controller <Name>');
      console.log('Example: npm run make:controller ProductController\n');
      process.exit(1);
    }
    return true;
  }

  private controllerExists(): boolean {
    return fs.existsSync(this.targetPath);
  }

  private createFile(): void {
    try {
      let content = fs.readFileSync(this.stubPath, 'utf-8');

      // Replace Placeholder
      content = content.replace(/{{ControllerName}}/g, this.controllerName);

      fs.writeFileSync(this.targetPath, content);

      Logger.info(`Controller Created: src/controllers/${this.controllerName}.ts`);
    } catch (error) {
      Logger.error('Failed to create controller:', error);
      process.exit(1);
    }
  }
}

new ControllerGenerator().run();