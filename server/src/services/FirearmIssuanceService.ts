import { Op } from 'sequelize';
import FirearmIssuance, { FirearmIssuanceCreationAttributes } from '../models/FirearmIssuance.js';
import User from '../models/User.js';
import Firearm from '../models/Firearm.js';
import Paginator from '../utils/Paginator.js';
import Database from '../models/index.js';

class FirearmIssuanceService {
  /**
   * Get all firearm issuances with pagination.
   */
  public async getAllIssuances(page: number, limit: number, search = '', status = 'all') {
    return await Paginator.paginate(FirearmIssuance, page, limit, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Firearm, as: 'firearm' },
      ],
      where: {
        ...(status === 'active' ? { turn_in_date: null } : status === 'returned' ? { turn_in_date: { [Op.ne]: null } } : {}),
        ...(search !== '' && {
          [Op.or]: [
            { '$user.first_name$': { [Op.like]: `%${search}%` } },
            { '$user.last_name$': { [Op.like]: `%${search}%` } },
            { '$user.guard_id$': { [Op.like]: `%${search}%` } },
            { '$firearm.serial_num$': { [Op.like]: `%${search}%` } },
            { '$firearm.type$': { [Op.like]: `%${search}%` } },
          ],
        }),
      },
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
    const transaction = await Database.sequelize.transaction();
    try {
      const issuance = await FirearmIssuance.create(data, { transaction });

      const firearm = await Firearm.findByPk(data.firearm_id, { transaction });
      if (firearm) {
        await firearm.update({ is_available: false }, { transaction });
      }

      await transaction.commit();
      return issuance;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update a firearm issuance.
   */
  public async updateIssuance(id: number, data: Partial<FirearmIssuanceCreationAttributes>) {
    const issuance = await FirearmIssuance.findByPk(id);
    if (!issuance) throw new Error('Firearm issuance not found');

    // If not returning, just do a normal update
    if (!data.turn_in_date) {
      return await issuance.update(data);
    }

    // If providing a turn_in_date, return the firearm to available status atomically
    const transaction = await Database.sequelize.transaction();
    try {
      const updatedIssuance = await issuance.update(data, { transaction });

      const firearm = await Firearm.findByPk(issuance.firearm_id, { transaction });
      if (firearm) {
        await firearm.update({ is_available: true }, { transaction });
      }

      await transaction.commit();
      return updatedIssuance;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
