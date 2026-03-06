import { Sequelize } from "sequelize";
import User from "../models/User.js";

class DashboardService {
  /**
   * Get overall statistics for all guards.
   */
  public async getGuardStats() {
    const stats = await User.findAll({
      where: {
        role: "guard",
      },
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("id")), "total"],
        [
          Sequelize.literal("COUNT(CASE WHEN status = 'active' THEN 1 END)"),
          "active",
        ],
        [
          Sequelize.literal(
            "COUNT(CASE WHEN status = 'unassigned' THEN 1 END)",
          ),
          "unassigned",
        ],
        [
          Sequelize.literal("COUNT(CASE WHEN status = 'on_leave' THEN 1 END)"),
          "on_leave",
        ],
        [
          Sequelize.literal("COUNT(CASE WHEN status = 'inactive' THEN 1 END)"),
          "inactive",
        ],
      ],
      raw: true,
    });
    return { meta: stats[0] };
  }
}

export default new DashboardService();
