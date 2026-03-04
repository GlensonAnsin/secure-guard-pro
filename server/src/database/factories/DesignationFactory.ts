import { faker } from '@faker-js/faker';
import Designation from '../../models/Designation.js';
import Factory from './Factory.js';

class DesignationFactory extends Factory<Designation> {
  protected model = Designation;

  protected definition() {
    return {
      user_id: 1,
      client: faker.company.name(),
      address: faker.location.streetAddress({ useFullAddress: true }),
      shift_in: '06:00:00',
      shift_out: '18:00:00',
      date_assigned: faker.date.past({ years: 1 }),
      date_of_dismissal: faker.datatype.boolean() ? faker.date.recent({ days: 90 }) : null,
      status: faker.helpers.arrayElement(['active', 'completed', 'dismissed']),
      note: faker.datatype.boolean() ? faker.lorem.sentence() : null,
    };
  }
}

export default new DesignationFactory();
