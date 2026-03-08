import User from "../models/User.js";
import Designation from "../models/Designation.js";
import Attendance from "../models/Attendance.js";
import { Op } from "sequelize";

class GuardViewService {
  /**
   * Get a single user by ID.
   */
  public async getUserById(id: number) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Designation,
          as: "designations",
        },
      ],
    });

    if (!user) return null;

    const userJSON = user.toJSON();
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    for (const designation of (userJSON as any).designations as any[]) {
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
   * Update user status by ID.
   */
  public async updateUserStatus(id: number, status: string) {
    const user = await User.findByPk(id);
    if (!user) return null;

    user.status = status;

    if (status === 'resigned') {
      user.termination_date = new Date();
    } else {
      user.termination_date = null;
    }

    await user.save();

    return this.getUserById(id);
  }
} 

export default new GuardViewService();
