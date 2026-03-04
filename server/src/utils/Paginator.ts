import { Model, ModelStatic, FindOptions } from 'sequelize';
import { PaginatedResult } from '../types/Pagination.js';

class Paginator {
  /**
   * Paginate a Sequelize Model.
   * * @param model The Sequelize Model class (e.g., User)
   * @param page The current page number (default: 1)
   * @param limit The number of items per page (default: 15)
   * @param options Additional Sequelize query options (where, include, order)
   */
  public async paginate<T extends Model>(
    model: ModelStatic<T>,
    page: number = 1,
    limit: number = 15,
    options: FindOptions = {}
  ): Promise<PaginatedResult<T>> {
    const offset = (page - 1) * limit;

    // Sequelize's findAndCountAll is perfect for pagination
    const { count, rows } = await model.findAndCountAll({
      ...options,
      limit,
      offset,
    });

    return {
      data: rows,
      meta: {
        total: count,
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(count / limit),
        from: offset + 1,
        to: offset + rows.length,
      },
    };
  }
}

export default new Paginator();