import { faker } from '@faker-js/faker';
import Company from '../../models/Company.js';
import Factory from './Factory.js';

class CompanyFactory extends Factory<Company> {
  protected model = Company;

  protected definition() {
    return {
      name: faker.company.name(),
      address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()}`,
      is_active: true,
      note: faker.datatype.boolean() ? faker.lorem.sentence() : null,
    };
  }
}

export default new CompanyFactory();
