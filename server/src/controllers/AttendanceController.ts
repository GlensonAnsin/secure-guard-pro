import { Request, Response, NextFunction } from 'express';
import AttendanceService from '../services/AttendanceService.js';
import ApiResponse from '../utils/ApiResponse.js';

class AttendanceController {
  /**
   * Get paginated list of attendances.
   */
  public async index(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 15;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const date = req.query.date as string;
      const attendances = await AttendanceService.getAllAttendances(page, limit, search, status, date);
      return ApiResponse.success(res, attendances, 'Attendances retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export attendances to CSV.
   */
  public async export(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const status = req.query.status as string;
      const date = req.query.date as string;
      const attendances = await AttendanceService.exportAttendances(search, status, date);
      
      let csv = 'Date,Guard ID,Guard Name,Location,Time In,Time Out,Hours,Status,Note\n';
      
      attendances.forEach((record: any) => {
        const timeInDate = record.time_in ? new Date(record.time_in) : null;
        const timeOutDate = record.time_out ? new Date(record.time_out) : null;
        
        // Use explicit formatting to make strings shorter
        const dateStr = timeInDate ? `${timeInDate.getFullYear()}-${String(timeInDate.getMonth() + 1).padStart(2, '0')}-${String(timeInDate.getDate()).padStart(2, '0')}` : '';
        
        const formatTime = (d: Date) => {
          let h = d.getHours();
          const m = String(d.getMinutes()).padStart(2, '0');
          const ampm = h >= 12 ? 'PM' : 'AM';
          h = h % 12 || 12;
          return `${h}:${m} ${ampm}`;
        };
        
        const timeInStr = timeInDate ? formatTime(timeInDate) : '';
        const timeOutStr = timeOutDate ? formatTime(timeOutDate) : '';
        
        const guardId = record.designation?.user?.guard_id || `User-${record.designation?.user?.id || 'Unknown'}`;
        const guardName = record.designation?.user ? `${record.designation.user.first_name} ${record.designation.user.last_name}` : 'Unknown';
        const location = record.designation?.address || '';
        
        const cleanNote = record.note ? record.note.replace(/"/g, '""').replace(/\n/g, ' ') : '';
        
        csv += `"${dateStr}","${guardId}","${guardName}","${location}","${timeInStr}","${timeOutStr}","${record.hours_worked || ''}","${record.status}","${cleanNote}"\n`;
      });

      res.header('Content-Type', 'text/csv');
      res.attachment('attendance_report.csv');
      return res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single attendance by ID.
   */
  public async show(req: Request, res: Response, next: NextFunction) {
    try {
      const attendance = await AttendanceService.getAttendanceById(Number(req.params.id));
      if (!attendance) return ApiResponse.error(res, 'Attendance not found', 404);
      return ApiResponse.success(res, attendance, 'Attendance retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new attendance.
   */
  public async store(req: Request, res: Response, next: NextFunction) {
    try {
      const attendance = await AttendanceService.createAttendance(req.body);
      return ApiResponse.success(res, attendance, 'Attendance created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an attendance.
   */
  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const attendance = await AttendanceService.updateAttendance(Number(req.params.id), req.body);
      return ApiResponse.success(res, attendance, 'Attendance updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an attendance.
   */
  public async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      await AttendanceService.deleteAttendance(Number(req.params.id));
      return ApiResponse.success(res, null, 'Attendance deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get attendance stats.
   */
  public async getAttendanceStats(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string;
      const stats = await AttendanceService.getAttendanceStats(date);
      return ApiResponse.success(res, stats, 'Stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AttendanceController();
