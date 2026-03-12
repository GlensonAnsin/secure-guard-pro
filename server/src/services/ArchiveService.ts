import User from '../models/User.js';
import Firearm from '../models/Firearm.js';
import Designation from '../models/Designation.js';
import Attendance from '../models/Attendance.js';
import FirearmIssuance from '../models/FirearmIssuance.js';
import Company from '../models/Company.js';
import { Op } from 'sequelize';

class ArchiveService {
  private getModel(entity: string) {
    const models: Record<string, any> = {
      users: User,
      firearms: Firearm,
      designations: Designation,
      attendances: Attendance,
      firearm_issuances: FirearmIssuance,
      companies: Company,
    };
    return models[entity];
  }

  /**
   * Get all soft-deleted records for an entity.
   */
  public async getArchived(entity: string, page: number = 1, limit: number = 15) {
    const model = this.getModel(entity);
    if (!model) throw new Error(`Invalid entity: ${entity}`);

    const offset = (page - 1) * limit;

    const { count, rows } = await model.findAndCountAll({
      where: { deleted_at: { [Op.ne]: null } },
      paranoid: false,
      limit,
      offset,
      order: [['deleted_at', 'DESC']],
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Restore a soft-deleted record.
   */
  public async restore(entity: string, id: number) {
    const model = this.getModel(entity);
    if (!model) throw new Error(`Invalid entity: ${entity}`);

    const record = await model.findByPk(id, { paranoid: false });
    if (!record) throw new Error('Record not found');
    
    // Check for both naming conventions
    const isArchived = (record as any).deleted_at || (record as any).deletedAt;
    if (!isArchived) throw new Error('Record is not archived');

    await record.restore();
    return record;
  }

  /**
   * Permanently delete a record.
   */
  public async permanentDelete(entity: string, id: number) {
    const model = this.getModel(entity);
    if (!model) throw new Error(`Invalid entity: ${entity}`);

    const record = await model.findByPk(id, { paranoid: false });
    if (!record) throw new Error('Record not found');

    await record.destroy({ force: true });
    return { success: true };
  }
}

export default new ArchiveService();
