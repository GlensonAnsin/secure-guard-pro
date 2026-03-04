import FirearmIssuance, { FirearmIssuanceCreationAttributes } from '../models/FirearmIssuance.js';
import User from '../models/User.js';
import Firearm from '../models/Firearm.js';
import Paginator from '../utils/Paginator.js';

class FirearmIssuanceService {
  /**
   * Get all firearm issuances with pagination.
   */
  public async getAllIssuances(page: number, limit: number) {
    return await Paginator.paginate(FirearmIssuance, page, limit, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Firearm, as: 'firearm' },
      ],
      order: [['id', 'DESC']],
    });
  }

  /**
   * Get a single firearm issuance by ID.
   */
  public async getIssuanceById(id: number) {
    return await FirearmIssuance.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Firearm, as: 'firearm' },
      ],
    });
  }

  /**
   * Create a new firearm issuance.
   */
  public async createIssuance(data: FirearmIssuanceCreationAttributes) {
    return await FirearmIssuance.create(data);
  }

  /**
   * Update a firearm issuance.
   */
  public async updateIssuance(id: number, data: Partial<FirearmIssuanceCreationAttributes>) {
    const issuance = await FirearmIssuance.findByPk(id);
    if (!issuance) throw new Error('Firearm issuance not found');
    return await issuance.update(data);
  }

  /**
   * Delete a firearm issuance.
   */
  public async deleteIssuance(id: number) {
    const issuance = await FirearmIssuance.findByPk(id);
    if (!issuance) throw new Error('Firearm issuance not found');
    return await issuance.destroy();
  }
}

export default new FirearmIssuanceService();
