import Attendance, { AttendanceCreationAttributes } from '../models/Attendance.js';
import Designation from '../models/Designation.js';
import Paginator from '../utils/Paginator.js';

class AttendanceService {
  /**
   * Get all attendances with pagination.
   */
  public async getAllAttendances(page: number, limit: number) {
    return await Paginator.paginate(Attendance, page, limit, {
      include: [
        { model: Designation, as: 'designation' },
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
        { model: Designation, as: 'designation' },
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
}

export default new AttendanceService();
