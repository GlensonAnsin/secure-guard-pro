import { faker } from '@faker-js/faker';
import Attendance from '../../models/Attendance.js';
import Factory from './Factory.js';

class AttendanceFactory extends Factory<Attendance> {
  protected model = Attendance;

  protected definition() {
    const timeIn = faker.date.recent({ days: 30 });
    const hasTimedOut = faker.datatype.boolean();
    
    let timeOut = null;
    let hoursWorked = null;
    let status = 'on_duty'; // Default if not timed out

    if (hasTimedOut) {
      // Simulate 1 to 12 hours worked
      hoursWorked = faker.number.int({ min: 1, max: 12 });
      timeOut = new Date(timeIn.getTime() + (hoursWorked * 60 * 60 * 1000));
      
      // Based on MobileService timeOut logic
      if (hoursWorked < 4) {
        status = 'half_day';
      } else {
        status = 'present';
      }
    } else {
       // Note: In a real system, 'late' might be determined by comparing time_in to designation.shift_in.
       // For the seeder, we can randomly assign 'late' instead of 'on_duty' to show it in stats.
       if (faker.datatype.boolean()) {
           status = 'late';
       }
    }

    // Occasionally generate an absent or on_leave record
    const randomStatusChance = faker.number.int({ min: 1, max: 100 });
    if (randomStatusChance > 90) {
       status = 'absent';
       timeOut = new Date(timeIn.getTime() + (8 * 60 * 60 * 1000));
       hoursWorked = 0;
    } else if (randomStatusChance > 80) {
       status = 'on_leave';
       timeOut = new Date(timeIn.getTime() + (8 * 60 * 60 * 1000));
       hoursWorked = 0;
    }

    return {
      designation_id: 1,
      time_in: timeIn,
      time_out: timeOut,
      hours_worked: hoursWorked,
      status: status,
      note: faker.datatype.boolean() ? faker.lorem.sentence() : null,
    };
  }
}

export default new AttendanceFactory();
