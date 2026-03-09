import { faker } from '@faker-js/faker';
import Designation from '../../models/Designation.js';
import Factory from './Factory.js';

const phClients = [
  'SM Supermalls', 'Ayala Malls', 'BDO Unibank', 'Bank of the Philippine Islands (BPI)',
  'Jollibee Foods Corporation', 'Manila Electric Company (MERALCO)', 'PLDT Inc.',
  'Globe Telecom', 'San Miguel Corporation', 'Megaworld Corporation',
  'Robinsons Land Corporation', 'Puregold Price Club, Inc.', 'Mercury Drug Corporation',
];

const phAddresses = [
  'EDSA corner J.W. Diokno Boulevard, Mall of Asia Complex, Pasay City',
  'Ayala Center, Makati City',
  'BGC Corporate Center, Taguig City',
  'Ortigas Center, Pasig City',
  'Cebu Business Park, Cebu City',
  'Abreeza Mall, J.P. Laurel Avenue, Davao City',
  'Limketkai Center, Cagayan de Oro City',
  'Iloilo Business Park, Mandurriao, Iloilo City',
];

class DesignationFactory extends Factory<Designation> {
  protected model = Designation;

  protected definition() {
    return {
      user_id: 1,
      client: faker.helpers.arrayElement(phClients),
      address: faker.helpers.arrayElement(phAddresses),
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
