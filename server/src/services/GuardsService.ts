import { Op, Sequelize } from 'sequelize';
import User, { UserCreationAttributes } from '../models/User.js';
import UserRole from '../models/UserRole.js';
import Role from '../models/Role.js';
import Paginator from '../utils/Paginator.js';

class GuardService {
  /**
   * Get all guard users with pagination.
   */
  public async getAllUsers(page: number, limit: number, search?: string, status?: string) {
    const where: any = {};

    if (search && search !== '') {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { middle_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { suffix: { [Op.like]: `%${search}%` } },
        { guard_id: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status && status !== 'all') {
      if (status === 'available') where.is_available = true;
      else if (status === 'on_leave') where.is_on_leave = true;
      else if (status === 'resigned') where.is_resigned = true;
      else if (status === 'assigned') where.is_available = false;
    }

    return await Paginator.paginate(User, page, limit, {
      attributes: { exclude: ['password'] },
      order: [['id', 'DESC']],
      where,
      include: [
        {
          model: UserRole,
          as: 'userRoles',
          include: [{ model: Role, as: 'role' }],
          where: { role_id: { [Op.in]: Sequelize.literal("(SELECT id FROM roles WHERE slug = 'guard')") } },
          required: true,
        },
      ],
    });
  }

  /**
   * Get a single user by ID.
   */
  public async getUserById(id: number) {
    return await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: UserRole,
          as: 'userRoles',
          include: [{ model: Role, as: 'role' }],
        },
      ],
    });
  }

  /**
   * Create a new user.
   */
  public async createUser(data: UserCreationAttributes) {
    const user = await User.create(data);
    
    // Assign guard role
    const guardRole = await Role.findOne({ where: { slug: 'guard' } });
    if (guardRole) {
      await UserRole.create({ user_id: user.id, role_id: guardRole.id });
    }

    return user;
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
    // Get guard role ID
    const guardRole = await Role.findOne({ where: { slug: 'guard' } });
    if (!guardRole) return { meta: { total: 0, available: 0, assigned: 0, on_leave: 0, resigned: 0 } };

    const guardUserIds = await UserRole.findAll({
      where: { role_id: guardRole.id },
      attributes: ['user_id'],
      raw: true,
    });
    const ids = guardUserIds.map((ur: any) => ur.user_id);

    if (ids.length === 0) return { meta: { total: 0, available: 0, assigned: 0, on_leave: 0, resigned: 0 } };

    const stats = await User.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
        [Sequelize.literal("COUNT(CASE WHEN is_available = true AND is_on_leave = false AND is_resigned = false THEN 1 END)"), 'available'],
        [Sequelize.literal("COUNT(CASE WHEN is_available = false AND is_resigned = false THEN 1 END)"), 'assigned'],
        [Sequelize.literal("COUNT(CASE WHEN is_on_leave = true THEN 1 END)"), 'on_leave'],
        [Sequelize.literal("COUNT(CASE WHEN is_resigned = true THEN 1 END)"), 'resigned'],
      ],
      raw: true,
    });
    return { meta: stats[0] };
  }
}

export default new GuardService();