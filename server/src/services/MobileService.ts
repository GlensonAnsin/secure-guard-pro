import User from '../models/User.js';
import Designation from '../models/Designation.js';
import Attendance from '../models/Attendance.js';
import { Op } from 'sequelize';

class MobileService {
  /**
   * Get guard profile with current active designation.
   */
  public async getGuardProfile(userId: number) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Designation,
          as: 'designations',
          where: { status: 'active' },
          required: false,
        },
      ],
    });

    if (!user) throw new Error('Guard not found');

    const userJSON = user.toJSON() as any;
    const activeDesignation = userJSON.designations?.[0] || null;

    if (activeDesignation) {
      await this.syncDailyAttendance(userJSON, activeDesignation);
    }

    // Fetch the most recent attendance for this designation
    let latestAttendance = null;
    if (activeDesignation) {
      latestAttendance = await Attendance.findOne({
        where: { designation_id: activeDesignation.id },
        order: [['time_in', 'DESC']],
      });
    }

    return {
      user: {
        id: userJSON.id,
        guard_id: userJSON.guard_id,
        first_name: userJSON.first_name,
        middle_name: userJSON.middle_name,
        last_name: userJSON.last_name,
        suffix: userJSON.suffix,
        role: userJSON.role,
        street: userJSON.street,
        barangay: userJSON.barangay,
        city_or_municipality: userJSON.city_or_municipality,
        province: userJSON.province,
        region: userJSON.region,
        email: userJSON.email,
        cel_num: userJSON.cel_num,
        status: userJSON.status,
        date_hired: userJSON.date_hired,
      },
      designation: activeDesignation,
      latestAttendance: latestAttendance ? latestAttendance.toJSON() : null,
    };
  }

  /**
   * Get attendance history for the guard.
   */
  public async getAttendances(userId: number) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Designation,
          as: 'designations',
          attributes: ['id'],
        },
      ],
    });

    if (!user) throw new Error('Guard not found');

    const userJSON = user.toJSON() as any;
    const designationIds = userJSON.designations?.map((d: any) => d.id) || [];

    if (designationIds.length === 0) {
      return [];
    }

    const attendances = await Attendance.findAll({
      where: {
        designation_id: {
          [Op.in]: designationIds,
        },
      },
      order: [['time_in', 'DESC']],
      limit: 30, // Get last 30 attendances by default
    });

    return attendances;
  }

  /**
   * Time in: create a new attendance record.
   */
  public async timeIn(designationId: number) {
    // Check for existing unclosed attendance
    const existing = await Attendance.findOne({
      where: {
        designation_id: designationId,
        time_out: null,
      },
    });

    if (existing) {
      throw new Error('You are already timed in. Please time out first.');
    }

    const attendance = await Attendance.create({
      designation_id: designationId,
      time_in: new Date(),
      status: 'on_duty',
    });

    return attendance;
  }

  /**
   * Time out: update attendance with time_out and calculate hours_worked.
   */
  public async timeOut(attendanceId: number) {
    const attendance = await Attendance.findByPk(attendanceId);

    if (!attendance) throw new Error('Attendance record not found');
    if (attendance.time_out) throw new Error('Already timed out');

    const timeOut = new Date();
    const timeIn = new Date(attendance.time_in);
    const diffMs = timeOut.getTime() - timeIn.getTime();
    const hoursWorked = Math.round(diffMs / (1000 * 60 * 60) * 100) / 100;

    // Determine status based on hours worked
    let status = 'present';
    if (hoursWorked < 4) {
      status = 'half_day';
    }

    await attendance.update({
      time_out: timeOut,
      hours_worked: hoursWorked,
      status,
    });

    return attendance;
  }

  /**
   * Sync daily attendance for the guard.
   * If the guard is on leave, create an on_leave record for today.
   * If the guard missed their shift, create an absent record.
   */
  private async syncDailyAttendance(user: any, designation: any) {
    if (!designation) return;

    const now = new Date();
    const [shiftInH, shiftInM] = designation.shift_in.split(':').map(Number);
    const [shiftOutH, shiftOutM] = designation.shift_out.split(':').map(Number);

    const shiftInDate = new Date(now);
    shiftInDate.setHours(shiftInH, shiftInM, 0, 0);

    const shiftOutDate = new Date(now);
    shiftOutDate.setHours(shiftOutH, shiftOutM, 0, 0);

    let start = new Date(shiftInDate);
    let end = new Date(shiftOutDate);

    // Handle overnight shifts
    if (shiftInH > shiftOutH || (shiftInH === shiftOutH && shiftInM > shiftOutM)) {
      if (now.getHours() < shiftInH) { // Shift started yesterday
        start.setDate(start.getDate() - 1);
      } else { // Shift ends tomorrow
        end.setDate(end.getDate() + 1);
      }
    }

    // Determine the start and end of the day for the shift start
    const shiftStartStartOfDay = new Date(start);
    shiftStartStartOfDay.setHours(0, 0, 0, 0);
    const shiftStartEndOfDay = new Date(start);
    shiftStartEndOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.findOne({
      where: {
        designation_id: designation.id,
        time_in: {
          [Op.between]: [shiftStartStartOfDay, shiftStartEndOfDay]
        }
      }
    });

    if (!existingAttendance) {
      if (user.status === 'on_leave') {
        // Create on_leave attendance
        await Attendance.create({
          designation_id: designation.id,
          time_in: start,
          time_out: end,
          hours_worked: 0,
          status: 'on_leave',
        });
      } else if (now > end) {
        // Shift has ended and guard never timed in
        await Attendance.create({
          designation_id: designation.id,
          time_in: start,
          time_out: end,
          hours_worked: 0,
          status: 'absent',
        });
      }
    }
  }
}

export default new MobileService();
