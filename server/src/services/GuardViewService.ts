import User from "../models/User.js";
import Designation from "../models/Designation.js";

class GuardViewService {
  /**
   * Get a single user by ID.
   */
  public async getUserById(id: number) {
    return await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Designation,
          as: "designations",
        },
      ],
    });
  }
}

export default new GuardViewService();
