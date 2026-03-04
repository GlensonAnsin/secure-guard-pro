import { faker } from '@faker-js/faker';
import User from '../../models/User.js';
import Factory from './Factory.js';

class UserFactory extends Factory<User> {
  protected model = User;

  protected definition() {
    return {
      guard_id: `GRD-${faker.string.alphanumeric(8).toUpperCase()}`,
      first_name: faker.person.firstName(),
      middle_name: faker.person.middleName(),
      last_name: faker.person.lastName(),
      suffix: null,
      role: 'guard',
      street: faker.location.streetAddress(),
      barangay: faker.location.street(),
      city_or_municipality: faker.location.city(),
      province: faker.location.state(),
      region: faker.location.state(),
      email: faker.internet.email(),
      cel_num: faker.string.numeric(11),
      username: faker.internet.username(),
      password: '$2b$10$YourHashedPasswordHere',
      status: 'active',
      date_hired: faker.date.past({ years: 3 }),
    };
  }

  public admin() {
    return {
      role: 'admin',
    };
  }
}

export default new UserFactory();