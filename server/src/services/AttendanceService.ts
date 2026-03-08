import Attendance, { AttendanceCreationAttributes } from '../models/Attendance.js';
import Designation from '../models/Designation.js';
import User from '../models/User.js';
import Paginator from '../utils/Paginator.js';
import { Op, Sequelize } from 'sequelize';

class AttendanceService {
  /**
   * Get all attendances with pagination.
   */
  public async getAllAttendances(page: number, limit: number, search?: string, status?: string, date?: string) {
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (date) {
      where.time_in = {
        [Op.gte]: new Date(`${date}T00:00:00.000Z`),
        [Op.lte]: new Date(`${date}T23:59:59.999Z`),
      };
    }
    if (search) {
      where[Op.or] = [
        { '$designation.address$': { [Op.like]: `%${search}%` } },
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
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] 
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
    if (status && status !== 'All') {
      where.status = status;
    }
    if (date) {
      where.time_in = {
        [Op.gte]: new Date(`${date}T00:00:00.000Z`),
        [Op.lte]: new Date(`${date}T23:59:59.999Z`),
      };
    }
    if (search) {
      where[Op.or] = [
        { '$designation.address$': { [Op.like]: `%${search}%` } },
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
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] 
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
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] 
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
   * Get attendance stats
   */
  public async getAttendanceStats() {
    const stats = await Attendance.findAll({
      attributes: [
        [Sequelize.literal("COUNT(CASE WHEN status = 'present' THEN 1 END)"), 'present'],
        [Sequelize.literal("COUNT(CASE WHEN status = 'on_duty' THEN 1 END)"), 'duty'],
        [Sequelize.literal("COUNT(CASE WHEN status = 'late' THEN 1 END)"), 'late'],
        [Sequelize.literal("COUNT(CASE WHEN status = 'absent' THEN 1 END)"), 'absent'],
        [Sequelize.literal("COUNT(CASE WHEN status = 'on_leave' THEN 1 END)"), 'on_leave'],
        [Sequelize.literal("COUNT(CASE WHEN status = 'half_day' THEN 1 END)"), 'half_day'],
      ],
      raw: true,
    });
    return { meta: stats[0] };
  }
}

export default new AttendanceService();
