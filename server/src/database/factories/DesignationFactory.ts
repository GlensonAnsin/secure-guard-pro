import { faker } from '@faker-js/faker';
import Designation from '../../models/Designation.js';
import Factory from './Factory.js';

class DesignationFactory extends Factory<Designation> {
  protected model = Designation;

  protected definition() {
    const isActive = faker.datatype.boolean({ probability: 0.7 });
    const isDismissed = !isActive && faker.datatype.boolean();
    const isCompleted = !isActive && !isDismissed;

    return {
      user_id: 1,
      company_id: 1,
      day_start: 1, // Monday
      day_end: 5,   // Friday
      shift_in: faker.helpers.arrayElement(['06:00:00', '14:00:00', '22:00:00']),
      shift_out: faker.helpers.arrayElement(['14:00:00', '22:00:00', '06:00:00']),
      date_assigned: faker.date.past({ years: 1 }),
      date_of_dismissal: isDismissed ? faker.date.recent({ days: 90 }) : null,
      last_shift_changes: faker.date.recent({ days: 7 }),
      is_active: isActive,
      is_dismissed: isDismissed,
      is_completed: isCompleted,
      note: faker.datatype.boolean() ? faker.lorem.sentence() : null,
    };
  }
}

export default new DesignationFactory();
