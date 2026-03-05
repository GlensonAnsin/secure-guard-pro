import Designation, { DesignationCreationAttributes } from '../models/Designation.js';
import User from '../models/User.js';
import Paginator from '../utils/Paginator.js';

class DesignationService {
  /**
   * Get all designations with pagination.
   */
  public async getAllDesignations(page: number, limit: number, userId?: number) {
    return await Paginator.paginate(Designation, page, limit, {
      where: userId ? { user_id: userId } : {},
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
      ],
      order: [['id', 'DESC']],
    });
  }

  /**
   * Get a single designation by ID.
   */
  public async getDesignationById(id: number) {
    return await Designation.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
      ],
    });
  }

  /**
   * Create a new designation.
   */
  public async createDesignation(data: DesignationCreationAttributes) {
    return await Designation.create(data);
  }

  /**
   * Update a designation.
   */
  public async updateDesignation(id: number, data: Partial<DesignationCreationAttributes>) {
    const designation = await Designation.findByPk(id);
    if (!designation) throw new Error('Designation not found');
    return await designation.update(data);
  }

  /**
   * Delete a designation.
   */
  public async deleteDesignation(id: number) {
    const designation = await Designation.findByPk(id);
    if (!designation) throw new Error('Designation not found');
    return await designation.destroy();
  }
}

export default new DesignationService();
