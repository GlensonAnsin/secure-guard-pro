import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Designation from '../models/Designation.js';
import Company from '../models/Company.js';
import Firearm from '../models/Firearm.js';
import FirearmIssuance from '../models/FirearmIssuance.js';
import UserRole from '../models/UserRole.js';
import Role from '../models/Role.js';
import { Op, Sequelize } from 'sequelize';

class ReportService {
  /**
   * Guard summary report.
   */
  public async generateGuardReport(dateFrom?: string, dateTo?: string) {
    const guardRole = await Role.findOne({ where: { slug: 'guard' } });
    if (!guardRole) return [];

    const guardUserIds = (await UserRole.findAll({
      where: { role_id: guardRole.id },
      attributes: ['user_id'],
      raw: true,
    })).map((ur: any) => ur.user_id);

    if (guardUserIds.length === 0) return [];

    const guards = await User.findAll({
      where: { id: { [Op.in]: guardUserIds } },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Designation,
          as: 'designations',
          include: [{ model: Company, as: 'company' }],
        },
      ],
      order: [['last_name', 'ASC'], ['first_name', 'ASC']],
    });

    return guards.map((g: any) => {
      const activeDesignation = g.designations?.find((d: any) => d.is_active);
      let status = 'Available';
      if (g.is_resigned) status = 'Resigned';
      else if (g.is_on_leave) status = 'On Leave';
      else if (!g.is_available) status = 'Assigned';

      return {
        guard_id: g.guard_id,
        name: `${g.last_name}, ${g.first_name} ${g.middle_name || ''}`.trim(),
        status,
        company: activeDesignation?.company?.address || 'N/A',
        date_hired: g.date_hired,
        date_assigned: activeDesignation?.date_assigned || 'N/A',
      };
    });
  }

  /**
   * Attendance report (CSV data).
   */
  public async generateAttendanceReport(dateFrom?: string, dateTo?: string, companyId?: number) {
    const where: any = {};

    if (dateFrom && dateTo) {
      where.time_in = {
        [Op.gte]: new Date(`${dateFrom}T00:00:00.000Z`),
        [Op.lte]: new Date(`${dateTo}T23:59:59.999Z`),
      };
    } else if (dateFrom) {
      where.time_in = { [Op.gte]: new Date(`${dateFrom}T00:00:00.000Z`) };
    }

    const designationWhere: any = {};
    if (companyId) {
      designationWhere.company_id = companyId;
    }

    const attendances = await Attendance.findAll({
      where,
      include: [
        {
          model: Designation,
          as: 'designation',
          where: Object.keys(designationWhere).length > 0 ? designationWhere : undefined,
          include: [
            { model: User, as: 'user', attributes: { exclude: ['password'] } },
            { model: Company, as: 'company' },
          ],
        },
      ],
      order: [['time_in', 'DESC']],
    });

    return attendances.map((a: any) => {
      const statuses: string[] = [];
      if (a.is_present) statuses.push('Present');
      if (a.is_late) statuses.push('Late');
      if (a.is_early_out) statuses.push('Early Out');
      if (a.is_on_leave) statuses.push('On Leave');
      if (statuses.length === 0 && !a.time_out) statuses.push('On Duty');

      return {
        date: a.time_in,
        guard_id: a.designation?.user?.guard_id || '',
        guard_name: a.designation?.user ? `${a.designation.user.last_name}, ${a.designation.user.first_name}` : 'Unknown',
        company: a.designation?.company?.address || '',
        time_in: a.time_in,
        time_out: a.time_out,
        hours_worked: a.hours_worked || 0,
        status: statuses.join(', '),
        note: a.note || '',
      };
    });
  }

  /**
   * Firearms report.
   */
  public async generateFirearmReport() {
    const firearms = await Firearm.findAll({
      include: [
        {
          model: FirearmIssuance,
          as: 'issuances',
          include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'guard_id'] }],
        },
      ],
      order: [['type', 'ASC']],
    });

    return firearms.map((f: any) => {
      const statuses: string[] = [];
      if (f.is_available) statuses.push('Available');
      if (f.is_damaged) statuses.push('Damaged');
      if (f.is_maintenance) statuses.push('Maintenance');
      if (f.is_expiring) statuses.push('Expiring');
      if (f.is_expired) statuses.push('Expired');
      if (!f.is_available && !f.is_expired) statuses.push('Issued');

      const activeIssuance = f.issuances?.find((i: any) => !i.turn_in_date);

      return {
        type: f.type,
        serial_num: f.serial_num,
        exp_of_registration: f.exp_of_registration,
        status: statuses.join(', '),
        assigned_to: activeIssuance?.user ? `${activeIssuance.user.first_name} ${activeIssuance.user.last_name}` : 'N/A',
        note: f.note || '',
      };
    });
  }

  /**
   * Company report with guard count and hours.
   */
  public async generateCompanyReport() {
    const companies = await Company.findAll({
      include: [
        {
          model: Designation,
          as: 'designations',
          include: [
            { model: User, as: 'user', attributes: { exclude: ['password'] } },
          ],
        },
      ],
      order: [['id', 'ASC']],
    });

    return companies.map((c: any) => {
      const activeDesignations = c.designations?.filter((d: any) => d.is_active) || [];
      return {
        company_id: c.id,
        address: c.address,
        is_active: c.is_active,
        total_guards: activeDesignations.length,
        guards: activeDesignations.map((d: any) => ({
          guard_id: d.user?.guard_id,
          name: d.user ? `${d.user.first_name} ${d.user.last_name}` : 'Unknown',
          shift: `${d.shift_in} - ${d.shift_out}`,
          date_assigned: d.date_assigned,
        })),
      };
    });
  }

  /**
   * Generate CSV string from report data.
   */
  public generateCSV(data: any[], columns: { key: string; header: string }[]): string {
    const headers = columns.map(c => c.header).join(',');
    const rows = data.map(row =>
      columns.map(c => {
        const val = row[c.key] ?? '';
        const str = String(val).replace(/"/g, '""').replace(/\n/g, ' ');
        return `"${str}"`;
      }).join(',')
    );
    return [headers, ...rows].join('\n');
  }
}

export default new ReportService();
