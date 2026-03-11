import { faker } from '@faker-js/faker';
import Company from '../../models/Company.js';
import Factory from './Factory.js';

const phCompanyAddresses = [
  'EDSA corner J.W. Diokno Boulevard, Mall of Asia Complex, Pasay City',
  'Ayala Center, Makati City',
  'BGC Corporate Center, 30th Street, Taguig City',
  'Ortigas Center, Julia Vargas Ave, Pasig City',
  'Cebu Business Park, Cardinal Rosales Ave, Cebu City',
  'Abreeza Mall, J.P. Laurel Avenue, Davao City',
  'Limketkai Center, Lapasan Highway, Cagayan de Oro City',
  'Iloilo Business Park, Mandurriao, Iloilo City',
  'SM City Clark, M.A. Roxas Highway, Mabalacat, Pampanga',
  'Robinsons Galleria South, Alabang-Zapote Road, Muntinlupa City',
];

class CompanyFactory extends Factory<Company> {
  protected model = Company;

  protected definition() {
    return {
      address: faker.helpers.arrayElement(phCompanyAddresses),
      is_active: true,
      note: faker.datatype.boolean() ? faker.lorem.sentence() : null,
    };
  }
}

export default new CompanyFactory();
