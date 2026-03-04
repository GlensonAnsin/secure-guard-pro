import fs from 'fs';
import path from 'path';
import Logger from '../src/utils/Logger.js';

class MaintenanceManager {
  private lockFile: string;
  private action: string;

  constructor() {
    this.lockFile = path.join(process.cwd(), 'maintenance.lock');
    // Get the command line argument (e.g., 'up' or 'down')
    this.action = process.argv[2];
  }

  /**
   * The main entry point for the script.
   */
  public run(): void {
    switch (this.action) {
      case 'down':
        this.enableMaintenance();
        break;
      case 'up':
        this.disableMaintenance();
        break;
      default:
        this.showUsage();
        break;
    }
  }

  /**
   * Puts the application into maintenance mode.
   */
  private enableMaintenance(): void {
    try {
      fs.writeFileSync(this.lockFile, 'MAINTENANCE_MODE_ACTIVE');
      Logger.info('Application is now in MAINTENANCE MODE (503).');
      Logger.info('Run "npm run up" to bring it back online.');
    } catch (error) {
      Logger.error('Failed to enable maintenance mode:', error);
      process.exit(1);
    }
  }

  /**
   * Brings the application back online.
   */
  private disableMaintenance(): void {
    try {
      if (fs.existsSync(this.lockFile)) {
        fs.unlinkSync(this.lockFile);
        Logger.info('Application is now LIVE.');
      } else {
        Logger.warn('Application was already live.');
      }
    } catch (error) {
      Logger.error('Failed to disable maintenance mode:', error);
      process.exit(1);
    }
  }

  /**
   * Shows help instructions.
   */
  private showUsage(): void {
    Logger.info('\nUsage:');
    Logger.info('  npm run down  -> Put server in maintenance mode');
    Logger.info('  npm run up    -> Bring server back online\n');
  }
}

new MaintenanceManager().run();