import fs from 'fs';
import path from 'path';
import Logger from '../src/utils/Logger.js';

class MigrationGenerator {
  private nameArgument: string;
  private migrationName: string;
  private className: string;
  private tableName: string;
  private migrationsDir: string;
  private stubPath: string;

  constructor() {
    this.nameArgument = process.argv[2];
    this.migrationsDir = path.join(process.cwd(), 'src', 'database', 'migrations');
    this.stubPath = path.join(process.cwd(), 'scripts', 'stubs', 'migration.stub');
    
    // Initialize properties safely
    this.migrationName = '';
    this.className = '';
    this.tableName = 'table_name';
  }

  public run(): void {
    if (!this.validateInput()) return;

    this.parseNameArgument();
    this.createMigrationFile();
  }

  private validateInput(): boolean {
    if (!this.nameArgument) {
      Logger.error('Please provide a migration name.');
      console.log('\nUsage: npm run make:migration <name>');
      console.log('Example: npm run make:migration create_products_table\n');
      process.exit(1);
    }
    return true;
  }

  /**
   * Transforms input "create_products_table" into:
   * ClassName: CreateProductsTable
   * TableName: products (tries to guess it)
   */
  private parseNameArgument(): void {
    this.migrationName = this.nameArgument.toLowerCase();

    // 1. Generate Class Name (PascalCase)
    this.className = this.migrationName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    // 2. Guess Table Name
    const match = this.migrationName.match(/create_(.+)_table/);
    if (match && match[1]) {
      this.tableName = match[1];
    } else {
      this.tableName = this.migrationName;
    }
  }

  /**
   * Generates YYYYMMDDHHMMSS format
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  }

  private createMigrationFile(): void {
    try {
      // 1. Generate Filename with Timestamp
      const timestamp = this.getTimestamp();
      const fileName = `${timestamp}-create_${this.migrationName}.js`;
      const targetPath = path.join(this.migrationsDir, fileName);

      // 2. Read Stub
      let content = fs.readFileSync(this.stubPath, 'utf-8');

      // 3. Replace Placeholders
      content = content.replace(/{{ClassName}}/g, this.className);
      content = content.replace(/{{TableName}}/g, this.tableName);

      // 4. Write File
      fs.writeFileSync(targetPath, content);

      Logger.info(`Migration Created: src/database/migrations/${fileName}`);
      
    } catch (error) {
      Logger.error('Failed to create migration:', error);
      process.exit(1);
    }
  }
}

new MigrationGenerator().run();