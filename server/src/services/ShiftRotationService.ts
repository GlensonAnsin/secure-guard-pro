import Designation from '../models/Designation.js';
import Company from '../models/Company.js';
import { Op } from 'sequelize';
import Logger from '../utils/Logger.js';

class ShiftRotationService {
  /**
   * Auto-rotate shifts for all companies where last_shift_changes >= 7 days ago.
   * Guards at the same company swap shifts with each other.
   */
  public async rotateShifts() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find all active designations that need rotation
    const designationsToRotate = await Designation.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { last_shift_changes: { [Op.lte]: sevenDaysAgo } },
          { last_shift_changes: null },
        ],
      },
      order: [['company_id', 'ASC'], ['id', 'ASC']],
    });

    // Group by company
    const byCompany: Record<number, typeof designationsToRotate> = {};
    for (const d of designationsToRotate) {
      const cid = d.company_id;
      if (!byCompany[cid]) byCompany[cid] = [];
      byCompany[cid].push(d);
    }

    let rotatedCount = 0;

    for (const [companyId, designations] of Object.entries(byCompany)) {
      if (designations.length < 2) {
        // Single guard — just update last_shift_changes
        if (designations.length === 1) {
          await designations[0].update({ last_shift_changes: new Date() });
        }
        continue;
      }

      // Rotate shifts: each guard gets the next guard's shift
      const shifts = designations.map(d => ({
        shift_in: d.shift_in,
        shift_out: d.shift_out,
        day_start: d.day_start,
        day_end: d.day_end,
      }));

      for (let i = 0; i < designations.length; i++) {
        const nextIndex = (i + 1) % designations.length;
        await designations[i].update({
          shift_in: shifts[nextIndex].shift_in,
          shift_out: shifts[nextIndex].shift_out,
          day_start: shifts[nextIndex].day_start,
          day_end: shifts[nextIndex].day_end,
          last_shift_changes: new Date(),
        });
      }

      rotatedCount += designations.length;
    }

    Logger.info(`Shift rotation completed. ${rotatedCount} designations rotated.`);
    return { rotatedCount };
  }

  /**
   * Manual shift rotation for a specific company (admin/HR triggered).
   */
  public async manualRotate(companyId: number) {
    const designations = await Designation.findAll({
      where: {
        company_id: companyId,
        is_active: true,
      },
      order: [['id', 'ASC']],
    });

    if (designations.length < 2) {
      // Update last_shift_changes even for single guard
      if (designations.length === 1) {
        await designations[0].update({ last_shift_changes: new Date() });
      }
      return { rotatedCount: designations.length, message: 'Not enough guards to rotate shifts' };
    }

    const shifts = designations.map(d => ({
      shift_in: d.shift_in,
      shift_out: d.shift_out,
      day_start: d.day_start,
      day_end: d.day_end,
    }));

    for (let i = 0; i < designations.length; i++) {
      const nextIndex = (i + 1) % designations.length;
      await designations[i].update({
        shift_in: shifts[nextIndex].shift_in,
        shift_out: shifts[nextIndex].shift_out,
        day_start: shifts[nextIndex].day_start,
        day_end: shifts[nextIndex].day_end,
        last_shift_changes: new Date(),
      });
    }

    return { rotatedCount: designations.length };
  }

  /**
   * Get shift rotation status for all companies.
   */
  public async getRotationStatus() {
    const companies = await Company.findAll({
      where: { is_active: true },
      include: [
        {
          model: Designation,
          as: 'designations',
          where: { is_active: true },
          required: false,
        },
      ],
    });

    return companies.map((c: any) => {
      const designations = c.designations || [];
      const lastChanged = designations.reduce((latest: Date | null, d: any) => {
        if (!d.last_shift_changes) return latest;
        const date = new Date(d.last_shift_changes);
        return !latest || date > latest ? date : latest;
      }, null);

      const nextRotation = lastChanged
        ? new Date(new Date(lastChanged).getTime() + 7 * 24 * 60 * 60 * 1000)
        : null;

      return {
        company_id: c.id,
        name: c.name,
        address: c.address,
        guard_count: designations.length,
        last_rotation: lastChanged,
        next_rotation: nextRotation,
      };
    });
  }
}

export default new ShiftRotationService();
