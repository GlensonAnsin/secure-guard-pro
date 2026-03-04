import User, { UserCreationAttributes } from '../models/User.js';
import Paginator from '../utils/Paginator.js';

class UserService {
  /**
   * Get all users with pagination.
   */
  public async getAllUsers(page: number, limit: number) {
    return await Paginator.paginate(User, page, limit, {
      attributes: { exclude: ['password'] },
      order: [['id', 'DESC']],
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
}

export default new UserService();