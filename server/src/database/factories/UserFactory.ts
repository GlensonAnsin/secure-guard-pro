import { faker } from '@faker-js/faker';
import User from '../../models/User.js';
import Factory from './Factory.js';

const phRegions = [
  'National Capital Region (NCR)',
  'Cordillera Administrative Region (CAR)',
  'Ilocos Region (Region I)',
  'Cagayan Valley (Region II)',
  'Central Luzon (Region III)',
  'CALABARZON (Region IV-A)',
  'MIMAROPA (Region IV-B)',
  'Bicol Region (Region V)',
  'Western Visayas (Region VI)',
  'Central Visayas (Region VII)',
  'Eastern Visayas (Region VIII)',
  'Zamboanga Peninsula (Region IX)',
  'Northern Mindanao (Region X)',
  'Davao Region (Region XI)',
  'SOCCSKSARGEN (Region XII)',
  'Caraga (Region XIII)',
  'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)',
];

const phProvinces = [
  'Metro Manila', 'Cebu', 'Davao del Sur', 'Cavite', 'Laguna', 'Batangas', 'Rizal',
  'Pampanga', 'Bulacan', 'Iloilo', 'Negros Occidental', 'Misamis Oriental',
];

const phCities = [
  'Quezon City', 'Manila', 'Makati', 'Taguig', 'Pasig', 'Cebu City', 'Mandaue',
  'Davao City', 'Antipolo', 'Dasmariñas', 'Bacoor', 'San Jose del Monte', 'Iloilo City',
  'Bacolod', 'Cagayan de Oro',
];

class UserFactory extends Factory<User> {
  protected model = User;

  protected definition() {
    return {
      guard_id: `GRD-${faker.string.alphanumeric(8).toUpperCase()}`,
      first_name: faker.person.firstName(),
      middle_name: faker.person.lastName(),
      last_name: faker.person.lastName(),
      suffix: faker.helpers.arrayElement([null, null, null, 'Jr.', 'Sr.', 'III']),
      street: faker.location.streetAddress(),
      barangay: `Barangay ${faker.number.int({ min: 1, max: 200 })}`,
      city_or_municipality: faker.helpers.arrayElement(phCities),
      province: faker.helpers.arrayElement(phProvinces),
      region: faker.helpers.arrayElement(phRegions),
      email: faker.internet.email(),
      cel_num: `09${faker.string.numeric(9)}`,
      username: faker.internet.username(),
      password: '$2b$10$YourHashedPasswordHere',
      is_available: true,
      is_on_leave: false,
      is_resigned: false,
      date_hired: faker.date.past({ years: 3 }),
    };
  }
}

export default new UserFactory();