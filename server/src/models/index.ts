import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import { fileURLToPath, pathToFileURL } from 'url';
import configList from '../config/database.js';
import Logger from '../utils/Logger.js';
import env from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Database {
  public sequelize: Sequelize;
  public models: any = {};

  constructor() {
    const currentEnv = env.NODE_ENV;
    const config = (configList as any)[currentEnv];

    if (!config) {
      Logger.error(`Fatal Error: Database config for "${currentEnv}" not found.`);
      process.exit(1);
    }

    // Initialize Sequelize
    this.sequelize = new Sequelize(
      config.database, 
      config.username, 
      config.password, 
      config
    );
  }

  /**
   * Connect to DB and Load Models
   */
  public async connect() {
    try {
      // 1. Authenticate Connection
      await this.sequelize.authenticate();
      Logger.info('Database connection established.');

      // 2. Load Models Dynamically
      await this.loadModels();
      
      // 3. Setup Associations
      this.associateModels();
      
    } catch (error) {
      Logger.error('Unable to connect to the database:', error);
      process.exit(1);
    }
  }

  private async loadModels() {
    const basename = path.basename(__filename);
    
    // Read all files in this directory
    const files = fs.readdirSync(__dirname).filter((file) => {
      return (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        (file.slice(-3) === '.ts' || file.slice(-3) === '.js')
      );
    });

    // Import and Init each model
    for (const file of files) {
      const modelPath = pathToFileURL(path.join(__dirname, file)).href;
      const modelModule = await import(modelPath);
      const model = modelModule.default;

      if (model && model.initModel) {
        model.initModel(this.sequelize);
        // Store in models object instead of root
        this.models[model.name] = model; 
      }
    }
  }

  private associateModels() {
    Object.keys(this.models).forEach((modelName) => {
      if (this.models[modelName].associate) {
        this.models[modelName].associate(this.models);
      }
    });
  }
}

export default new Database();