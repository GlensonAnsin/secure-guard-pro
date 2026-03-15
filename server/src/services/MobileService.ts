import User from '../models/User.js';
import Designation from '../models/Designation.js';
import Company from '../models/Company.js';
import Firearm from '../models/Firearm.js';
import FirearmIssuance from '../models/FirearmIssuance.js';
import Attendance from '../models/Attendance.js';
import { Op } from 'sequelize';

// In-memory tracker for purged attendance records to prevent recreation without DB schema changes
const purgedAttendanceTracking = new Set<string>();

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
          include: [
            { model: Company, as: 'company' },
          ],
        },
        {
          model: FirearmIssuance,
          as: 'firearmIssuances',
          include: [
            { model: Firearm, as: 'firearm' },
          ],
        },
      ],
      order: [
        [{ model: Designation, as: 'designations' }, 'date_assigned', 'DESC'],
        [{ model: FirearmIssuance, as: 'firearmIssuances' }, 'date_of_issuance', 'DESC'],
      ],
    });

    if (!user) throw new Error('Guard not found');

    const userJSON = user.toJSON() as any;
    
    const mapDesignation = (d: any) => ({
      ...d,
      client: d.company?.name || 'N/A',
      address: d.company?.address || 'N/A',
      status: d.is_active ? 'active' : d.is_completed ? 'completed' : d.is_dismissed ? 'dismissed' : 'inactive'
    });

    const activeDesignation = userJSON.designations?.find((d: any) => d.is_active) || null;
    const activeDesignationMapped = activeDesignation ? mapDesignation(activeDesignation) : null;
    const designationHistory = (userJSON.designations || []).map(mapDesignation);

    const activeFirearmIssuance = userJSON.firearmIssuances?.find((fi: any) => !fi.turn_in_date) || null;
    const firearmHistory = userJSON.firearmIssuances || [];

    if (activeDesignationMapped) {
      await this.syncDailyAttendance(userJSON, activeDesignationMapped);
    }

    // Fetch the most recent attendance for this designation
    let latestAttendance = null;
    if (activeDesignationMapped) {
      latestAttendance = await Attendance.findOne({
        where: { designation_id: activeDesignationMapped.id },
        order: [['time_in', 'DESC']],
      });
    }


    const userStatus = userJSON.is_resigned 
      ? 'resigned' 
      : userJSON.is_on_leave 
        ? 'on_leave' 
        : activeDesignationMapped 
          ? 'assigned' 
          : 'unassigned';

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
        status: userStatus,
      },
      designation: activeDesignationMapped,
      designationHistory,
      currentFirearm: activeFirearmIssuance,
      firearmHistory,
      latestAttendance: latestAttendance 
        ? { 
            ...latestAttendance.toJSON(), 
            status: this.getStatuses(latestAttendance)[0],
            statuses: this.getStatuses(latestAttendance)
          } 
        : null,
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

    // Sync before fetching
    if (user) {
      const activeDesignation = await Designation.findOne({ where: { user_id: userId, is_active: true } });
      if (activeDesignation) {
        await this.syncDailyAttendance(userJSON, activeDesignation.toJSON());
      }
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

    return attendances.map(a => {
      const record = a.toJSON() as any;
      const statuses = this.getStatuses(record);

      return {
        ...record,
        status: statuses[0],
        statuses: statuses
      };
    });
  }

  /**
   * Time in: create a new attendance record.
   */
  public async timeIn(designationId: number, timestamp?: string) {
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
    const now = timestamp ? new Date(timestamp) : new Date();

    if (designation) {
      const [shiftInH, shiftInM] = designation.shift_in.split(':').map(Number);
      const shiftInDate = new Date(now);
      shiftInDate.setHours(shiftInH, shiftInM, 0, 0);

      // Handle overnight shift - if we time in early in the morning for a shift that started yesterday
      if (now.getHours() < 6 && shiftInH > 18) {
        shiftInDate.setDate(shiftInDate.getDate() - 1);
      }

      // Late if timed in more than 15 minutes after shift start
      const gracePeriodMs = 15 * 60 * 1000;
      if (now.getTime() > shiftInDate.getTime() + gracePeriodMs) {
        isLate = true;
      }
    }

    const isEarlyIn = designation && now.getTime() < new Date(new Date(now).setHours(parseInt(designation.shift_in.split(':')[0]), parseInt(designation.shift_in.split(':')[1]), 0, 0)).getTime();

    const attendance = await Attendance.create({
      designation_id: designationId,
      time_in: now,
      is_present: true,
      is_late: isLate,
      is_early_in: isEarlyIn || false,
    });

    return attendance;
  }

  /**
   * Time out: update attendance with time_out and calculate hours_worked.
   */
  public async timeOut(attendanceId: number, timestamp?: string) {
    const attendance = await Attendance.findByPk(attendanceId);

    if (!attendance) throw new Error('Attendance record not found');
    if (attendance.time_out) throw new Error('Already timed out');

    const timeOut = timestamp ? new Date(timestamp) : new Date();
    const timeIn = new Date(attendance.time_in);
    const diffMs = timeOut.getTime() - timeIn.getTime();
    const hoursWorked = Math.round(diffMs / (1000 * 60 * 60) * 100) / 100;

    // Check for early out based on designation shift_out
    const designation = await Designation.findByPk(attendance.designation_id);
    let isEarlyOut = false;
    if (designation) {
      const [shiftOutH, shiftOutM] = designation.shift_out.split(':').map(Number);
      const shiftOutDate = new Date(timeOut);
      shiftOutDate.setHours(shiftOutH, shiftOutM, 0, 0);

      // Handle overnight shift - if shift ends in the morning but timeout is before that morning hour
      if (shiftOutH < 12 && timeIn.getHours() > 18 && timeOut < shiftOutDate) {
        // Already on the correct day (tomorrow relative to shift start)
      } else if (shiftOutH > 18 && timeIn.getHours() > 18 && timeOut < shiftOutDate) {
         // Same day shift, timed out before end
      }

      if (timeOut < shiftOutDate) {
        isEarlyOut = true;
      }
    }

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

    // [REMOVED TOP-LEVEL SKIP FOR 0-DURATION SHIFTS TO ALLOW LEAVE RECORDING]

    // Handle overnight shifts
    if (shiftInH > shiftOutH || (shiftInH === shiftOutH && shiftInM > shiftOutM)) {
      if (now.getHours() < shiftInH) {
        start.setDate(start.getDate() - 1);
      } else {
        end.setDate(end.getDate() + 1);
      }
    }

    // Skip if not a working day
    const dayStart = designation.day_start;
    const dayEnd = designation.day_end;
    const today = start.getDay(); // Check relative to shift start day

    const isWorkingDay = dayStart <= dayEnd
      ? (today >= dayStart && today <= dayEnd)
      : (today >= dayStart || today <= dayEnd);

    if (!isWorkingDay) return;

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
      },
      paranoid: false
    });

    if (existingAttendance) {
      // If it's a system-generated record (Absent or On Leave), we might need to update it
      // if the guard's leave status changed since it was created.
      if (!existingAttendance.is_present) {
        if (user.is_on_leave && existingAttendance.note !== 'On Leave') {
          await existingAttendance.update({ note: 'On Leave' });
        } else if (!user.is_on_leave && existingAttendance.note === 'On Leave') {
          await existingAttendance.update({ note: null });
        }
      }
      return;
    }

    if (user.is_on_leave && now >= start) {
      // Create on_leave attendance
      await Attendance.create({
        designation_id: designation.id,
        time_in: start,
        time_out: end,
        hours_worked: 0,
        note: 'On Leave',
      });
    } else if (now > end) {
      // Skip absent creation for 0-duration shifts to avoid spam
      if (designation.shift_in === designation.shift_out) return;

      // [REFINE] Only auto-recover records for the last 24 hours to prevent aggressive recreation
      const recoveryThreshold = new Date(end.getTime() + 24 * 60 * 60 * 1000);
      if (now > recoveryThreshold) return;

      // [REFINE] Check if this record was specifically purged during this session
      if (this.isPurged(designation.id, start)) return;

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

  /**
   * Proactively sync all active designations for all users (e.g. for admin view).
   */
  public async syncAllActiveDesignations() {
    const activeDesignations = await Designation.findAll({
      where: { is_active: true },
      include: [{ model: User, as: 'user' }]
    });

    for (const designation of activeDesignations as any[]) {
      if (designation.user) {
        await this.syncDailyAttendance(designation.user.toJSON(), designation.toJSON());
      }
    }
  }

  /**
   * Track a purged attendance record to prevent its recreation during the current session.
   */
  public trackPurgedAttendance(designationId: number, timeIn: Date) {
    const shiftDateStr = timeIn.toISOString().split('T')[0];
    purgedAttendanceTracking.add(`${designationId}_${shiftDateStr}`);
  }

  /**
   * Helper to determine status strings for an attendance record.
   */
  private getStatuses(record: any): string[] {
    const statuses = [];
    if (record.note === 'On Leave') statuses.push('on_leave');
    else if (!record.is_present) statuses.push('absent');
    else {
      if (!record.time_out) statuses.push('on_duty');
      else statuses.push('present');

      if (record.is_late) statuses.push('late');
      if (record.is_early_in) statuses.push('early_in');
      if (record.is_early_out) statuses.push('early_out');
    }
    return statuses;
  }

  /**
   * Check if an attendance record was purged during this session.
   */
  private isPurged(designationId: number, timeIn: Date): boolean {
    const shiftDateStr = timeIn.toISOString().split('T')[0];
    return purgedAttendanceTracking.has(`${designationId}_${shiftDateStr}`);
  }
}

export default new MobileService();
