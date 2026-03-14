import { Sequelize, Op } from "sequelize";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Designation from "../models/Designation.js";
import Company from "../models/Company.js";
import FirearmIssuance from "../models/FirearmIssuance.js";
import Firearm from "../models/Firearm.js";
import UserRole from "../models/UserRole.js";
import Role from "../models/Role.js";

class DashboardService {
  /**
   * Get guard stats using boolean flags.
   */
  public async getGuardStats() {
    const guardRole = await Role.findOne({ where: { slug: 'guard' } });
    if (!guardRole) return { meta: { total: 0, available: 0, assigned: 0, on_leave: 0, resigned: 0 } };

    const guardUserIds = await UserRole.findAll({
      where: { role_id: guardRole.id },
      attributes: ['user_id'],
      raw: true,
    });
    const ids = guardUserIds.map((ur: any) => ur.user_id);

    if (ids.length === 0) return { meta: { total: 0, available: 0, assigned: 0, on_leave: 0, resigned: 0 } };

    const stats = await User.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("id")), "total"],
        [Sequelize.literal("COUNT(CASE WHEN is_available = 1 AND is_on_leave = 0 AND is_resigned = 0 THEN 1 END)"), "available"],
        [Sequelize.literal("COUNT(CASE WHEN is_available = 0 AND is_resigned = 0 THEN 1 END)"), "assigned"],
        [Sequelize.literal("COUNT(CASE WHEN is_on_leave = 1 THEN 1 END)"), "on_leave"],
        [Sequelize.literal("COUNT(CASE WHEN is_resigned = 1 THEN 1 END)"), "resigned"],
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
            [Sequelize.literal("COUNT(CASE WHEN is_present = 1 THEN 1 END)"), "present"],
            [Sequelize.literal("COUNT(CASE WHEN is_late = 1 THEN 1 END)"), "late"],
            [Sequelize.literal("COUNT(CASE WHEN is_present = 0 AND is_on_leave = 0 AND time_out IS NOT NULL THEN 1 END)"), "absent"],
          ],
          raw: true,
        });

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
        month: d.getMonth() + 1,
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
    const guardRole = await Role.findOne({ where: { slug: 'guard' } });
    const guardUserIds = guardRole
      ? (await UserRole.findAll({ where: { role_id: guardRole.id }, attributes: ['user_id'], raw: true })).map((ur: any) => ur.user_id)
      : [];

    const recentGuards = guardUserIds.length > 0
      ? await User.findAll({
          where: { id: { [Op.in]: guardUserIds } },
          limit,
          order: [['created_at', 'DESC']],
        })
      : [];

    const recentFirearms = await Firearm.findAll({
      limit,
      order: [['created_at', 'DESC']],
    });

    const recentDesignations = await Designation.findAll({
      limit,
      order: [['updated_at', 'DESC']],
      include: [
        { model: User, as: 'user' },
        { model: Company, as: 'company' },
      ],
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

    // New Guards
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

    // New Firearms
    recentFirearms.forEach((f: any) => {
      const fTime = f.createdAt || f.created_at || new Date();
      activities.push({
        id: `fa_${f.id}`,
        user: "System Admin",
        action: `New firearm added: ${f.serial_num || f.type}`,
        time: fTime,
        type: "assignment",
      });
    });

    // Designations
    recentDesignations.forEach((d: any) => {
      const user = d.user;
      const companyAddress = d.company?.address || 'Unknown Company';
      let actionText = `Assigned to ${companyAddress}`;
      let type = "assignment";
      if (d.is_dismissed) {
        actionText = `Dismissed from ${companyAddress}`;
        type = "alert";
      } else if (d.is_completed) {
        actionText = `Completed designation at ${companyAddress}`;
      } else if (!d.is_active) {
        actionText = `Designation inactive at ${companyAddress}`;
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

    // Firearm Issuances
    recentIssuances.forEach((i: any) => {
      const user = i.user ? `${i.user.first_name} ${i.user.last_name}` : "Unknown";
      const firearmName = i.firearm?.serial_num || i.firearm?.type || "Unknown Firearm";

      const iCreated = new Date(i.createdAt || i.created_at || new Date());
      const iUpdated = new Date(i.updatedAt || i.updated_at || i.createdAt || i.created_at || new Date());

      if (i.turn_in_date && iUpdated.getTime() > iCreated.getTime() + 1000) {
        activities.push({
          id: `iss_ret_${i.id}`,
          user,
          action: `Returned firearm: ${firearmName}`,
          time: iUpdated,
          type: "assignment",
        });
      }

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
        const diff = Math.floor((new Date().getTime() - new Date(act.time).getTime()) / 60000);
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
