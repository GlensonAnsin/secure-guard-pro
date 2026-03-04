import { faker } from '@faker-js/faker';
import Attendance from '../../models/Attendance.js';
import Factory from './Factory.js';

class AttendanceFactory extends Factory<Attendance> {
  protected model = Attendance;

  protected definition() {
    const timeIn = faker.date.recent({ days: 30 });
    const timeOut = new Date(timeIn.getTime() + (8 * 60 * 60 * 1000)); // 8 hours later

    return {
      designation_id: 1,
      time_in: timeIn,
      time_out: faker.datatype.boolean() ? timeOut : null,
      hours_worked: faker.datatype.boolean() ? faker.number.int({ min: 4, max: 12 }) : null,
      status: faker.helpers.arrayElement(['present', 'absent', 'late', 'half-day']),
      note: faker.datatype.boolean() ? faker.lorem.sentence() : null,
    };
  }
}

export default new AttendanceFactory();
