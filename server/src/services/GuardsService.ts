import { Op, Sequelize } from 'sequelize';
import User, { UserCreationAttributes } from '../models/User.js';
import Paginator from '../utils/Paginator.js';

class GuardService {
  /**
   * Get all users with pagination.
   */
  public async getAllUsers(page: number, limit: number, search?: string, status?: string) {
    return await Paginator.paginate(User, page, limit, {
      attributes: { exclude: ['password'] },
      order: [['id', 'DESC']],
      where: {
        role: 'guard',
        ...(search !== '' && { [Op.or]: [
          { first_name: { [Op.like]: `%${search}%` } },
          { middle_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { suffix: { [Op.like]: `%${search}%` } },
          { guard_id: { [Op.like]: `%${search}%` } },
        ] }),
        ...(status === 'all' ? {} : { status }),
      },
    });
  }

  /**
   * Get a single user by ID.
   */
  public async getUserById(id: number) {
    return await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
  }

  /**
   * Create a new user.
   */
  public async createUser(data: UserCreationAttributes) {
    return await User.create(data);
  }

  /**
   * Update a user.
   */
  public async updateUser(id: number, data: Partial<UserCreationAttributes>) {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');
    return await user.update(data);
  }

  /**
   * Delete a user (soft delete).
   */
  public async deleteUser(id: number) {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');
    return await user.destroy();
  }

  public async getGuardStats() {
    const stats = await User.findAll({
      where: {
        role: 'guard',
      },
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
        [Sequelize.literal("COUNT(CASE WHEN status = 'active' THEN 1 END)"), 'active'],
        [Sequelize.literal("COUNT(CASE WHEN status = 'unassigned' THEN 1 END)"), 'unassigned'],
        [Sequelize.literal("COUNT(CASE WHEN status = 'on_leave' THEN 1 END)"), 'on_leave'],
        [Sequelize.literal("COUNT(CASE WHEN status = 'inactive' THEN 1 END)"), 'inactive'],
      ],
      raw: true,
    });
    return { meta: stats[0] };
  }
}

export default new GuardService();