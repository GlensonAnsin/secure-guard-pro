import User from '../models/User.js';
import Designation from '../models/Designation.js';
import Company from '../models/Company.js';
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
          where: { is_active: true },
          required: false,
          include: [
            { model: Company, as: 'company' },
          ],
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
        street: userJSON.street,
        barangay: userJSON.barangay,
        city_or_municipality: userJSON.city_or_municipality,
        province: userJSON.province,
        region: userJSON.region,
        email: userJSON.email,
        cel_num: userJSON.cel_num,
        is_available: userJSON.is_available,
        is_on_leave: userJSON.is_on_leave,
        is_resigned: userJSON.is_resigned,
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
      limit: 30,
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

    // Check if late based on designation shift_in
    const designation = await Designation.findByPk(designationId);
    let isLate = false;
    if (designation) {
      const now = new Date();
      const [shiftInH, shiftInM] = designation.shift_in.split(':').map(Number);
      const shiftInDate = new Date(now);
      shiftInDate.setHours(shiftInH, shiftInM, 0, 0);

      // Late if timed in more than 15 minutes after shift start
      const diffMinutes = (now.getTime() - shiftInDate.getTime()) / (1000 * 60);
      if (diffMinutes > 15) {
        isLate = true;
      }
    }

    const attendance = await Attendance.create({
      designation_id: designationId,
      time_in: new Date(),
      is_late: isLate,
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

    // Check if early out (less than 6 hours)
    const isEarlyOut = hoursWorked < 6;

    await attendance.update({
      time_out: timeOut,
      hours_worked: hoursWorked,
      is_present: true,
      is_early_out: isEarlyOut,
    });

    return attendance;
  }

  /**
   * Sync daily attendance for the guard.
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
      if (now.getHours() < shiftInH) {
        start.setDate(start.getDate() - 1);
      } else {
        end.setDate(end.getDate() + 1);
      }
    }

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
      if (user.is_on_leave) {
        // Create on_leave attendance
        await Attendance.create({
          designation_id: designation.id,
          time_in: start,
          time_out: end,
          hours_worked: 0,
          is_on_leave: true,
        });
      } else if (now > end) {
        // Shift has ended and guard never timed in — absent
        await Attendance.create({
          designation_id: designation.id,
          time_in: start,
          time_out: end,
          hours_worked: 0,
          is_present: false,
          is_late: false,
        });
      }
    }
  }
}

export default new MobileService();
