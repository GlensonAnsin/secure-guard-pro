import { Sequelize, Op } from "sequelize";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Designation from "../models/Designation.js";
import FirearmIssuance from "../models/FirearmIssuance.js";
import Firearm from "../models/Firearm.js";

class DashboardService {
  /**
   * Get guard stats - kept for backward compatibility if needed
   */
  public async getGuardStats() {
    const stats = await User.findAll({
      where: {
        role: "guard",
      },
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("id")), "total"],
        [Sequelize.literal("COUNT(CASE WHEN status = 'assigned' THEN 1 END)"), "assigned"],
        [Sequelize.literal("COUNT(CASE WHEN status = 'unassigned' THEN 1 END)"), "unassigned"],
        [Sequelize.literal("COUNT(CASE WHEN status = 'on_leave' THEN 1 END)"), "on_leave"],
        [Sequelize.literal("COUNT(CASE WHEN status = 'resigned' THEN 1 END)"), "resigned"],
      ],
      raw: true,
    });
    return { meta: stats[0] };
  }

  /**
   * Get all dashboard data (Weekly Attendance, Monthly Reports, Recent Activities)
   */
  public async getDashboardData() {
    // 1. Weekly Attendance (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    });

    const attendanceData = await Promise.all(
      last7Days.map(async (dateStr) => {
        const stats: any = await Attendance.findAll({
          where: {
            time_in: {
              [Op.gte]: new Date(`${dateStr}T00:00:00.000Z`),
              [Op.lte]: new Date(`${dateStr}T23:59:59.999Z`),
            },
          },
          attributes: [
            [Sequelize.literal("COUNT(CASE WHEN status = 'present' THEN 1 END)"), "present"],
            [Sequelize.literal("COUNT(CASE WHEN status = 'late' THEN 1 END)"), "late"],
            [Sequelize.literal("COUNT(CASE WHEN status = 'absent' THEN 1 END)"), "absent"],
          ],
          raw: true,
        });

        // Format day name
        const dayName = new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
        return {
          name: dayName,
          present: parseInt(stats[0]?.present) || 0,
          late: parseInt(stats[0]?.late) || 0,
          absent: parseInt(stats[0]?.absent) || 0,
        };
      })
    );

    // 2. Monthly Reports
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        month: d.getMonth() + 1, // 1-12
        year: d.getFullYear(),
        name: d.toLocaleDateString("en-US", { month: "short" }),
      };
    });

    const issuanceData = await Promise.all(
      last6Months.map(async (m) => {
        const startOfMonth = `${m.year}-${String(m.month).padStart(2, "0")}-01`;
        const endDay = new Date(m.year, m.month, 0).getDate();
        const endOfMonth = `${m.year}-${String(m.month).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

        const count = await FirearmIssuance.count({
          where: {
            date_of_issuance: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
        });

        return {
          name: m.name,
          issuances: count,
        };
      })
    );

    const recentActivities = await this.getRecentActivities(5);

    return {
      attendanceData,
      issuanceData,
      recentActivities,
    };
  }

  public async getRecentActivities(limit: number = 5) {
    // 3. Recent Activities (Guards, Firearms, Designations, Issuances)
    const recentGuards = await User.findAll({
      where: { role: 'guard' },
      limit,
      order: [['created_at', 'DESC']],
    });

    const recentFirearms = await Firearm.findAll({
      limit,
      order: [['created_at', 'DESC']],
    });

    const recentDesignations = await Designation.findAll({
      limit,
      order: [['updated_at', 'DESC']],
      include: [{ model: User, as: 'user' }],
    });

    const recentIssuances = await FirearmIssuance.findAll({
      limit,
      order: [['updated_at', 'DESC']],
      include: [
        { model: User, as: 'user' },
        { model: Firearm, as: 'firearm' },
      ],
    });

    const activities: any[] = [];

    // 3.a New Guards
    recentGuards.forEach((g: any) => {
      const gTime = g.createdAt || g.created_at || new Date();
      activities.push({
        id: `grd_${g.id}`,
        user: `${g.first_name} ${g.last_name}`,
        action: `New guard registered`,
        time: gTime,
        type: "assignment",
      });
    });

    // 3.b New Firearms
    recentFirearms.forEach((f: any) => {
      const fTime = f.createdAt || f.created_at || new Date();
      activities.push({
        id: `fa_${f.id}`,
        user: "System Admin",
        action: `New firearm added: ${f.serial_number || f.type}`,
        time: fTime,
        type: "assignment",
      });
    });

    // 3.c Designations
    recentDesignations.forEach((d: any) => {
      const user = d.user;
      let actionText = `Assigned to ${d.client}`;
      let type = "assignment";
      if (d.status === "dismissed") {
        actionText = `Dismissed from ${d.client}`;
        type = "alert";
      } else if (d.status === "completed") {
        actionText = `Completed designation at ${d.client}`;
      } else if (d.status !== "assigned") {
        actionText = `Designation marked as ${d.status}`;
      }
      
      const dTime = d.updatedAt || d.updated_at || d.createdAt || d.created_at || new Date();
      activities.push({
        id: `des_${d.id}_${new Date(dTime).getTime()}`,
        user: user ? `${user.first_name} ${user.last_name}` : "Unknown",
        action: actionText,
        time: dTime,
        type,
      });
    });

    // 3.d Firearm Issuances
    recentIssuances.forEach((i: any) => {
      const user = i.user ? `${i.user.first_name} ${i.user.last_name}` : "Unknown";
      const firearmName = i.firearm?.serial_number || i.firearm?.type || "Unknown Firearm";
      
      const iCreated = new Date(i.createdAt || i.created_at || new Date());
      const iUpdated = new Date(i.updatedAt || i.updated_at || i.createdAt || i.created_at || new Date());
      
      // If it was returned recently
      if (i.turn_in_date && iUpdated.getTime() > iCreated.getTime() + 1000) {
        activities.push({
          id: `iss_ret_${i.id}`,
          user,
          action: `Returned firearm: ${firearmName}`,
          time: iUpdated,
          type: "assignment",
        });
      }
      
      // Always show issuance note based on created_at
      activities.push({
        id: `iss_issued_${i.id}`,
        user,
        action: `Issued firearm: ${firearmName}`,
        time: iCreated,
        type: "assignment",
      });
    });

    const sortedActivities = activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limit)
      .map((act) => {
        const diff = Math.floor((new Date().getTime() - new Date(act.time).getTime()) / 60000); // in minutes
        let timeStr = "Just now";
        if (diff > 0 && diff < 60) timeStr = `${diff} mins ago`;
        else if (diff >= 60 && diff < 1440) timeStr = `${Math.floor(diff / 60)} hours ago`;
        else if (diff >= 1440) timeStr = `${Math.floor(diff / 1440)} days ago`;

        return { ...act, time: timeStr };
      });

    return sortedActivities;
  }
}

export default new DashboardService();
