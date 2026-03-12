import Designation, { DesignationCreationAttributes } from '../models/Designation.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
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
        { model: Company, as: 'company' },
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
        { model: Company, as: 'company' },
      ],
    });
  }

  /**
   * Create a new designation.
   */
  public async createDesignation(data: DesignationCreationAttributes) {
    const company = await Company.findByPk(data.company_id);
    if (!company) {
      throw new Error('Target company not found.');
    }
    
    if (!company.is_active) {
      throw new Error(`Cannot assign guard to "${company.name}" because the company is currently inactive.`);
    }

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
