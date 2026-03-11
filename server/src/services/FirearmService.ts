import Firearm, { FirearmCreationAttributes } from '../models/Firearm.js';
import FirearmIssuance from '../models/FirearmIssuance.js';
import User from '../models/User.js';
import Paginator from '../utils/Paginator.js';
import { Op } from 'sequelize';

class FirearmService {
  /**
   * Get all firearms with pagination, search, and filtering.
   */
  public async getAllFirearms(page: number, limit: number, search?: string, status?: string) {
    const where: any = {};

    if (status && status !== 'all' && status !== 'All') {
      if (status === 'available') where.is_available = true;
      else if (status === 'damaged') where.is_damaged = true;
      else if (status === 'maintenance') where.is_maintenance = true;
      else if (status === 'expiring') where.is_expiring = true;
      else if (status === 'expired') where.is_expired = true;
      else if (status === 'issued') where.is_available = false;
    }

    if (search) {
      where[Op.or] = [
        { serial_num: { [Op.like]: `%${search}%` } },
        { type: { [Op.like]: `%${search}%` } },
      ];
    }

    return await Paginator.paginate(Firearm, page, limit, {
      where,
      order: [['id', 'DESC']],
      distinct: true,
      include: [
        {
          model: FirearmIssuance,
          as: 'issuances',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'first_name', 'last_name'],
            },
          ],
        },
      ],
    });
  }

  /**
   * Get firearm statistics using boolean flags.
   */
  public async getFirearmStats() {
    const total = await Firearm.count();
    const available = await Firearm.count({ where: { is_available: true } });
    const issued = await Firearm.count({ where: { is_available: false } });
    const maintenance = await Firearm.count({ where: { is_maintenance: true } });
    const damaged = await Firearm.count({ where: { is_damaged: true } });
    const expired = await Firearm.count({ where: { is_expired: true } });
    const expiring = await Firearm.count({ where: { is_expiring: true } });

    return {
      total,
      available,
      issued,
      maintenance,
      damaged,
      expired,
      expiring,
    };
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
