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
    let is_present = false;
    let is_late = false;
    let is_early_out = false;

    if (hasTimedOut) {
      hoursWorked = faker.number.int({ min: 1, max: 12 });
      timeOut = new Date(timeIn.getTime() + (hoursWorked * 60 * 60 * 1000));

      is_present = true;
      is_late = faker.datatype.boolean({ probability: 0.3 });
      is_early_out = hoursWorked < 6 ? faker.datatype.boolean({ probability: 0.3 }) : false;
    } else {
      // Still on duty — may be late
      is_late = faker.datatype.boolean({ probability: 0.3 });
    }

    // Occasionally generate on_leave records
    const randomChance = faker.number.int({ min: 1, max: 100 });
    if (randomChance > 85) {
      is_present = false;
      is_late = false;
      is_early_out = false;
      timeOut = new Date(timeIn.getTime() + (8 * 60 * 60 * 1000));
      hoursWorked = 0;
      return {
        designation_id: 1,
        time_in: timeIn,
        time_out: timeOut,
        hours_worked: hoursWorked,
        is_present,
        is_late,
        is_early_out,
        note: 'On Leave',
      };
    }

    return {
      designation_id: 1,
      time_in: timeIn,
      time_out: timeOut,
      hours_worked: hoursWorked,
      is_present,
      is_late,
      is_early_out,
      note: faker.datatype.boolean() ? faker.lorem.sentence() : null,
    };
  }
}

export default new AttendanceFactory();
