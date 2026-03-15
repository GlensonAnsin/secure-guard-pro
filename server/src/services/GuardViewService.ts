import User from "../models/User.js";
import Designation from "../models/Designation.js";
import Company from "../models/Company.js";
import Attendance from "../models/Attendance.js";
import FirearmIssuance from "../models/FirearmIssuance.js";
import Firearm from "../models/Firearm.js";
import { Op, Sequelize } from "sequelize";

class GuardViewService {
  /**
   * Get a single user by ID with designations and company info.
   */
  public async getUserById(id: number) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Designation,
          as: "designations",
          include: [
            {
              model: Company,
              as: "company",
            },
          ],
        },
        {
          model: FirearmIssuance,
          as: "firearmIssuances",
          include: [
            {
              model: Firearm,
              as: "firearm",
            },
          ],
        },
      ],
    });

    if (!user) return null;

    const userJSON = user.toJSON() as any;
    
    // Compute multiple statuses
    const statuses: string[] = [];
    const hasActiveAssignment = userJSON.designations?.some((d: any) => d.is_active);

    if (userJSON.is_resigned) {
      statuses.push('resigned');
    } else {
      if (hasActiveAssignment) {
        statuses.push('assigned');
      } else {
        statuses.push('available');
      }
      if (userJSON.is_on_leave) {
        statuses.push('on_leave');
      }
    }
    
    userJSON.statuses = statuses;
    userJSON.status = statuses[0] || 'available'; // Keep legacy status for compatibility

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    for (const designation of userJSON.designations || []) {
      const totalHours = await Attendance.sum('hours_worked', {
        where: { designation_id: designation.id }
      });

      const monthlyHours = await Attendance.sum('hours_worked', {
        where: {
          designation_id: designation.id,
          time_in: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        }
      });

      designation.total_hours_worked = totalHours || 0;
      designation.monthly_hours_worked = monthlyHours || 0;
    }

    return userJSON;
  }

  /**
   * Update user status flags.
   */
  public async updateUserStatus(id: number, status: string) {
    const user = await User.findByPk(id);
    if (!user) return null;

    if (status === 'on_leave') {
      user.is_on_leave = true;
    } else if (status === 'not_on_leave') {
      user.is_on_leave = false;
    } else if (status === 'available') {
      user.is_on_leave = false;
      user.is_available = true;
    } else if (status === 'resigned') {
      user.is_resigned = true;
      user.is_available = false;
      user.is_on_leave = false;
      user.termination_date = new Date();

      // Automatically cancel current assignments
      await Designation.update(
        { 
          is_active: false, 
          is_dismissed: true, 
          date_of_dismissal: new Date().toISOString().split('T')[0] as any,
          note: Sequelize.literal("CONCAT(COALESCE(note, ''), '\nAutomated dismissal due to resignation.')")
        },
        { 
          where: { 
            user_id: id, 
            is_active: true 
          } 
        }
      );
    } else if (status === 'assigned') {
      user.is_available = false;
      // Note: we don't automatically set is_on_leave here as it can coexist
    }

    await user.save();
    return this.getUserById(id);
  }
}

export default new GuardViewService();
