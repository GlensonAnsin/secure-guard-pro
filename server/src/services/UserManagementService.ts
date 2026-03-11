import { Op } from 'sequelize';
import User, { UserCreationAttributes } from '../models/User.js';
import Role from '../models/Role.js';
import UserRole from '../models/UserRole.js';
import Paginator from '../utils/Paginator.js';

class UserManagementService {
  /**
   * Get all admin/HR users with pagination.
   */
  public async getAllUsers(page: number, limit: number, search?: string) {
    // Find admin and HR role IDs
    const roles = await Role.findAll({
      where: { slug: { [Op.in]: ['admin', 'hr'] } },
    });
    const roleIds = roles.map(r => r.id);

    const userRoles = await UserRole.findAll({
      where: { role_id: { [Op.in]: roleIds } },
      attributes: ['user_id'],
      raw: true,
    });
    const userIds = [...new Set(userRoles.map((ur: any) => ur.user_id))];

    if (userIds.length === 0) {
      return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }

    const where: any = { id: { [Op.in]: userIds } };
    if (search && search !== '') {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    return await Paginator.paginate(User, page, limit, {
      where,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: UserRole,
          as: 'userRoles',
          include: [{ model: Role, as: 'role' }],
        },
      ],
      order: [['id', 'DESC']],
    });
  }

  /**
   * Create a new admin/HR user.
   */
  public async createUser(data: UserCreationAttributes & { role_slug: string }) {
    const { role_slug, ...userData } = data;

    const role = await Role.findOne({ where: { slug: role_slug } });
    if (!role) throw new Error(`Invalid role: ${role_slug}`);

    const user = await User.create(userData);
    await UserRole.create({ user_id: user.id, role_id: role.id });

    return await User.findByPk(user.id, {
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
   * Update an admin/HR user.
   */
  public async updateUser(id: number, data: Partial<UserCreationAttributes> & { role_slug?: string }) {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');

    const { role_slug, ...userData } = data;

    await user.update(userData);

    // If role_slug provided, update role
    if (role_slug) {
      const role = await Role.findOne({ where: { slug: role_slug } });
      if (role) {
        // Remove existing non-guard roles and add new one
        const guardRole = await Role.findOne({ where: { slug: 'guard' } });
        await UserRole.destroy({
          where: {
            user_id: id,
            ...(guardRole ? { role_id: { [Op.ne]: guardRole.id } } : {}),
          },
        });
        await UserRole.findOrCreate({
          where: { user_id: id, role_id: role.id },
        });
      }
    }

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
   * Delete an admin/HR user (soft delete).
   */
  public async deleteUser(id: number) {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');
    return await user.destroy();
  }
}

export default new UserManagementService();
