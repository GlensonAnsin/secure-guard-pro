import Firearm, { FirearmCreationAttributes } from '../models/Firearm.js';
import Paginator from '../utils/Paginator.js';

class FirearmService {
  /**
   * Get all firearms with pagination.
   */
  public async getAllFirearms(page: number, limit: number) {
    return await Paginator.paginate(Firearm, page, limit, {
      order: [['id', 'DESC']],
    });
  }

  /**
   * Get a single firearm by ID.
   */
  public async getFirearmById(id: number) {
    return await Firearm.findByPk(id);
  }

  /**
   * Create a new firearm.
   */
  public async createFirearm(data: FirearmCreationAttributes) {
    return await Firearm.create(data);
  }

  /**
   * Update a firearm.
   */
  public async updateFirearm(id: number, data: Partial<FirearmCreationAttributes>) {
    const firearm = await Firearm.findByPk(id);
    if (!firearm) throw new Error('Firearm not found');
    return await firearm.update(data);
  }

  /**
   * Delete a firearm.
   */
  public async deleteFirearm(id: number) {
    const firearm = await Firearm.findByPk(id);
    if (!firearm) throw new Error('Firearm not found');
    return await firearm.destroy();
  }
}

export default new FirearmService();
