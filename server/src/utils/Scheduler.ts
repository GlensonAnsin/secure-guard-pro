import cron from 'node-cron';
import ShiftRotationService from '../services/ShiftRotationService.js';
import Logger from './Logger.js';

class Scheduler {
  /**
   * Initialize all scheduled tasks.
   */
  public init() {
    // Schedule Shift Rotation to run daily at midnight (00:00)
    // The service itself checks for last_shift_changes >= 7 days
    cron.schedule('0 0 * * *', async () => {
      Logger.info('Cron: Running daily shift rotation check...');
      try {
        const result = await ShiftRotationService.rotateShifts();
        Logger.info(`Cron: Shift rotation completed. ${result.rotatedCount} records updated.`);
      } catch (error) {
        Logger.error('Cron: Error during shift rotation:', error);
      }
    });

    Logger.info('Background Scheduler initialized successfully.');
  }
}

export default new Scheduler();
