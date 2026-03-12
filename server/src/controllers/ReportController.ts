import { Request, Response, NextFunction } from 'express';
import ReportService from '../services/ReportService.js';
import ApiResponse from '../utils/ApiResponse.js';

class ReportController {
  /**
   * Generate guard report.
   */
  public async guardReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { dateFrom, dateTo, format } = req.query as any;
      const data = await ReportService.generateGuardReport(dateFrom, dateTo);

      if (format === 'csv') {
        const csv = ReportService.generateCSV(data, [
          { key: 'guard_id', header: 'Guard ID' },
          { key: 'name', header: 'Name' },
          { key: 'status', header: 'Status' },
          { key: 'company', header: 'Company' },
          { key: 'date_hired', header: 'Date Hired' },
          { key: 'date_assigned', header: 'Date Assigned' },
        ]);
        res.header('Content-Type', 'text/csv');
        res.attachment('guard_report.csv');
        return res.send(csv);
      }

      return ApiResponse.success(res, data, 'Guard report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate attendance report.
   */
  public async attendanceReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { dateFrom, dateTo, companyId, format } = req.query as any;
      const data = await ReportService.generateAttendanceReport(dateFrom, dateTo, companyId ? Number(companyId) : undefined);

      if (format === 'csv') {
        const csv = ReportService.generateCSV(data, [
          { key: 'date', header: 'Date' },
          { key: 'guard_id', header: 'Guard ID' },
          { key: 'guard_name', header: 'Guard Name' },
          { key: 'company', header: 'Company' },
          { key: 'time_in', header: 'Time In' },
          { key: 'time_out', header: 'Time Out' },
          { key: 'hours_worked', header: 'Hours Worked' },
          { key: 'status', header: 'Status' },
          { key: 'note', header: 'Note' },
        ]);
        res.header('Content-Type', 'text/csv');
        res.attachment('attendance_report.csv');
        return res.send(csv);
      }

      return ApiResponse.success(res, data, 'Attendance report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate firearms report.
   */
  public async firearmReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, status, format } = req.query as any;
      const data = await ReportService.generateFirearmReport(type, status);

      if (format === 'csv') {
        const csv = ReportService.generateCSV(data, [
          { key: 'type', header: 'Type' },
          { key: 'serial_num', header: 'Serial Number' },
          { key: 'exp_of_registration', header: 'Exp. of Registration' },
          { key: 'status', header: 'Status' },
          { key: 'assigned_to', header: 'Assigned To' },
          { key: 'note', header: 'Note' },
        ]);
        res.header('Content-Type', 'text/csv');
        res.attachment('firearms_report.csv');
        return res.send(csv);
      }

      return ApiResponse.success(res, data, 'Firearms report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate company report.
   */
  public async companyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive, format } = req.query as any;
      const data = await ReportService.generateCompanyReport(isActive);

      if (format === 'csv') {
        const flatData = data.map(c => ({
          ...c,
          guards: c.guards.map((g: any) => g.name).join('; '),
        }));

        const csv = ReportService.generateCSV(flatData, [
          { key: 'company_id', header: 'Company ID' },
          { key: 'address', header: 'Address' },
          { key: 'is_active', header: 'Active' },
          { key: 'total_guards', header: 'Total Guards' },
          { key: 'guards', header: 'Guards' },
        ]);
        res.header('Content-Type', 'text/csv');
        res.attachment('company_report.csv');
        return res.send(csv);
      }

      return ApiResponse.success(res, data, 'Company report generated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportController();
