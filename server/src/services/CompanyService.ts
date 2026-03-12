import { Op } from 'sequelize';
import Company, { CompanyCreationAttributes } from '../models/Company.js';
import Designation from '../models/Designation.js';
import User from '../models/User.js';
import Paginator from '../utils/Paginator.js';

class CompanyService {
  /**
   * Get all companies with pagination.
   */
  public async getAllCompanies(page: number, limit: number, search?: string, status?: string) {
    const where: any = {};
    
    if (search && search !== '') {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status && status !== 'all') {
      where.is_active = status === 'active';
    }

    return await Paginator.paginate(Company, page, limit, {
      where,
      order: [['id', 'DESC']],
    });
  }

  /**
   * Get a single company by ID.
   */
  public async getCompanyById(id: number) {
    return await Company.findByPk(id);
  }

  /**
   * Create a new company.
   */
  public async createCompany(data: CompanyCreationAttributes) {
    return await Company.create(data);
  }

  /**
   * Update a company.
   */
  public async updateCompany(id: number, data: Partial<CompanyCreationAttributes>) {
    const company = await Company.findByPk(id);
    if (!company) throw new Error('Company not found');
    return await company.update(data);
  }

  /**
   * Delete a company (soft delete).
   */
  public async deleteCompany(id: number) {
    const company = await Company.findByPk(id);
    if (!company) throw new Error('Company not found');
    return await company.destroy();
  }

  /**
   * Get all guards assigned to a company with shift/duration info.
   */
  public async getCompanyGuards(companyId: number) {
    const company = await Company.findByPk(companyId);
    if (!company) throw new Error('Company not found');

    const designations = await Designation.findAll({
      where: { company_id: companyId, is_active: true },
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
      ],
      order: [['date_assigned', 'ASC']],
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
      company: {
        id: company.id,
        name: company.name,
        address: company.address,
        is_active: company.is_active,
      },
      guards: designations.map((d: any) => {
        // Calculate when the next shift switch will happen
        const lastChanged = d.last_shift_changes ? new Date(d.last_shift_changes) : d.date_assigned ? new Date(d.date_assigned) : null;
        const nextSwitch = lastChanged
          ? new Date(lastChanged.getTime() + 7 * 24 * 60 * 60 * 1000)
          : null;

        const now = new Date();
        let daysUntilSwitch = null;
        if (nextSwitch) {
          daysUntilSwitch = Math.max(0, Math.ceil((nextSwitch.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        }

        return {
          designation_id: d.id,
          guard_id: d.user?.guard_id,
          name: d.user ? `${d.user.first_name} ${d.user.last_name}` : 'Unknown',
          date_assigned: d.date_assigned,
          shift_in: d.shift_in,
          shift_out: d.shift_out,
          day_start: dayNames[d.day_start] || d.day_start,
          day_end: dayNames[d.day_end] || d.day_end,
          last_shift_changes: d.last_shift_changes,
          next_shift_switch: nextSwitch,
          days_until_switch: daysUntilSwitch,
        };
      }),
    };
  }
}

export default new CompanyService();
