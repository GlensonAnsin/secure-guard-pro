import Attendance, { AttendanceCreationAttributes } from '../models/Attendance.js';
import Designation from '../models/Designation.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import Paginator from '../utils/Paginator.js';
import { Op, Sequelize } from 'sequelize';

class AttendanceService {
  /**
   * Build status label from boolean flags.
   */
  private getStatusLabels(record: any): string[] {
    const labels: string[] = [];
    if (record.is_present) labels.push('Present');
    if (record.is_late) labels.push('Late');
    if (record.is_early_out) labels.push('Early Out');
    if (record.is_on_leave) labels.push('On Leave');
    if (labels.length === 0) {
      // On duty (timed in but not yet timed out)
      if (!record.time_out && !record.is_on_leave) labels.push('On Duty');
    }
    return labels;
  }

  /**
   * Get all attendances with pagination.
   */
  public async getAllAttendances(page: number, limit: number, search?: string, status?: string, date?: string) {
    const where: any = {};
    if (status && status !== 'all') {
      if (status === 'present') where.is_present = true;
      else if (status === 'late') where.is_late = true;
      else if (status === 'early_out') where.is_early_out = true;
      else if (status === 'on_leave') where.is_on_leave = true;
      else if (status === 'absent') {
        where.is_present = false;
        where.is_on_leave = false;
        where.time_out = { [Op.ne]: null };
      }
      else if (status === 'on_duty') {
        where.time_out = null;
        where.is_on_leave = false;
      }
    }
    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      where.time_in = {
        [Op.gte]: start,
        [Op.lte]: end,
      };
    }
    if (search) {
      where[Op.or] = [
        { '$designation.company.address$': { [Op.like]: `%${search}%` } },
        { '$designation.user.first_name$': { [Op.like]: `%${search}%` } },
        { '$designation.user.last_name$': { [Op.like]: `%${search}%` } },
        { '$designation.user.middle_name$': { [Op.like]: `%${search}%` } },
        { '$designation.user.guard_id$': { [Op.like]: `%${search}%` } },
      ];
    }

    return await Paginator.paginate(Attendance, page, limit, {
      where,
      include: [
        {
          model: Designation,
          as: 'designation',
          include: [
            { model: User, as: 'user', attributes: { exclude: ['password'] } },
            { model: Company, as: 'company' },
          ]
        },
      ],
      order: [['id', 'DESC']],
      subQuery: false,
    });
  }

  /**
   * Get all attendances without pagination for export.
   */
  public async exportAttendances(search?: string, status?: string, date?: string) {
    const where: any = {};
    if (status && status !== 'All' && status !== 'all') {
      if (status === 'present') where.is_present = true;
      else if (status === 'late') where.is_late = true;
      else if (status === 'early_out') where.is_early_out = true;
      else if (status === 'on_leave') where.is_on_leave = true;
      else if (status === 'absent') {
        where.is_present = false;
        where.is_on_leave = false;
        where.time_out = { [Op.ne]: null };
      }
      else if (status === 'on_duty') {
        where.time_out = null;
        where.is_on_leave = false;
      }
    }
    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      where.time_in = {
        [Op.gte]: start,
        [Op.lte]: end,
      };
    }
    if (search) {
      where[Op.or] = [
        { '$designation.company.address$': { [Op.like]: `%${search}%` } },
        { '$designation.user.first_name$': { [Op.like]: `%${search}%` } },
        { '$designation.user.last_name$': { [Op.like]: `%${search}%` } },
        { '$designation.user.middle_name$': { [Op.like]: `%${search}%` } },
        { '$designation.user.guard_id$': { [Op.like]: `%${search}%` } },
      ];
    }

    return await Attendance.findAll({
      where,
      include: [
        {
          model: Designation,
          as: 'designation',
          include: [
            { model: User, as: 'user', attributes: { exclude: ['password'] } },
            { model: Company, as: 'company' },
          ]
        },
      ],
      order: [['id', 'DESC']],
    });
  }

  /**
   * Get a single attendance by ID.
   */
  public async getAttendanceById(id: number) {
    return await Attendance.findByPk(id, {
      include: [
        {
          model: Designation,
          as: 'designation',
          include: [
            { model: User, as: 'user', attributes: { exclude: ['password'] } },
            { model: Company, as: 'company' },
          ]
        },
      ],
    });
  }

  /**
   * Create a new attendance.
   */
  public async createAttendance(data: AttendanceCreationAttributes) {
    return await Attendance.create(data);
  }

  /**
   * Update an attendance.
   */
  public async updateAttendance(id: number, data: Partial<AttendanceCreationAttributes>) {
    const attendance = await Attendance.findByPk(id);
    if (!attendance) throw new Error('Attendance not found');
    return await attendance.update(data);
  }

  /**
   * Delete an attendance.
   */
  public async deleteAttendance(id: number) {
    const attendance = await Attendance.findByPk(id);
    if (!attendance) throw new Error('Attendance not found');
    return await attendance.destroy();
  }

  /**
   * Get attendance stats using boolean flags.
   */
  public async getAttendanceStats(date?: string) {
    const where: any = {};
    let start: Date;
    let end: Date;

    if (date) {
      start = new Date(`${date}T00:00:00.000Z`);
      end = new Date(`${date}T23:59:59.999Z`);
    } else {
      const now = new Date();
      start = new Date(now.toISOString().split('T')[0] + 'T00:00:00.000Z');
      end = new Date(now.toISOString().split('T')[0] + 'T23:59:59.999Z');
    }

    where.time_in = {
      [Op.gte]: start,
      [Op.lte]: end,
    };

    const stats = await Attendance.findAll({
      where,
      attributes: [
        [Sequelize.literal("COUNT(CASE WHEN is_present = true THEN 1 END)"), 'present'],
        [Sequelize.literal("COUNT(CASE WHEN time_out IS NULL AND is_on_leave = false THEN 1 END)"), 'duty'],
        [Sequelize.literal("COUNT(CASE WHEN is_late = true THEN 1 END)"), 'late'],
        [Sequelize.literal("COUNT(CASE WHEN is_on_leave = true THEN 1 END)"), 'on_leave'],
        [Sequelize.literal("COUNT(CASE WHEN is_early_out = true THEN 1 END)"), 'early_out'],
        [Sequelize.literal("COUNT(CASE WHEN is_present = false AND is_on_leave = false AND time_out IS NOT NULL THEN 1 END)"), 'absent'],
      ],
      raw: true,
    });
    return { meta: stats[0] };
  }
}

export default new AttendanceService();
